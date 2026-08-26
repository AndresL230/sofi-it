import type { Baseline, SpendCategory } from '@/types'
import type { ProfileSpec } from './spec'

const LABEL: Record<SpendCategory, string> = { dining: 'Dining', groceries: 'Groceries', transport: 'Transport', shopping: 'Shopping', entertainment: 'Entertainment', subscriptions: 'Subscriptions', housing: 'Rent', travel: 'Travel', other: 'Everything else', income: 'Income', transfer: 'Transfers' }
const ESSENTIAL: SpendCategory[] = ['groceries', 'transport', 'subscriptions', 'housing']

/**
 * Monthly baselines. `usual` is the typical month; `runRate` is where this month lands at the current burn
 * rate before any new purchase — the generator lays month-to-date transactions so spent ≈ runRate × elapsed/daysInMonth,
 * which keeps the pace story true on any day of any month.
 */
export function buildBaselines(spec: ProfileSpec): Record<SpendCategory, Baseline> {
  const subsTotal = Math.round(spec.subscriptions.reduce((a, s) => a + s.price, 0) * 100) / 100
  const mk = (c: SpendCategory, usual: number, runRate: number): Baseline => ({ category: c, label: LABEL[c], usual, runRate, essential: ESSENTIAL.includes(c) })
  const b = spec.baselines
  return {
    dining: mk('dining', b.dining.usual, b.dining.runRate),
    groceries: mk('groceries', b.groceries.usual, b.groceries.runRate),
    transport: mk('transport', b.transport.usual, b.transport.runRate),
    shopping: mk('shopping', b.shopping.usual, b.shopping.runRate),
    entertainment: mk('entertainment', b.entertainment.usual, b.entertainment.runRate),
    subscriptions: mk('subscriptions', subsTotal, subsTotal),
    housing: mk('housing', b.housing.usual, b.housing.runRate),
    travel: mk('travel', b.travel.usual, b.travel.runRate),
    other: mk('other', b.other.usual, b.other.runRate),
    income: mk('income', 0, 0),
    transfer: mk('transfer', 0, 0),
  }
}
