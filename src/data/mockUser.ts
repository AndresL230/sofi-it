/**
 * Plaid-shaped mock user (the "one adapter from real" story).
 * Shapes follow Plaid's /accounts/get + /transactions/sync responses closely enough that
 * plaidAdapter.ts is the only thing that would change with a live Item.
 *
 * Everything is generated relative to `now`: paydays, rent, subscription charges, the
 * month-to-date spend, the quarter's apparel buys, the prior trip cluster.
 * Noise transactions come from a seeded PRNG (seed 42); anchors are hand-authored on top.
 */
import { makeRng } from './seed'
import { buildBaselines } from './baselines'
import type { ProfileSpec } from './spec'
import { addDays, addMonths, daysInMonth, iso, startOfMonth, startOfDay } from '@/lib/dates'
import type { SpendCategory } from '@/types'

export interface PlaidBalances { available: number | null; current: number; limit: number | null; iso_currency_code: 'USD' }
export interface PlaidAccount {
  account_id: string; name: string; official_name: string; mask: string
  type: 'depository' | 'credit' | 'investment'; subtype: 'checking' | 'savings' | 'credit card' | 'brokerage'
  balances: PlaidBalances
  /** SoFi-specific extension: savings vaults. */
  vaults?: { name: string; balance: number }[]
}
export interface PlaidTransaction {
  transaction_id: string; account_id: string; amount: number; iso_currency_code: 'USD'
  date: string; authorized_date: string; merchant_name: string | null; name: string; pending: boolean
  personal_finance_category: { primary: string; detailed: string; confidence_level: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' }
  /** Demo-only hint so the adapter can keep anchor semantics (e.g. prior-trip cluster). */
  _tags?: string[]
}
export interface PlaidResponse { accounts: PlaidAccount[]; transactions: PlaidTransaction[]; request_id: string }

export const accountIds = (spec: ProfileSpec) => ({
  checking: `acc_chk_${spec.accounts.masks.checking}`, savings: `acc_sav_${spec.accounts.masks.savings}`, brokerage: `acc_inv_${spec.accounts.masks.brokerage}`,
  card: (id: string) => `acc_cc_${id}`,
})

// Plaid PFC mapping per engine spend category
const PFC: Record<SpendCategory, { primary: string; detailed: string }> = {
  dining: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_RESTAURANT' },
  groceries: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
  transport: { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_TAXIS_AND_RIDE_SHARES' },
  shopping: { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES' },
  entertainment: { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_MUSIC_AND_AUDIO' },
  subscriptions: { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_TV_AND_MOVIES' },
  housing: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
  travel: { primary: 'TRAVEL', detailed: 'TRAVEL_FLIGHTS' },
  other: { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE' },
  income: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
  transfer: { primary: 'TRANSFER_OUT', detailed: 'TRANSFER_OUT_SAVINGS' },
}

const MERCHANTS: Record<Exclude<SpendCategory, 'income' | 'transfer' | 'housing' | 'subscriptions'>, string[]> = {
  dining: ['Sweetgreen', 'Toro', 'Pho Pasteur', 'Tatte Bakery', 'Mei Mei', 'Blue Bottle Coffee', 'Neptune Oyster', 'Dumpling House', 'Anna\'s Taqueria', 'Row 34'],
  groceries: ['Trader Joe\'s', 'Whole Foods', 'Star Market', 'H Mart', 'Harvest Co-op'],
  transport: ['Uber', 'Lyft', 'MBTA', 'Bluebikes', 'Shell'],
  shopping: ['Amazon', 'Uniqlo', 'Target', 'Sephora', 'Nike'],
  entertainment: ['AMC Theatres', 'Sunset Cinema', 'MFA Boston', 'Ticketmaster', 'Steam'],
  travel: ['JetBlue', 'Airbnb', 'Amtrak'],
  other: ['CVS', 'USPS', 'Bluebikes', 'Walgreens', 'Etsy'],
}

let txCounter = 0
const tid = () => `txn_${(++txCounter).toString(36).padStart(6, '0')}`

export function buildPlaidResponse(spec: ProfileSpec, now = new Date()): PlaidResponse {
  txCounter = 0
  const rng = makeRng(spec.seed)
  const IDS = accountIds(spec)
  const BASELINES = buildBaselines(spec)
  const SUBSCRIPTIONS = spec.subscriptions
  const PAYROLL = spec.payroll, RENT = spec.rent, PRIOR_TRIP = spec.priorTrip
  const cardAcct = (i: number) => IDS.card(spec.cards[Math.min(i, spec.cards.length - 1)].id)
  const flatAcct = IDS.card((spec.cards.find((c) => c.isFlatHouseCard) ?? spec.cards[0]).id)
  const diningAcct = IDS.card((spec.cards.find((c) => (c.bonus.dining ?? 0) > 1) ?? spec.cards[0]).id)
  const travelAcct = IDS.card((spec.cards.find((c) => c.benefits.tripProtection) ?? spec.cards[0]).id)
  const today = startOfDay(now)
  const horizonStart = addMonths(startOfMonth(today), -13)
  const txns: PlaidTransaction[] = []
  const push = (t: Omit<PlaidTransaction, 'transaction_id' | 'iso_currency_code' | 'pending' | 'authorized_date' | 'name'> & { name?: string }) =>
    txns.push({ transaction_id: tid(), iso_currency_code: 'USD', pending: false, authorized_date: t.date, name: t.name ?? (t.merchant_name ?? 'Payment'), ...t })
  const spend = (cat: SpendCategory, merchant: string, amount: number, date: Date, accountId: string = flatAcct, tags?: string[]) =>
    push({ account_id: accountId, amount: Math.round(amount * 100) / 100, date: iso(date), merchant_name: merchant, personal_finance_category: { ...PFC[cat], confidence_level: 'VERY_HIGH' }, _tags: tags })

  // ---- Payroll: biweekly, next one in 3 days ----
  const nextPayday = addDays(today, PAYROLL.daysUntilNext)
  for (let d = nextPayday; d >= horizonStart; d = addDays(d, -PAYROLL.intervalDays)) {
    if (d <= today) push({ account_id: IDS.checking, amount: -PAYROLL.amount, date: iso(d), merchant_name: `${PAYROLL.employer} Payroll`, name: `${PAYROLL.employer.toUpperCase()} DIRECT DEP`, personal_finance_category: { ...PFC.income, confidence_level: 'VERY_HIGH' } })
  }
  // ---- Rent on the 1st ----
  for (let m = 0; m <= 13; m++) {
    const d = addMonths(startOfMonth(horizonStart), m)
    if (d <= today) spend('housing', RENT.landlord, RENT.amount, d, IDS.checking)
  }
  // ---- Subscriptions: monthly on a fixed day; year-ago prices before the raise ----
  SUBSCRIPTIONS.forEach((s, i) => {
    const day = 3 + ((i * 4) % 24)
    for (let m = 0; m <= 13; m++) {
      const d = new Date(horizonStart.getFullYear(), horizonStart.getMonth() + m, Math.min(day, daysInMonth(new Date(horizonStart.getFullYear(), horizonStart.getMonth() + m, 1))))
      if (d > today) continue
      const monthsFromYearAgo = m - 1 // m=1 is "a year ago" relative to this month
      const price = s.raisedAtMonth !== null && monthsFromYearAgo >= s.raisedAtMonth ? s.price : s.priceYearAgo
      spend('subscriptions', s.name, price, d, s.kind === 'fitness' ? IDS.checking : flatAcct, ['subscription'])
    }
  })

  // ---- Anchors (from the profile spec) ----
  const elapsed = today.getDate() // days elapsed this month incl. today
  const earlyMonth = elapsed < 8
  const dayIn = (k: number) => new Date(today.getFullYear(), today.getMonth(), Math.max(1, Math.min(elapsed, k)))
  // Month-to-date visits: spread across the elapsed days; in the first week, spread over the trailing 30 days instead so they don't pile up.
  const mtd = (k: number, n: number) => (earlyMonth ? addDays(today, -Math.round(((n - k) / n) * 30)) : dayIn(Math.max(1, Math.round((k / n) * elapsed))))
  const visitDays = (n: number) => Array.from({ length: n }, (_, i) => Math.round(((i + 0.5) / n) * 20))
  const coffee = spec.habits.coffee, lunch = spec.habits.lunch
  visitDays(coffee.visitsPerMonth).forEach((k) => spend('dining', coffee.merchant, rng.range(coffee.ticket[0], coffee.ticket[1]), mtd(k, 20), diningAcct, ['coffee']))
  for (let m = 1; m <= 13; m++) {
    const base = addMonths(startOfMonth(today), -m)
    for (let v = 0; v < coffee.visitsPerMonth; v++) spend('dining', coffee.merchant, rng.range(coffee.ticket[0], coffee.ticket[1]), addDays(base, rng.int(1, 27)), diningAcct, ['coffee'])
  }
  visitDays(lunch.visitsPerMonth).forEach((k) => spend('dining', lunch.merchant, rng.range(lunch.ticket[0], lunch.ticket[1]), mtd(k, 20), diningAcct, ['lunch']))
  spec.habits.apparel.forEach((a) => spend('shopping', a.merchant, a.amount, addDays(today, -a.daysAgo), flatAcct, ['apparel', ...a.tags]))
  spec.habits.entertainment.forEach((a) => spend('entertainment', a.merchant, a.amount, addDays(today, -a.daysAgo), flatAcct, ['tickets', ...a.tags]))
  // Prior trip cluster: flight booked earlier, the rest during the trip
  const trip = addMonths(today, -PRIOR_TRIP.monthsAgo)
  spend('travel', 'JetBlue', PRIOR_TRIP.flight, addDays(trip, -35), travelAcct, ['trip', 'flight'])
  spend('travel', 'Airbnb', PRIOR_TRIP.around.stay, addDays(trip, -2), travelAcct, ['trip', 'stay'])
  rng.split(PRIOR_TRIP.around.food, PRIOR_TRIP.foodMerchants.length).forEach((a, i) => spend('dining', PRIOR_TRIP.foodMerchants[i], a, addDays(trip, i), travelAcct, ['trip', 'food']))
  rng.split(PRIOR_TRIP.around.local, PRIOR_TRIP.localMerchants.length).forEach((a, i) => spend('transport', PRIOR_TRIP.localMerchants[i], a, addDays(trip, i), travelAcct, ['trip', 'local']))

  // ---- Seeded noise: fill each category to its monthly target ----
  const noiseCats: (keyof typeof MERCHANTS)[] = ['dining', 'groceries', 'transport', 'shopping', 'entertainment', 'other']
  const anchored = (cat: SpendCategory, y: number, m: number) => txns.filter((t) => { const d = new Date(t.date); return PFC[cat].detailed === t.personal_finance_category.detailed && d.getFullYear() === y && d.getMonth() === m }).reduce((a, t) => a + t.amount, 0)
  for (let m = 13; m >= 0; m--) {
    const first = addMonths(startOfMonth(today), -m)
    const dim = daysInMonth(first)
    const isCurrent = m === 0
    for (const cat of noiseCats) {
      const b = BASELINES[cat]
      const monthTarget = isCurrent ? b.runRate * (elapsed / dim) : b.usual * rng.range(0.88, 1.12)
      const remaining = Math.max(0, monthTarget - anchored(cat, first.getFullYear(), first.getMonth()))
      if (remaining < 4) continue
      const avg = ({ dining: 24, groceries: 58, transport: 14, shopping: 48, entertainment: 28, other: 22, travel: 120 } as Record<string, number>)[cat] ?? 20
      const n = Math.max(1, Math.round(remaining / avg))
      const parts = rng.split(remaining, n)
      const lastDay = isCurrent ? elapsed : dim
      parts.forEach((amt) => {
        const day = rng.int(1, lastDay)
        const acct = cat === 'groceries' ? IDS.checking : cat === 'dining' ? rng.pick([diningAcct, travelAcct, flatAcct]) : rng.pick([flatAcct, cardAcct(spec.cards.length - 1), IDS.checking])
        spend(cat, rng.pick(MERCHANTS[cat].filter((x) => x !== coffee.merchant && x !== lunch.merchant)), amt, new Date(first.getFullYear(), first.getMonth(), day), acct)
      })
    }
  }
  txns.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  const A = spec.accounts
  const accounts: PlaidAccount[] = [
    { account_id: IDS.checking, name: 'SoFi Checking', official_name: 'SoFi Checking', mask: A.masks.checking, type: 'depository', subtype: 'checking', balances: { available: A.checking, current: A.checking, limit: null, iso_currency_code: 'USD' } },
    { account_id: IDS.savings, name: 'SoFi Savings', official_name: 'SoFi Savings', mask: A.masks.savings, type: 'depository', subtype: 'savings', balances: { available: A.savings, current: A.savings, limit: null, iso_currency_code: 'USD' }, vaults: A.vaults },
    { account_id: IDS.brokerage, name: 'SoFi Invest', official_name: 'SoFi Active Invest', mask: A.masks.brokerage, type: 'investment', subtype: 'brokerage', balances: { available: null, current: A.brokerage, limit: null, iso_currency_code: 'USD' } },
    ...spec.cards.map((c): PlaidAccount => ({ account_id: IDS.card(c.id), name: c.name, official_name: c.name, mask: c.last4, type: 'credit', subtype: 'credit card', balances: { available: c.limit === null ? null : c.limit - c.balance, current: c.balance, limit: c.limit, iso_currency_code: 'USD' } })),
  ]
  return { accounts, transactions: txns, request_id: `req_demo_${spec.id}_seed${spec.seed}` }
}
