/**
 * Plaid-shaped mock user (the "one adapter from real" story).
 * Shapes follow Plaid's /accounts/get + /transactions/sync responses closely enough that
 * plaidAdapter.ts is the only thing that would change with a live Item.
 *
 * Two sources, both relative to `now`:
 *  - Calendar-anchored rows are generated here from the ProfileSpec because their meaning is
 *    calendar-based: payroll on the persona's cadence ending at now+3, rent on the 1st, subscriptions on fixed days
 *    with year-ago prices before their raise month.
 *  - Everything else (the seeded noise plus the relative anchors — coffee/lunch visits, apparel,
 *    entertainment, the prior-trip cluster) is served from `profiles/<id>.transactions.csv` keyed by
 *    `days_ago` (see csv.ts / scripts/gen-data.mjs), so nothing in the data is a calendar date.
 */
import type { ProfileSpec } from './spec'
import { addDays, addMonths, daysInMonth, iso, startOfMonth, startOfDay } from '@/lib/dates'
import type { SpendCategory } from '@/types'
import { accountIds, PFC } from './plaid'
import type { PlaidAccount, PlaidResponse, PlaidTransaction } from './plaid'
import { loadTransactions } from './csv'
import { paydaysSince } from '@/lib/payroll'

export type { PlaidAccount, PlaidBalances, PlaidResponse, PlaidTransaction } from './plaid'
export { accountIds } from './plaid'

let txCounter = 0
const tid = () => `txn_${(++txCounter).toString(36).padStart(6, '0')}`

export function buildPlaidResponse(spec: ProfileSpec, now = new Date()): PlaidResponse {
  txCounter = 0
  const IDS = accountIds(spec)
  const SUBSCRIPTIONS = spec.subscriptions
  const PAYROLL = spec.payroll, RENT = spec.rent
  const flatAcct = IDS.card((spec.cards.find((c) => c.isFlatHouseCard) ?? spec.cards[0]).id)
  const today = startOfDay(now)
  const horizonStart = addMonths(startOfMonth(today), -13)
  const txns: PlaidTransaction[] = []
  const push = (t: Omit<PlaidTransaction, 'transaction_id' | 'iso_currency_code' | 'pending' | 'authorized_date' | 'name'> & { name?: string }) =>
    txns.push({ transaction_id: tid(), iso_currency_code: 'USD', pending: false, authorized_date: t.date, name: t.name ?? (t.merchant_name ?? 'Payment'), ...t })
  const spend = (cat: SpendCategory, merchant: string, amount: number, date: Date, accountId: string = flatAcct, tags?: string[]) =>
    push({ account_id: accountId, amount: Math.round(amount * 100) / 100, date: iso(date), merchant_name: merchant, personal_finance_category: { ...PFC[cat], confidence_level: 'VERY_HIGH' }, _tags: tags })

  // ---- Payroll: the persona's cadence, next one `daysUntilNext` out ----
  const nextPayday = addDays(today, PAYROLL.daysUntilNext)
  for (const d of paydaysSince(nextPayday, spec.financial.payCadence, horizonStart)) {
    if (d <= today) push({ account_id: IDS.checking, amount: -spec.financial.netPerCheck, date: iso(d), merchant_name: `${PAYROLL.employer} Payroll`, name: `${PAYROLL.employer.toUpperCase()} DIRECT DEP`, personal_finance_category: { ...PFC.income, confidence_level: 'VERY_HIGH' } })
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

  // ---- History from CSV: seeded noise + relative anchors, dated by days_ago from today ----
  txns.push(...loadTransactions(spec, today))
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
