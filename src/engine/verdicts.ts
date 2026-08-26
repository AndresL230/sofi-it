import type { CategoryPace, DuplicateFind, GoalImpact, MerchantHabit, QueryFacts, Runway, SubscriptionView, UtilizationWatch, Verdict } from './types'
import { date, money, ordinalWord, cap } from './format'

export interface VerdictInputs { q: QueryFacts; pace: CategoryPace; runway: Runway; goalImpact: GoalImpact | null; utilization: UtilizationWatch | null; duplicate: DuplicateFind | null; subs: SubscriptionView; habit: MerchantHabit | null }

/** One honest line, zero lectures. Tone drives every tint in the stack. */
export function verdict({ q, pace, runway, goalImpact, utilization, duplicate, subs, habit }: VerdictInputs): Verdict {
  const lower = pace.label.toLowerCase()
  if (q.frequency === 'recurring') return { word: 'Tight.', tone: 'tight', clause: ['Subscriptions were already at your usual ', money(subs.total), '/mo before this one.'] }
  if (q.size === 'large') {
    if (runway.roomAfter < 0) return { word: 'Over.', tone: 'over', clause: ['Checking can\'t absorb this one — it needs a path.'] }
    return { word: 'Tight.', tone: 'tight', clause: ['It fits, but it takes most of the room before ', date(runway.nextPayday, 'weekdayLong'), '.'] }
  }
  if (runway.roomAfter < 0) return { word: 'Over.', tone: 'over', clause: ['This clears out the month\'s room — checking would drop under your ', money(runway.bufferFloor), ' buffer.'] }
  if (goalImpact && goalImpact.daysPushed > 0) return { word: 'Tight.', tone: 'tight', clause: [`Doable — but it's ${goalImpact.goal.name.split(' ')[0]} money now.`] }
  if (pace.projectedWith > pace.usual * 1.08 && !q.spendCategoryEssentialLike) {
    if (q.size === 'small' && runway.daysToPayday <= 4) return { word: 'Tight.', tone: 'tight', clause: ['Payday is ', date(runway.nextPayday, 'weekdayLong'), ' — runway is thin until then.'] }
    return { word: 'Tight.', tone: 'tight', clause: [cap(lower), ' lands about ', money(Math.max(1, Math.round(pace.overshoot))), ' over usual with this.'] }
  }
  if (runway.roomAfter < runway.cushion) return { word: 'Tight.', tone: 'tight', clause: [money(runway.room), ' of room before ', date(runway.nextPayday, 'weekdayLong'), ' — this takes most of it.'] }
  if (q.size === 'medium' && (utilization || duplicate)) return { word: 'Fine, with a caveat.', tone: 'fine', clause: [money(runway.room), ' of discretionary room left before your next paycheck (', date(runway.nextPayday, 'weekday'), ') after rent and subscriptions.'] }
  if (q.size === 'medium') return { word: 'Fine.', tone: 'fine', clause: [money(runway.room), ' of discretionary room left before your next paycheck (', date(runway.nextPayday, 'weekday'), ').'] }
  if (habit && habit.visitsThisMonth >= 3) return { word: 'Fine.', tone: 'fine', clause: [`${cap(ordinalWord(habit.visitsThisMonth + 1))} ${habit.merchant} this month — ${lower} still has room.`] }
  if (pace.projectedWith <= pace.usual * 0.8) return { word: 'Fine.', tone: 'fine', clause: [pace.label, ' ', pace.label.endsWith('s') ? 'are' : 'is', ' running well under usual this month.'] }
  return { word: 'Fine.', tone: 'fine', clause: [pace.label, ' has room this month.'] }
}
