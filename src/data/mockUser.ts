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
import { BASELINES } from './baselines'
import { SUBSCRIPTIONS } from './subscriptions'
import { addDays, addMonths, daysInMonth, iso, startOfMonth, startOfDay } from '@/lib/dates'
import type { SpendCategory } from '@/engine/types'

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

export const ACCOUNT_IDS = { checking: 'acc_chk_4021', savings: 'acc_sav_7788', brokerage: 'acc_inv_2201', sofi2: 'acc_cc_4021', amexgold: 'acc_cc_1005', citicc: 'acc_cc_8834', csp: 'acc_cc_5512', cfu: 'acc_cc_7290' } as const

export const PERSONA = { firstName: 'Maya', lastName: 'Chen', city: 'Boston', initials: 'MC' }
export const PAYROLL = { amount: 2610, daysUntilNext: 3, intervalDays: 14 }
export const RENT = { amount: 1850, dayOfMonth: 1 }
export const CASH = { bufferFloor: 450, cushion: 300 }
export const ALLOWANCE = { monthly: 150, spent: 65 }
export const POINTS = [
  { program: 'UR' as const, balance: 48000, label: 'Chase UR', transferPartner: 'Iberia', transferValueCents: 1.104 },
  { program: 'MR' as const, balance: 22000, label: 'Amex MR', transferValueCents: 1.0, transferPartner: 'Air France' },
]
export const LOAN = { apr: 0.1099, termMonths: 12 }
/** Prior trip: $380 flight, the trip ran 2.1× the flight all-in. */
export const PRIOR_TRIP = { flight: 380, around: { stay: 206, food: 136, local: 78 }, label: 'Montréal', monthsAgo: 4 }

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

export function buildPlaidResponse(now = new Date()): PlaidResponse {
  txCounter = 0
  const rng = makeRng()
  const today = startOfDay(now)
  const horizonStart = addMonths(startOfMonth(today), -13)
  const txns: PlaidTransaction[] = []
  const push = (t: Omit<PlaidTransaction, 'transaction_id' | 'iso_currency_code' | 'pending' | 'authorized_date' | 'name'> & { name?: string }) =>
    txns.push({ transaction_id: tid(), iso_currency_code: 'USD', pending: false, authorized_date: t.date, name: t.name ?? (t.merchant_name ?? 'Payment'), ...t })
  const spend = (cat: SpendCategory, merchant: string, amount: number, date: Date, accountId: string = ACCOUNT_IDS.sofi2, tags?: string[]) =>
    push({ account_id: accountId, amount: Math.round(amount * 100) / 100, date: iso(date), merchant_name: merchant, personal_finance_category: { ...PFC[cat], confidence_level: 'VERY_HIGH' }, _tags: tags })

  // ---- Payroll: biweekly, next one in 3 days ----
  const nextPayday = addDays(today, PAYROLL.daysUntilNext)
  for (let d = nextPayday; d >= horizonStart; d = addDays(d, -PAYROLL.intervalDays)) {
    if (d <= today) push({ account_id: ACCOUNT_IDS.checking, amount: -PAYROLL.amount, date: iso(d), merchant_name: 'Acme Analytics Payroll', name: 'ACME ANALYTICS DIRECT DEP', personal_finance_category: { ...PFC.income, confidence_level: 'VERY_HIGH' } })
  }
  // ---- Rent on the 1st ----
  for (let m = 0; m <= 13; m++) {
    const d = addMonths(startOfMonth(horizonStart), m)
    if (d <= today) spend('housing', 'Beacon Hill Realty', RENT.amount, d, ACCOUNT_IDS.checking)
  }
  // ---- Subscriptions: monthly on a fixed day; year-ago prices before the raise ----
  SUBSCRIPTIONS.forEach((s, i) => {
    const day = 3 + ((i * 4) % 24)
    for (let m = 0; m <= 13; m++) {
      const d = new Date(horizonStart.getFullYear(), horizonStart.getMonth() + m, Math.min(day, daysInMonth(new Date(horizonStart.getFullYear(), horizonStart.getMonth() + m, 1))))
      if (d > today) continue
      const monthsFromYearAgo = m - 1 // m=1 is "a year ago" relative to this month
      const price = s.raisedAtMonth !== null && monthsFromYearAgo >= s.raisedAtMonth ? s.price : s.priceYearAgo
      spend('subscriptions', s.name, price, d, s.kind === 'fitness' ? ACCOUNT_IDS.checking : ACCOUNT_IDS.sofi2, ['subscription'])
    }
  })

  // ---- Anchors ----
  const elapsed = today.getDate() // days elapsed this month incl. today
  const dayIn = (k: number) => new Date(today.getFullYear(), today.getMonth(), Math.max(1, Math.min(elapsed, k)))
  // Blue Bottle ×4 this month (and ~4/month historically → ~$212 YTD)
  const bbDays = [2, 6, 12, 19].map((k) => Math.max(1, Math.min(elapsed, Math.round((k / 20) * elapsed))))
  bbDays.forEach((k) => spend('dining', 'Blue Bottle Coffee', rng.range(5.9, 7.1), dayIn(k), ACCOUNT_IDS.amexgold, ['coffee']))
  for (let m = 1; m <= 13; m++) {
    const base = addMonths(startOfMonth(today), -m)
    for (let v = 0; v < 4; v++) spend('dining', 'Blue Bottle Coffee', rng.range(5.9, 7.1), addDays(base, rng.int(1, 27)), ACCOUNT_IDS.amexgold, ['coffee'])
  }
  // Sweetgreen ×4 this month
  ;[3, 8, 13, 18].forEach((k) => spend('dining', 'Sweetgreen', rng.range(12.2, 14.4), dayIn(Math.round((k / 20) * elapsed)), ACCOUNT_IDS.amexgold, ['lunch']))
  // Two apparel buys this quarter
  spend('shopping', 'Nike', 95, addDays(today, -42), ACCOUNT_IDS.sofi2, ['apparel', 'sneakers'])
  spend('shopping', 'Blundstone', 120, addDays(today, -70), ACCOUNT_IDS.sofi2, ['apparel', 'boots'])
  // Entertainment this quarter (impulse_frequency dots for the tickets query)
  spend('entertainment', 'Ticketmaster', 85, addDays(today, -49), ACCOUNT_IDS.sofi2, ['tickets'])
  spend('entertainment', 'Sunset Cinema', 52, addDays(today, -22), ACCOUNT_IDS.sofi2, ['tickets'])
  // Prior trip cluster (~4 months ago): flight booked earlier, the rest during the trip
  const trip = addMonths(today, -PRIOR_TRIP.monthsAgo)
  spend('travel', 'JetBlue', PRIOR_TRIP.flight, addDays(trip, -35), ACCOUNT_IDS.csp, ['trip', 'flight'])
  spend('travel', 'Airbnb', PRIOR_TRIP.around.stay, addDays(trip, -2), ACCOUNT_IDS.csp, ['trip', 'stay'])
  rng.split(PRIOR_TRIP.around.food, 4).forEach((a, i) => spend('dining', ['Schwartz\'s', 'Olive et Gourmando', 'Joe Beef', 'La Banquise'][i], a, addDays(trip, i), ACCOUNT_IDS.csp, ['trip', 'food']))
  rng.split(PRIOR_TRIP.around.local, 3).forEach((a, i) => spend('transport', ['STM Métro', 'Bixi', 'Uber'][i], a, addDays(trip, i), ACCOUNT_IDS.csp, ['trip', 'local']))

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
        const acct = cat === 'groceries' ? ACCOUNT_IDS.checking : cat === 'dining' ? rng.pick([ACCOUNT_IDS.amexgold, ACCOUNT_IDS.csp, ACCOUNT_IDS.sofi2]) : rng.pick([ACCOUNT_IDS.sofi2, ACCOUNT_IDS.cfu, ACCOUNT_IDS.checking])
        spend(cat, rng.pick(MERCHANTS[cat].filter((x) => x !== 'Blue Bottle Coffee' && x !== 'Sweetgreen')), amt, new Date(first.getFullYear(), first.getMonth(), day), acct)
      })
    }
  }
  txns.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  const accounts: PlaidAccount[] = [
    { account_id: ACCOUNT_IDS.checking, name: 'SoFi Checking', official_name: 'SoFi Checking', mask: '4021', type: 'depository', subtype: 'checking', balances: { available: 3240, current: 3240, limit: null, iso_currency_code: 'USD' } },
    { account_id: ACCOUNT_IDS.savings, name: 'SoFi Savings', official_name: 'SoFi Savings', mask: '7788', type: 'depository', subtype: 'savings', balances: { available: 8900, current: 8900, limit: null, iso_currency_code: 'USD' }, vaults: [{ name: 'Lisbon', balance: 1150 }, { name: 'Emergency', balance: 6000 }] },
    { account_id: ACCOUNT_IDS.brokerage, name: 'SoFi Invest', official_name: 'SoFi Active Invest', mask: '2201', type: 'investment', subtype: 'brokerage', balances: { available: null, current: 8952, limit: null, iso_currency_code: 'USD' } },
    { account_id: ACCOUNT_IDS.sofi2, name: 'SoFi Unlimited 2%', official_name: 'SoFi Credit Card', mask: '4021', type: 'credit', subtype: 'credit card', balances: { available: 9660, current: 340, limit: 10000, iso_currency_code: 'USD' } },
    { account_id: ACCOUNT_IDS.amexgold, name: 'Amex Gold', official_name: 'American Express Gold Card', mask: '1005', type: 'credit', subtype: 'credit card', balances: { available: null, current: 290, limit: null, iso_currency_code: 'USD' } },
    { account_id: ACCOUNT_IDS.citicc, name: 'Citi Custom Cash', official_name: 'Citi Custom Cash Card', mask: '8834', type: 'credit', subtype: 'credit card', balances: { available: 2790, current: 210, limit: 3000, iso_currency_code: 'USD' } },
    { account_id: ACCOUNT_IDS.csp, name: 'Chase Sapphire Preferred', official_name: 'Chase Sapphire Preferred', mask: '5512', type: 'credit', subtype: 'credit card', balances: { available: 11380, current: 620, limit: 12000, iso_currency_code: 'USD' } },
    { account_id: ACCOUNT_IDS.cfu, name: 'Chase Freedom Unlimited', official_name: 'Chase Freedom Unlimited', mask: '7290', type: 'credit', subtype: 'credit card', balances: { available: 2780, current: 1220, limit: 4000, iso_currency_code: 'USD' } },
  ]
  return { accounts, transactions: txns, request_id: 'req_demo_seed42' }
}
