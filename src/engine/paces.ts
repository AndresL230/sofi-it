import type { CategoryPace, SpendCategory, UserModel } from './types'
import { daysInMonth, sameMonth } from '@/lib/dates'

export function spentThisMonth(user: UserModel, cat: SpendCategory, now: Date): number {
  return Math.round(user.txns.filter((t) => t.category === cat && t.amount > 0 && sameMonth(t.date, now)).reduce((a, t) => a + t.amount, 0) * 100) / 100
}

/**
 * Month-to-date pace for a category, with the candidate purchase applied.
 * projectedWith = max(runRate, spent) + amount; overshoot = projectedWith − usual.
 */
export function categoryPace(user: UserModel, cat: SpendCategory, amount: number, now: Date): CategoryPace {
  const b = user.baselines[cat]
  const spent = spentThisMonth(user, cat, now)
  const dim = daysInMonth(now)
  const elapsedDays = now.getDate()
  const daysLeft = dim - elapsedDays
  const projectedNoBuy = Math.max(b.runRate, spent)
  const projectedWith = Math.round((projectedNoBuy + amount) * 100) / 100
  const overshoot = Math.round((projectedWith - b.usual) * 100) / 100
  let crossesUsualOnDay: number | null = null
  if (overshoot > 0) {
    if (spent + amount >= b.usual) crossesUsualOnDay = elapsedDays
    else {
      const remainingBurn = projectedWith - spent - amount
      const frac = remainingBurn > 0 ? (b.usual - spent - amount) / remainingBurn : 1
      crossesUsualOnDay = Math.min(dim, elapsedDays + Math.ceil(daysLeft * Math.max(0, Math.min(1, frac))))
    }
  }
  return { category: cat, label: b.label, spent, usual: b.usual, runRate: b.runRate, projectedWith, overshoot, daysLeft, daysInMonth: dim, elapsedDays, crossesUsualOnDay }
}
