import type { CategoryPace, Collision, Goal, GoalImpact, QueryFacts, Runway, UserModel } from './types'
import { addDays, daysBetween, startOfDay } from '@/lib/dates'
import { num, money } from './format'
import { monthlyNet } from '@/lib/payroll'

/** The persona's suggested goal (Anna: Lisbon $2,400 by today + 10 weeks, vault at $1,150, $125/wk). */
export function suggestedGoal(user: UserModel, now: Date): Goal {
  const t = user.goalTemplate
  const vault = user.accounts.find((a) => a.subtype === 'savings')?.vaults?.find((v) => v.name.toLowerCase() === t.vaultName.toLowerCase())
  return { id: t.vaultName.toLowerCase(), name: t.name, emoji: t.emoji, target: t.target, saved: vault?.balance ?? 0, deadline: addDays(startOfDay(now), t.weeksOut * 7), weekly: t.weekly, createdAt: now }
}

/** When the goal lands at its weekly pace (independent of the deadline). */
export function landingDate(goal: Goal, now: Date, savedOverride?: number): Date {
  const remaining = Math.max(0, goal.target - (savedOverride ?? goal.saved))
  const weeks = goal.weekly > 0 ? remaining / goal.weekly : Infinity
  return addDays(startOfDay(now), Math.ceil(weeks * 7))
}

/**
 * Only the part of a purchase that overshoots the category's usual pace is "goal money":
 * a $60 dinner that lands dining $35 over usual pushes Lisbon by $35 ÷ ($125/7 per day) ≈ 2 days.
 */
export function goalImpact(goal: Goal | null, q: QueryFacts, pace: CategoryPace, now: Date): GoalImpact | null {
  if (!goal || q.size === 'large' || q.frequency === 'recurring') return null
  const daily = goal.weekly / 7
  const overshoot = Math.max(0, pace.overshoot)
  const daysPushed = daily > 0 ? Math.round(overshoot / daily) : 0
  const landsBefore = landingDate(goal, now)
  const landsAfter = addDays(landsBefore, daysPushed)
  const weeksLeft = Math.max(0, daysBetween(now, goal.deadline) / 7)
  const onTrack = landsAfter.getTime() <= goal.deadline.getTime()
  const avgTicket = q.spendCategory === 'dining' ? 40 : Math.max(10, Math.round(q.amount))
  const skips = Math.max(1, Math.ceil(overshoot / avgTicket))
  const noun = q.spendCategory === 'dining' ? (skips === 1 ? 'dinner' : 'dinners') : q.spendCategory === 'entertainment' ? (skips === 1 ? 'night out' : 'nights out') : (skips === 1 ? 'small buy' : 'small buys')
  return {
    goal, daysPushed, landsBefore, landsAfter, onTrack, weeksLeft, pctSaved: goal.saved / goal.target,
    paceFix: daysPushed > 0 ? ['skip ', skips === 1 ? 'one' : num(skips), ' ', noun, ' this week to stay on pace'] : ['still on pace — nothing to fix'],
  }
}

/** Large purchase against an existing goal: two timelines that trade dates through a slider. */
export function collision(goal: Goal | null, q: QueryFacts, runway: Runway, user: UserModel, now: Date): Collision | null {
  if (!goal || q.size !== 'large') return null
  const monthlyUsual = Object.values(user.baselines).filter((b) => b.category !== 'income' && b.category !== 'transfer').reduce((a, b) => a + b.usual, 0)
  const monthlyIncome = monthlyNet(user.financialProfile.netPerCheck, user.financialProfile.payCadence)
  const surplusWeekly = Math.max(60, ((monthlyIncome - monthlyUsual) * 12) / 52)
  const weeklyFreeCash = Math.round(goal.weekly + surplusWeekly)
  const availableNow = Math.max(0, runway.room)
  const shortfall = Math.max(0, q.amount - availableNow)
  const goalProtected = landingDate(goal, now)
  const purchaseWaits = addDays(startOfDay(now), Math.ceil((shortfall / Math.max(1, weeklyFreeCash - goal.weekly)) * 7))
  const drained = Math.min(goal.saved, shortfall)
  const goalPushed = landingDate(goal, now, goal.saved - drained)
  const purchaseNow = startOfDay(now)
  const lerp = (a: Date, b: Date, t: number) => addDays(a, Math.round(daysBetween(a, b) * t))
  return {
    goal, amount: q.amount, goalProtected, purchaseWaits, goalPushed, purchaseNow, balancedT: 0.5, weeklyFreeCash,
    at: (t) => ({ goalDate: lerp(goalProtected, goalPushed, t), purchaseDate: lerp(purchaseWaits, purchaseNow, t) }),
  }
}

export const goalPill = (goal: Goal) => [goal.emoji ?? '✦', ' ', goal.name.split(' ')[0], ' · ', money(goal.saved), ' of ', money(goal.target)]
