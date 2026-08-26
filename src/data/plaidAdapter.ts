/**
 * The one thin adapter from Plaid's shape to engine types. Swap buildPlaidResponse() for a
 * live /transactions/sync payload and nothing downstream changes.
 */
import type { Account, SpendCategory, Txn, UserModel } from '@/engine/types'
import type { PlaidAccount, PlaidResponse, PlaidTransaction } from './mockUser'
import { ACCOUNT_IDS, ALLOWANCE, CASH, LOAN, PAYROLL, PERSONA, POINTS, PRIOR_TRIP, RENT, buildPlaidResponse } from './mockUser'
import { buildCardRules } from './cardRules'
import { BASELINES, REDIRECT_PLAN } from './baselines'
import { SUBSCRIPTIONS, SERVICE_CATALOG } from './subscriptions'
import { addDays, addMonths, fromIso, startOfDay } from '@/lib/dates'
import { makeRng } from './seed'

function pfcToSpend(t: PlaidTransaction): SpendCategory {
  const d = t.personal_finance_category.detailed
  if (t._tags?.includes('subscription')) return 'subscriptions'
  if (d.startsWith('INCOME')) return 'income'
  if (d.startsWith('TRANSFER')) return 'transfer'
  if (d === 'FOOD_AND_DRINK_GROCERIES') return 'groceries'
  if (d.startsWith('FOOD_AND_DRINK')) return 'dining'
  if (d.startsWith('TRANSPORTATION')) return 'transport'
  if (d.startsWith('RENT_AND_UTILITIES')) return 'housing'
  if (d.startsWith('TRAVEL')) return 'travel'
  if (d === 'ENTERTAINMENT_TV_AND_MOVIES') return 'subscriptions'
  if (d.startsWith('ENTERTAINMENT')) return 'entertainment'
  if (d === 'GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE') return 'other'
  if (d.startsWith('GENERAL_MERCHANDISE')) return 'shopping'
  return 'other'
}

const toAccount = (a: PlaidAccount): Account => ({
  id: a.account_id, name: a.name, officialName: a.official_name, type: a.type, subtype: a.subtype, mask: a.mask,
  balance: a.balances.current, limit: a.balances.limit, vaults: a.vaults,
})

const toTxn = (t: PlaidTransaction): Txn => ({
  id: t.transaction_id, accountId: t.account_id, date: fromIso(t.date), amount: t.amount,
  merchant: t.merchant_name ?? t.name, category: pfcToSpend(t), detailed: t.personal_finance_category.detailed, tags: t._tags,
})

export function adapt(res: PlaidResponse, now: Date): UserModel {
  const accounts = res.accounts.map(toAccount)
  const txns = res.transactions.map(toTxn)
  const cash = accounts.filter((a) => a.type === 'depository').reduce((s, a) => s + a.balance, 0)
  const debt = accounts.filter((a) => a.type === 'credit').reduce((s, a) => s + a.balance, 0)
  const invest = accounts.filter((a) => a.type === 'investment').reduce((s, a) => s + a.balance, 0)
  const netWorthNow = cash - debt + invest
  // 13 monthly net-worth snapshots ending today, ▲ ≈ $1,240 over the last 6 months (seeded walk).
  const rng = makeRng(7)
  const netWorthHistory = Array.from({ length: 13 }, (_, i) => {
    const monthsAgo = 12 - i
    const drift = monthsAgo <= 6 ? (1240 / 6) * monthsAgo : 1240 + (monthsAgo - 6) * 140
    return { date: monthsAgo === 0 ? startOfDay(now) : addMonths(startOfDay(now), -monthsAgo), value: Math.round(netWorthNow - drift + (monthsAgo === 0 ? 0 : rng.range(-260, 260))) }
  })
  return {
    persona: PERSONA,
    accounts, cards: buildCardRules(now), txns,
    baselines: BASELINES, subscriptions: SUBSCRIPTIONS, points: POINTS,
    payroll: { amount: PAYROLL.amount, nextPayday: addDays(startOfDay(now), PAYROLL.daysUntilNext), intervalDays: PAYROLL.intervalDays },
    cash: CASH, allowance: ALLOWANCE,
    priorTrip: { ...PRIOR_TRIP, when: addMonths(startOfDay(now), -PRIOR_TRIP.monthsAgo) },
    loan: LOAN, rent: RENT, netWorthHistory,
    redirectPlan: REDIRECT_PLAN, serviceCatalog: SERVICE_CATALOG,
  }
}

export const CHECKING_ID = ACCOUNT_IDS.checking
export const buildUser = (now = new Date()) => adapt(buildPlaidResponse(now), now)
