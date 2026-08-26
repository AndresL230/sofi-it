import type { Runway, UserModel } from './types'
import { daysBetween, nextDayOfMonth, sameMonth, weekdayLong } from '@/lib/dates'

/** Discretionary room before the next paycheck: checking − rent − remaining subs − remaining essentials − buffer. */
export function runway(user: UserModel, amount: number, now: Date): Runway {
  const checking = user.accounts.find((a) => a.subtype === 'checking')?.balance ?? 0
  const rentDue = nextDayOfMonth(now, user.rent.dayOfMonth)
  const chargedThisMonth = new Set(user.txns.filter((t) => t.category === 'subscriptions' && sameMonth(t.date, now)).map((t) => t.merchant.toLowerCase()))
  const subsRemaining = user.subscriptions.filter((s) => !chargedThisMonth.has(s.name.toLowerCase())).reduce((a, s) => a + s.price, 0)
  const bills = [
    { label: 'Rent', amount: user.rent.amount, due: rentDue },
    { label: 'Subs', amount: Math.round(subsRemaining * 100) / 100, due: now },
  ]
  // Essentials you'll need before the paycheck after next (one pay cycle), so room doesn't swing with the day of month.
  const essentialsRemaining = (['groceries', 'transport'] as const).reduce((a, c) => a + user.baselines[c].usual, 0) * (user.payroll.intervalDays / 30)
  const room = Math.round(checking - bills.reduce((a, b) => a + b.amount, 0) - essentialsRemaining - user.cash.bufferFloor)
  return {
    checking, bills, essentialsRemaining: Math.round(essentialsRemaining), bufferFloor: user.cash.bufferFloor, cushion: user.cash.cushion,
    room, roomAfter: room - amount, nextPayday: user.payroll.nextPayday, daysToPayday: daysBetween(now, user.payroll.nextPayday),
    paydayWeekday: weekdayLong(user.payroll.nextPayday), paycheck: user.payroll.amount,
  }
}
