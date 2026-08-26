import type { Category, EngineContext, Goal, PurchaseClassification, QueryFacts, RichText, SpendCategory, UserModel } from './types'
import { categoryPace } from './paces'
import { runway } from './runway'
import { rankCards, utilizationWatch } from './cardMath'
import { verdict } from './verdicts'
import { goalImpact, collision, suggestedGoal } from './goals'
import { affordability, carryingCost, eventCost, paymentOptions, pointsOffset } from './money'
import { benefitsFor, duplicateFind, impulseHistory, merchantHabit, subscriptionView, unusedCredits } from './behavior'
import { money, num, ordinalWord, cap } from './format'

export const SPEND_OF: Record<Category, SpendCategory> = {
  dining: 'dining', coffee: 'dining', groceries: 'groceries', transport: 'transport', shopping_apparel: 'shopping', shopping_electronics: 'shopping',
  entertainment: 'entertainment', travel: 'travel', subscription: 'subscriptions', housing_moving: 'housing', other: 'other',
}
const DISCRETIONARY: Category[] = ['dining', 'coffee', 'shopping_apparel', 'shopping_electronics', 'entertainment', 'travel', 'subscription', 'other']

export function queryFacts(c: PurchaseClassification): QueryFacts {
  const raw = c.normalized.replace(/\$?\s?\d[\d,]*\.?\d*\s?k?/i, '').replace(/^(\/\s?mo|per month|monthly)\s*/i, '').replace(/\s+/g, ' ').trim()
  const thing = raw.replace(/^(for|on|a|an|the|of|to)\s+/i, '').replace(/\s*(\/\s?mo|per month|monthly)$/i, '').trim() || c.category.replace('_', ' ')
  const svc = c.merchant_guess ?? (c.category === 'subscription' ? cap(thing.split(' ')[0]) : null)
  return {
    amount: c.amount, category: c.category, spendCategory: SPEND_OF[c.category], size: c.size, frequency: c.frequency, normalized: c.normalized,
    merchant: c.merchant_guess, isRestaurant: c.category === 'dining', isDiscretionary: DISCRETIONARY.includes(c.category), thing,
    serviceName: c.category === 'subscription' ? svc : null,
    spendCategoryEssentialLike: c.category === 'groceries' || c.category === 'housing_moving',
  }
}

/** Assemble everything a card could need. Pure: (classification, goal, user, now) → context. */
export function buildContext(c: PurchaseClassification, goal: Goal | null, user: UserModel, now: Date): EngineContext {
  const q = queryFacts(c)
  const pace = categoryPace(user, q.spendCategory, q.amount, now)
  const rw = runway(user, q.amount, now)
  const ranking = rankCards(user, q)
  const utilization = utilizationWatch(ranking, q)
  const habit = merchantHabit(user, q, now)
  const impulse = impulseHistory(user, q, now)
  const duplicate = q.isDiscretionary && q.size !== 'small' ? duplicateFind(user, q, now) : null
  const subs = subscriptionView(user, q)
  const gi = goalImpact(goal, q, pace, now)
  const col = collision(goal, q, rw, user, now)
  const v = verdict({ q, pace, runway: rw, goalImpact: gi, utilization, duplicate, subs, habit })
  const points = pointsOffset(user, q)
  const aff = affordability(user, q, rw, points, now, goal?.weekly ?? 125)
  const options = paymentOptions(q.amount, user)
  const carrying = rw.roomAfter < rw.cushion && q.frequency !== 'recurring' ? carryingCost(q.amount, user, now) : null
  const ev = q.category === 'travel' ? eventCost(user, q.amount) : null
  const credits = unusedCredits(user, now)
  const allowanceLeft = Math.max(0, user.allowance.monthly - user.allowance.spent)
  const allowance = { monthly: user.allowance.monthly, left: allowanceLeft, covers: Math.min(allowanceLeft, q.amount), remainder: Math.max(0, q.amount - allowanceLeft) }
  const costPerUse = (() => {
    const electronics = q.category === 'shopping_electronics'
    const unit = q.category === 'shopping_apparel' ? 'wear' : electronics ? 'workday' : 'use'
    const prior = duplicate?.prior ?? user.txns.find((t) => t.category === 'shopping' && t.tags?.includes('boots'))
    const anchor = prior && q.category === 'shopping_apparel' ? { label: `your ${prior.tags?.includes('boots') ? 'boots' : prior.tags?.includes('sneakers') ? 'sneakers' : prior.merchant + ' buy'}`, perUse: Math.max(1, Math.round(prior.amount / Math.max(3, Math.round((Math.max(1, (now.getTime() - prior.date.getTime()) / 864e5) / 7) * 1.5)))) } : null
    return { unit, anchor, defaultUses: electronics ? 60 : 20, good: electronics ? 4 : 6, ok: electronics ? 9 : 12 }
  })()
  const splitTightAt = Math.max(15, Math.round(pace.usual - pace.runRate))
  const netWorth = user.accounts.reduce((s, a) => s + (a.type === 'credit' ? -a.balance : a.balance), 0)
  const winnerCard = ranking.winner.card
  const catLower = pace.label.toLowerCase()

  const consequence: RichText = (() => {
    if (q.frequency === 'recurring') return ['Subscriptions are the only category that never asks twice.']
    if (q.size === 'large') {
      if (q.category === 'travel') return []
      const loan = options.find((o) => o.key === 'loan')!
      return rw.roomAfter < 0 ? ['The loan costs ', money(loan.total - q.amount), ' to protect your cash cushion — that is the actual price of now.'] : ['Cash covers it, but it leaves ', money(rw.roomAfter), ' of room before ', { date: rw.nextPayday, fmt: 'weekdayLong' }, '.']
    }
    if (habit && habit.visitsThisMonth >= 2) return [cap(ordinalWord(habit.visitsThisMonth + 1)), ' this month — ', catLower, pace.projectedWith <= pace.usual ? ' still lands under usual.' : [' runs about ', money(Math.round(pace.overshoot)), ' hot even so.'].flat()].flat() as RichText
    if (q.size === 'small' && q.spendCategory === 'transport' && rw.daysToPayday <= 4) return ['Same purchase, ', num(rw.daysToPayday), ' days later, different answer — that is the whole point.']
    if (q.size === 'medium' && q.isDiscretionary) return pace.projectedWith <= pace.usual ? ['This is a want, not a leak — your ', catLower, ' category is under usual even with it.'] : ['This is a want, not a leak — but ', catLower, ' lands about ', money(Math.round(pace.overshoot)), ' over usual with it.']
    if (pace.overshoot > 0) return ['Say yes and ', catLower, ' runs about ', money(Math.round(pace.overshoot)), ' hot this month — nothing else moves.']
    return ['Say yes and ', catLower, ' still lands under usual — nothing else moves.']
  })()

  const ledger: EngineContext['ledger'] = q.frequency === 'recurring'
    ? [{ label: 'subscriptions', before: subs.total, after: subs.newTotal, unit: '/mo' }, { label: 'all-in', before: subs.total * 12, after: subs.newTotal * 12, unit: '/yr' }]
    : q.size === 'large' && rw.roomAfter < 0
      ? [{ label: 'checking', before: rw.checking, after: rw.checking - q.amount }, { label: winnerCard.name.replace('Chase ', ''), before: winnerCard.balance, after: winnerCard.balance + q.amount }, { label: catLower, before: pace.spent, after: pace.spent + q.amount }]
      : [{ label: 'checking', before: rw.checking, after: rw.checking - q.amount }, { label: winnerCard.name.replace('Chase ', '').replace(' Unlimited', ''), before: winnerCard.balance, after: winnerCard.balance + q.amount }, { label: catLower, before: pace.spent, after: pace.spent + q.amount }]
  const goalLedger = goal ? { label: goal.name.split(' ')[0], delta: gi ? -gi.daysPushed : 0 } : null

  return {
    now, q, user, verdict: v, pace, runway: rw, ranking, utilization, goal, goalImpact: gi, collision: col, affordability: aff, paymentOptions: options,
    carrying, points, eventCost: ev, credits, merchantHabit: habit, impulse, duplicate, subs, allowance, consequence, ledger, goalLedger, netWorth,
    benefits: benefitsFor(ranking.ranked, q), costPerUse, splitTightAt, suggestedGoal: suggestedGoal(user, now),
  }
}
