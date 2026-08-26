#!/usr/bin/env node
/**
 * gen-data — writes `src/data/profiles/<id>.transactions.csv` for every persona in src/data/profiles/specs.ts.
 *
 *   npm run gen:data        (Node ≥ 22.18: the specs are loaded through Node's native TypeScript type stripping)
 *
 * What goes in the CSV (arch spec § Mock data): the seeded noise plus the relative anchors — coffee ×N and
 * lunch ×N per month, the apparel and entertainment buys, and the prior-trip cluster. Calendar-anchored rows
 * (biweekly payroll ending at now+3, rent on the 1st, subscriptions on fixed days with year-ago prices) stay
 * generated at runtime in src/data/mockUser.ts because their meaning is calendar-based.
 *
 * Every row is keyed by `days_ago` — the file never contains a calendar date — so the history is correct in any
 * week. Month-to-date correctness: the trailing 31 days are laid at each category's runRate/30.44 per day and the
 * older history at usual/30.44 (with mild month-to-month drift), so on any date the current-month sum
 * ≈ runRate × elapsed/daysInMonth, which is what engine/paces.ts assumes.
 *
 * Columns: days_ago,amount,merchant,account,category,detailed,tags
 *   account = checking | savings | brokerage | <cardId>;  category = engine SpendCategory;  detailed = Plaid PFC;
 *   tags = `|`-joined anchor hints (coffee, lunch, apparel, sneakers, boots, tickets, trip, flight, stay, food, local).
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const [major, minor] = process.versions.node.split('.').map(Number)
if (major < 22 || (major === 22 && minor < 18)) {
  console.error(`gen-data: Node ≥ 22.18 is required (the profile specs are TypeScript, loaded natively); you are on ${process.versions.node}.`)
  process.exit(1)
}
const { SPECS } = await import('../src/data/profiles/specs.ts')
const { makeRng } = await import('../src/data/seed.ts')

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'src', 'data', 'profiles')

/** Mean month length. Per-day rates divide by it so a calendar month's sum lands within a few percent of the target. */
const MONTH = 30.44
const MONTHS = 14
/** days_ago runs 0 … HORIZON-1 (14 trailing months). */
const HORIZON = Math.round(MONTHS * MONTH)
/** Trailing window generated at runRate — 31 days so it always covers the whole current calendar month. */
const RECENT = 31
/** Noise + habit rows per month the ticket sizes are scaled to (≈1,200–1,600 rows per profile over 14 months). */
const TARGET_ROWS_PER_MONTH = 95
const NOISE_CATS = ['dining', 'groceries', 'transport', 'shopping', 'entertainment', 'other']
/** Base ticket ranges (before the per-profile scale); draws are skewed small, so the mean sits a third of the way up. */
const TICKET = { dining: [9, 38], groceries: [18, 95], transport: [4, 28], shopping: [12, 70], entertainment: [9, 38], other: [5, 45] }
/**
 * engine/behavior.ts impulse thresholds — shopping ≥ $75, entertainment ≥ $40, everything else ≥ $50 — and
 * duplicate_check's ≥ $50: noise tickets stay below them so the quarter dot-strip and the duplicate finder are
 * driven by the hand-authored anchors only (groceries has no such card; its cap just keeps a weekly shop under $96).
 */
const CAP = { dining: 49.5, groceries: 96, transport: 49.5, shopping: 74, entertainment: 39.5, other: 49.5 }
/** Plaid PFC detailed per engine category (mirrors src/data/plaid.ts). */
const PFC = {
  dining: 'FOOD_AND_DRINK_RESTAURANT', groceries: 'FOOD_AND_DRINK_GROCERIES', transport: 'TRANSPORTATION_TAXIS_AND_RIDE_SHARES',
  shopping: 'GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES', entertainment: 'ENTERTAINMENT_MUSIC_AND_AUDIO',
  travel: 'TRAVEL_FLIGHTS', other: 'GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE',
}
/** Fallback merchant pools (Boston); a spec's optional `merchants` overrides per category. */
const DEFAULT_MERCHANTS = {
  dining: ['Sweetgreen', 'Toro', 'Pho Pasteur', 'Tatte Bakery', 'Mei Mei', 'Blue Bottle Coffee', 'Neptune Oyster', 'Dumpling House', "Anna's Taqueria", 'Row 34'],
  groceries: ["Trader Joe's", 'Whole Foods', 'Star Market', 'H Mart', 'Harvest Co-op'],
  transport: ['Uber', 'Lyft', 'MBTA', 'Bluebikes', 'Shell'],
  shopping: ['Amazon', 'Uniqlo', 'Target', 'Sephora', 'Nike'],
  entertainment: ['AMC Theatres', 'Sunset Cinema', 'MFA Boston', 'Ticketmaster', 'Steam'],
  other: ['CVS', 'USPS', 'Bluebikes', 'Walgreens', 'Etsy'],
}

const round2 = (n) => Math.round(n * 100) / 100
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))
const uniq = (a) => [...new Set(a)]

/** Scale ticket sizes per profile so a $260/month diner and a $950/month diner both land near the row target. */
function ticketScale(spec) {
  const habitRows = spec.habits.coffee.visitsPerMonth + spec.habits.lunch.visitsPerMonth
  const meanTicket = (cat) => { const [lo, hi] = TICKET[cat]; return lo + (hi - lo) / 3 }
  const rowsAtUnitScale = NOISE_CATS.reduce((a, c) => a + spec.baselines[c].usual / meanTicket(c), 0)
  return clamp(round2(rowsAtUnitScale / Math.max(30, TARGET_ROWS_PER_MONTH - habitRows)), 0.6, 1.4)
}

function generate(spec) {
  const rng = makeRng(spec.seed)
  const rows = []
  const add = (daysAgo, amount, merchant, account, category, tags = []) => rows.push({ daysAgo, amount: round2(amount), merchant, account, category, tags })

  const cards = spec.cards
  const flat = (cards.find((c) => c.isFlatHouseCard) ?? cards[0]).id
  const diningCard = (cards.find((c) => (c.bonus.dining ?? 0) > 1) ?? cards[0]).id
  const travelCard = (cards.find((c) => c.benefits.tripProtection) ?? cards[0]).id
  const lastCard = cards[cards.length - 1].id
  const diningAccts = uniq([diningCard, travelCard, flat])
  if (diningAccts.length < 2) diningAccts.push(...uniq([lastCard, 'checking']).filter((x) => !diningAccts.includes(x)))
  const otherAccts = uniq([flat, lastCard, 'checking'])

  // ---- Relative anchors ----
  // Coffee / lunch habits: a steady cadence of visitsPerMonth, phase-locked (no jitter) inside the trailing month so
  // the month-to-date visit count is stable; ±1 day of jitter beyond it.
  const habit = (h, phase, tag) => {
    const step = MONTH / h.visitsPerMonth
    for (let k = 0; ; k++) {
      let d = Math.round(phase + k * step)
      if (d >= HORIZON) break
      if (d > RECENT) d += rng.int(-1, 1)
      add(d, rng.range(h.ticket[0], h.ticket[1]), h.merchant, diningCard, 'dining', [tag])
    }
  }
  habit(spec.habits.coffee, 1, 'coffee')
  habit(spec.habits.lunch, 2, 'lunch')
  spec.habits.apparel.forEach((a) => add(a.daysAgo, a.amount, a.merchant, flat, 'shopping', ['apparel', ...a.tags]))
  spec.habits.entertainment.forEach((a) => add(a.daysAgo, a.amount, a.merchant, flat, 'entertainment', ['tickets', ...a.tags]))
  // Prior trip cluster: flight booked five weeks ahead, the stay two days before, food/local during the trip.
  const T = spec.priorTrip, tripDay = Math.round(T.monthsAgo * MONTH)
  add(tripDay + 35, T.flight, 'JetBlue', travelCard, 'travel', ['trip', 'flight'])
  add(tripDay + 2, T.around.stay, 'Airbnb', travelCard, 'travel', ['trip', 'stay'])
  rng.split(T.around.food, T.foodMerchants.length).forEach((a, i) => add(tripDay - i, a, T.foodMerchants[i], travelCard, 'dining', ['trip', 'food']))
  rng.split(T.around.local, T.localMerchants.length).forEach((a, i) => add(tripDay - i, a, T.localMerchants[i], travelCard, 'transport', ['trip', 'local']))

  // ---- Seeded noise: a daily budget accumulator per category ----
  // Each day adds rate − anchors-that-day to a running budget and emits small tickets while it covers them, so the
  // cumulative spend over ANY window tracks rate × days to within about one ticket.
  const scale = ticketScale(spec)
  const ticket = (cat) => {
    const [lo, hi] = TICKET[cat]
    const min = lo * scale, max = Math.min(hi * scale, CAP[cat])
    const r = rng.next()
    return round2(min + (max - min) * r * r)
  }
  const habits = [spec.habits.coffee.merchant, spec.habits.lunch.merchant]
  const pool = (cat) => (spec.merchants?.[cat] ?? DEFAULT_MERCHANTS[cat]).filter((m) => !habits.includes(m))
  // Older months drift ±12% around `usual` (block 0 is the runRate window and stays at 1).
  const drift = Array.from({ length: Math.ceil(HORIZON / 30) + 1 }, (_, i) => (i === 0 ? 1 : rng.range(0.88, 1.12)))
  for (const cat of NOISE_CATS) {
    const b = spec.baselines[cat]
    const merchants = pool(cat)
    const accts = cat === 'groceries' ? ['checking'] : cat === 'dining' ? diningAccts : otherAccts
    // Anchors debit the budget over a window centred on themselves, just wide enough to absorb the amount at this
    // category's rate — so a $210 ticket pauses noise around it instead of starving the weeks after it, and any
    // ~30-day window that cuts through the pause is off by at most half the anchor.
    const anchored = new Float64Array(HORIZON)
    for (const r of rows) {
      if (r.category !== cat || r.daysAgo >= HORIZON) continue
      const rate = Math.max(1, (r.daysAgo < RECENT ? b.runRate : b.usual) / MONTH)
      const h = Math.ceil(r.amount / (2 * rate))
      const lo = Math.max(0, r.daysAgo - h), hi = Math.min(HORIZON - 1, r.daysAgo + h)
      for (let d = lo; d <= hi; d++) anchored[d] += r.amount / (hi - lo + 1)
    }
    let budget = 0, pending = ticket(cat)
    for (let d = HORIZON - 1; d >= 0; d--) {
      const rate = d < RECENT ? b.runRate / MONTH : (b.usual / MONTH) * drift[Math.floor(d / 30)]
      budget += rate - anchored[d]
      while (budget >= pending / 2) {
        add(d, pending, rng.pick(merchants), rng.pick(accts), cat)
        budget -= pending
        pending = ticket(cat)
      }
    }
  }
  return { rows, scale }
}

// ---- CSV ----
const HEADER = 'days_ago,amount,merchant,account,category,detailed,tags'
const esc = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)
const toLine = (r) => [r.daysAgo, r.amount.toFixed(2), esc(r.merchant), r.account, r.category, PFC[r.category], r.tags.join('|')].join(',')

// ---- Summary: does the current calendar month land on target today? ----
const now = new Date()
const elapsed = now.getDate()
const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
const sum = (rows, pred) => round2(rows.filter(pred).reduce((a, r) => a + r.amount, 0))
const fmt = (n, w = 8) => String(Math.round(n)).padStart(w)

console.log(`gen-data · today ${now.toISOString().slice(0, 10)} (day ${elapsed} of ${dim}) · horizon ${HORIZON} days`)
for (const spec of SPECS) {
  const { rows, scale } = generate(spec)
  const text = [HEADER, ...rows.map(toLine)].join('\n') + '\n'
  const file = path.join(OUT_DIR, `${spec.id}.transactions.csv`)
  writeFileSync(file, text)
  const gz = gzipSync(Buffer.from(text), { level: 9 }).length
  console.log(`\n${spec.id}: ${rows.length} rows → ${path.relative(ROOT, file)} (${(text.length / 1024).toFixed(1)} KB raw, ${(gz / 1024).toFixed(1)} KB gz) · ticket scale ×${scale}`)
  console.log(`  ${'category'.padEnd(14)}${'MTD'.padStart(8)}${'target'.padStart(8)}${'30d'.padStart(8)}${'runRate'.padStart(8)}${'older/mo'.padStart(10)}${'usual'.padStart(8)}${'rows/mo'.padStart(9)}`)
  for (const cat of [...NOISE_CATS, 'travel']) {
    const b = spec.baselines[cat]
    const mtd = sum(rows, (r) => r.category === cat && r.daysAgo < elapsed)
    const last30 = sum(rows, (r) => r.category === cat && r.daysAgo < 30)
    const older = sum(rows, (r) => r.category === cat && r.daysAgo >= RECENT) / ((HORIZON - RECENT) / MONTH)
    const perMonth = rows.filter((r) => r.category === cat).length / MONTHS
    console.log(`  ${cat.padEnd(14)}${fmt(mtd)}${fmt((b.runRate * elapsed) / dim)}${fmt(last30)}${fmt(b.runRate * (30 / MONTH))}${fmt(older, 10)}${fmt(b.usual)}${perMonth.toFixed(1).padStart(9)}`)
  }
  const visits = (tag) => rows.filter((r) => r.tags.includes(tag) && r.daysAgo < elapsed).length
  console.log(`  habits this month: ${spec.habits.coffee.merchant} ×${visits('coffee')} (spec ${spec.habits.coffee.visitsPerMonth}/mo), ${spec.habits.lunch.merchant} ×${visits('lunch')} (spec ${spec.habits.lunch.visitsPerMonth}/mo)`)
}
