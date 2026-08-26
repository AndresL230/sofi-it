/**
 * The one thin adapter from Plaid's shape to engine types. Swap buildPlaidResponse() for a
 * live /transactions/sync payload and nothing downstream changes.
 */
import type { Account, SpendCategory, Txn, UserModel } from '@/types'
import type { PlaidAccount, PlaidResponse, PlaidTransaction } from './mockUser'
import { buildPlaidResponse } from './mockUser'
import { buildCardRules } from './cardRules'
import { buildBaselines } from './baselines'
import { SERVICE_CATALOG } from './subscriptions'
import type { ProfileSpec } from './spec'
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

export function adapt(res: PlaidResponse, now: Date, spec: ProfileSpec): UserModel {
  const accounts = res.accounts.map(toAccount)
  const txns = res.transactions.map(toTxn)
  const cash = accounts.filter((a) => a.type === 'depository').reduce((s, a) => s + a.balance, 0)
  const debt = accounts.filter((a) => a.type === 'credit').reduce((s, a) => s + a.balance, 0)
  const invest = accounts.filter((a) => a.type === 'investment').reduce((s, a) => s + a.balance, 0)
  const netWorthNow = cash - debt + invest
  // 13 monthly net-worth snapshots ending today; the 6-month delta comes from the spec (seeded walk around it).
  const rng = makeRng(spec.seed + 7)
  const d6 = spec.netWorthDelta6m
  const netWorthHistory = Array.from({ length: 13 }, (_, i) => {
    const monthsAgo = 12 - i
    const drift = monthsAgo <= 6 ? (d6 / 6) * monthsAgo : d6 + (monthsAgo - 6) * (d6 / 9)
    return { date: monthsAgo === 0 ? startOfDay(now) : addMonths(startOfDay(now), -monthsAgo), value: Math.round(netWorthNow - drift + (monthsAgo === 0 ? 0 : rng.range(-Math.abs(d6) / 5, Math.abs(d6) / 5))) }
  })
  return {
    persona: spec.persona,
    accounts, cards: buildCardRules(now, spec.cards), txns,
    baselines: buildBaselines(spec), subscriptions: spec.subscriptions, points: spec.points,
    payroll: { amount: spec.payroll.amount, nextPayday: addDays(startOfDay(now), spec.payroll.daysUntilNext), intervalDays: spec.payroll.intervalDays },
    cash: spec.cash, allowance: spec.allowance,
    priorTrip: { flight: spec.priorTrip.flight, around: spec.priorTrip.around, label: spec.priorTrip.label, when: addMonths(startOfDay(now), -spec.priorTrip.monthsAgo) },
    loan: spec.loan, rent: { amount: spec.rent.amount, dayOfMonth: spec.rent.dayOfMonth }, netWorthHistory,
    redirectPlan: spec.redirectPlan, serviceCatalog: SERVICE_CATALOG,
    goalTemplate: spec.goalTemplate, habits: { coffeeMerchant: spec.habits.coffee.merchant, lunchMerchant: spec.habits.lunch.merchant },
  }
}

export const buildUser = (spec: ProfileSpec, now = new Date()) => adapt(buildPlaidResponse(spec, now), now, spec)
