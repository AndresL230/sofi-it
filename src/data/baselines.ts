import type { Baseline, SpendCategory } from '@/engine/types'
import { SUBSCRIPTIONS } from './subscriptions'

const subsTotal = Math.round(SUBSCRIPTIONS.reduce((a, s) => a + s.price, 0) * 100) / 100

/**
 * Monthly baselines (MASTER §2). `usual` is the typical month; `runRate` is where this month
 * lands at the current burn rate before any new purchase — the generator lays month-to-date
 * transactions so spent ≈ runRate × elapsed/daysInMonth, which keeps the pace story
 * ("≈ $585, about $35 over usual" for a $60 dinner) true on any day of any month.
 */
export const BASELINES: Record<SpendCategory, Baseline> = {
  dining: { category: 'dining', label: 'Dining', usual: 550, runRate: 525, essential: false },
  groceries: { category: 'groceries', label: 'Groceries', usual: 480, runRate: 360, essential: true },
  transport: { category: 'transport', label: 'Transport', usual: 160, runRate: 150, essential: true },
  shopping: { category: 'shopping', label: 'Shopping', usual: 250, runRate: 230, essential: false },
  entertainment: { category: 'entertainment', label: 'Entertainment', usual: 120, runRate: 82, essential: false },
  subscriptions: { category: 'subscriptions', label: 'Subscriptions', usual: subsTotal, runRate: subsTotal, essential: true },
  housing: { category: 'housing', label: 'Rent', usual: 1850, runRate: 1850, essential: true },
  travel: { category: 'travel', label: 'Travel', usual: 120, runRate: 0, essential: false },
  other: { category: 'other', label: 'Everything else', usual: 150, runRate: 140, essential: false },
  income: { category: 'income', label: 'Income', usual: 0, runRate: 0, essential: false },
  transfer: { category: 'transfer', label: 'Transfers', usual: 0, runRate: 0, essential: false },
}

/** Where a large purchase could be accelerated from (cashflow_timeline's purple flag). */
export const REDIRECT_PLAN: { category: SpendCategory; to: number }[] = [
  { category: 'dining', to: 460 },
  { category: 'entertainment', to: 80 },
]
