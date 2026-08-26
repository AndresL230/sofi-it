import type { Runway, UserModel } from './types'
import { daysBetween, nextDayOfMonth, sameMonth, weekdayLong } from '@/lib/dates'
import { bufferMultiplier } from './profile'

/**
 * Discretionary room before the next paycheck: checking − rent − remaining subs − remaining essentials − buffer.
 * Paycheck size and cadence come from the persona's FinancialProfile (via user.payroll) — never a literal.
 */
export function runway(user: UserModel, amount: number, now: Date): Runway {
  const checking = user.accounts.find((a) => a.subtype === 'checking')?.balance ?? 0
  const rentDue = nextDayOfMonth(now, user.rent.dayOfMonth)
  const chargedThisMonth = new Set(user.txns.filter((t) => t.category === 'subscriptions' && sameMonth(t.date, now)).map((t) => t.merchant.toLowerCase()))
  const subsRemaining = user.subscriptions.filter((s) => !chargedThisMonth.has(s.name.toLowerCase())).reduce((a, s) => a + s.price, 0)
  // Rent already posted for the month it falls due (e.g. on the 1st the generator has landed it) → paid, not a remaining bill.
  const rentPaid = user.txns.some((t) => t.category === 'housing' && sameMonth(t.date, rentDue))
  const bills = [
    ...(rentPaid ? [] : [{ label: 'Rent', amount: user.rent.amount, due: rentDue }]),
    { label: 'Subs', amount: Math.round(subsRemaining * 100) / 100, due: now },
  ]
  // Essentials you'll need before the paycheck after next (one pay cycle), so room doesn't swing with the day of month.
  const essentialsRemaining = (['groceries', 'transport'] as const).reduce((a, c) => a + user.baselines[c].usual, 0) * (user.payroll.intervalDays / 30)
  const room = Math.round(checking - bills.reduce((a, b) => a + b.amount, 0) - essentialsRemaining - user.cash.bufferFloor)
  // Variable income widens the safety buffer: a verdict has to clear 1.5× the normal cushion before it reads "fine".
  const cushion = Math.round(user.cash.cushion * bufferMultiplier(user.financialProfile))
  return {
    checking, bills, essentialsRemaining: Math.round(essentialsRemaining), bufferFloor: user.cash.bufferFloor, cushion,
    room, roomAfter: room - amount, nextPayday: user.payroll.nextPayday, daysToPayday: daysBetween(now, user.payroll.nextPayday),
    paydayWeekday: weekdayLong(user.payroll.nextPayday), paycheck: user.payroll.amount,
  }
}
