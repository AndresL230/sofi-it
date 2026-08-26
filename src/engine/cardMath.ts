import type { CardRanking, Category, CreditCardRule, FinancialProfile, QueryFacts, RankedCard, RewardCategory, RichText, UserModel, UtilizationWatch } from './types'
import { money, num } from './format'
import { PRIORITY_RANK, TIE_BAND, nearCreditEvent, revolves, utilizationLine } from './profile'

export function rewardCategory(c: Category): RewardCategory {
  switch (c) {
    case 'dining': case 'coffee': return 'dining'
    case 'groceries': return 'groceries'
    case 'travel': return 'travel'
    case 'transport': return 'transport'
    case 'entertainment': return 'entertainment'
    case 'shopping_apparel': case 'shopping_electronics': return 'shopping'
    default: return 'other'
  }
}

const NOUN: Record<RewardCategory, string> = { dining: 'dining', groceries: 'groceries', travel: 'travel', transport: 'rides', entertainment: 'entertainment', shopping: 'this', other: 'this' }

function earn(card: CreditCardRule, rc: RewardCategory, amount: number) {
  const mult = card.bonus[rc] ?? card.base
  const back = amount * mult * (card.pointValueCents / 100)
  return { mult, back: Math.round(back * 100) / 100 }
}

/**
 * One month of interest on this purchase at this card's APR.
 * Zero for someone who pays in full (they never carry), for charge cards (no revolving line),
 * and for cards whose APR the spec leaves unknown — an APR is never invented to make a point.
 */
function monthInterest(card: CreditCardRule, amount: number, fp: FinancialProfile): number {
  if (!revolves(fp) || card.apr === null || card.limit === null) return 0
  return Math.round(amount * (card.apr / 12) * 100) / 100
}

/** Share of a monthly bonus cap at which the capped card is treated as locked to that category. */
const CAP_LOCK_RATIO = 0.9

/**
 * Rank the five cards for this purchase.
 *
 * Objective depends on posture: someone who pays in full is ranked on rewards; someone who revolves is
 * ranked on what the purchase actually costs — rewards minus one month of interest — then by APR ascending.
 * Ties (rewards identical, e.g. a 2% flat card against a 1x/2¢ card): travel prefers trip protection,
 * otherwise the flat house card wins ("simple and best"). `priority` decides only a *near* tie — a gap
 * that exists but is under 5% — so it can never invert an exact tie the structural rule already answers,
 * and never overrides a material difference.
 */
export function rankCards(user: UserModel, q: QueryFacts): CardRanking {
  const fp = user.financialProfile
  const rc = rewardCategory(q.category)
  const cost = revolves(fp)
  const line = utilizationLine(fp)
  const rows = user.cards.map((card) => {
    const { mult, back } = earn(card, rc, q.amount)
    let disqualified = false
    let badge: RankedCard['badge']
    // A capped-bonus card whose monthly cap is ≥90% used is out for every purchase this month — the category
    // is already locked in (Citi: dining), so it earns nothing useful on anything else either.
    if (card.cap && card.cap.used / card.cap.monthlyCap >= CAP_LOCK_RATIO) {
      const left = card.cap.monthlyCap - card.cap.used
      disqualified = true
      badge = { kind: 'cap', left, cap: card.cap.monthlyCap, rate: card.cap.rate, tone: 'gold' }
    }
    const utilizationAfter = card.limit ? (card.balance + q.amount) / card.limit : null
    const earned = disqualified ? 0 : back
    const interest = disqualified ? 0 : monthInterest(card, q.amount, fp)
    return { card, back: earned, interest, netValue: Math.round((earned - interest) * 100) / 100, multiplier: mult, disqualified, badge, utilizationAfter }
  })
  type Row = typeof rows[number]
  const valueOf = (r: Row) => (cost ? r.netValue : r.back)
  const structural = (a: Row, b: Row) => {
    if (cost && (a.card.apr ?? 0) !== (b.card.apr ?? 0)) return (a.card.apr ?? 0) - (b.card.apr ?? 0)
    if (rc === 'travel') return Number(!!b.card.benefits.tripProtection) - Number(!!a.card.benefits.tripProtection)
    return Number(!!b.card.isFlatHouseCard) - Number(!!a.card.isFlatHouseCard)
  }
  const byValue = (a: Row, b: Row) => (valueOf(b) !== valueOf(a) ? valueOf(b) - valueOf(a) : structural(a, b))
  const live = rows.filter((r) => !r.disqualified).sort(byValue)

  // `priority` breaks a near-tie between the top two, and nothing else.
  let tieBreak: CardRanking['tieBreak'] = null
  if (live.length > 1) {
    const [a, b] = live
    const spread = Math.max(Math.abs(valueOf(a)), Math.abs(valueOf(b)))
    const gap = spread > 0 ? (valueOf(a) - valueOf(b)) / spread : 0
    const rank = PRIORITY_RANK[fp.priority]
    if (gap > 0 && gap <= TIE_BAND && rank(b.card) > rank(a.card)) {
      live[0] = b
      live[1] = a
      tieBreak = { by: fp.priority, winner: b.card.name, runnerUp: a.card.name, gap: Math.round(gap * 1000) / 10 }
    }
  }

  const sorted = live.concat(rows.filter((r) => r.disqualified))
  const top = sorted[0]
  const ranked: RankedCard[] = sorted.map((r, i) => {
    const winner = i === 0
    const delta = Math.round((valueOf(top) - valueOf(r)) * 100) / 100
    const isBonus = (r.card.bonus[rc] ?? 0) > 0
    let badge = r.badge
    if (!badge && r.utilizationAfter !== null && r.utilizationAfter > line && !winner) badge = { kind: 'utilization', pct: Math.round(r.utilizationAfter * 100), payBy: r.card.statementClose, tone: 'salmon' }
    if (!badge && !isBonus && !r.card.isFlatHouseCard && !winner && r.card.program !== 'cash') badge = { kind: 'noBonus', tone: 'gray' }
    return {
      card: r.card, back: r.back, interest: r.interest, netValue: r.netValue, multiplier: r.multiplier,
      disqualified: r.disqualified, utilizationAfter: r.utilizationAfter, winner, delta, badge,
      reason: reasonFor(r.card, rc, q, winner, isBonus, r.disqualified, cost),
      costNote: !r.disqualified && r.interest > r.back ? [money(r.interest, { cents: 'decimal' }), ' of interest against ', money(r.back, { cents: 'decimal' }), ' back — it costs more in interest than it earns back.'] : undefined,
      deltaLabel: r.disqualified ? [] : winner ? [] : delta === 0 ? (rc === 'travel' && !r.card.benefits.tripProtection ? ['same $, no protection'] : ['same $']) : [money(delta, { prefix: '−', cents: 'decimal' }), cost ? ' vs best, all in' : ' vs best'],
    }
  })
  const flat = ranked.find((r) => r.card.isFlatHouseCard)!
  return { ranked, winner: ranked[0], flat, deltaVsFlat: Math.round((ranked[0].back - flat.back) * 100) / 100, objective: cost ? 'cost' : 'rewards', tieBreak }
}

function reasonFor(card: CreditCardRule, rc: RewardCategory, q: QueryFacts, winner: boolean, isBonus: boolean, disqualified: boolean, cost: boolean): RichText {
  const mult = card.bonus[rc] ?? card.base
  if (disqualified && card.cap) return card.cap.category === rc ? [num(card.cap.rate), '% top category (', card.cap.category, ')'] : ['Top category is ', card.cap.category, ' this month']
  // Carrying a balance changes what "best" means: the winner is the cheapest to carry, not the richest to earn.
  if (cost && winner) {
    const back = money((mult * q.amount * card.pointValueCents) / 100, { cents: 'decimal' })
    return card.apr === null
      ? ['Nothing to carry on this one — it earns ', back, ' and adds no interest.']
      : ['Cheapest to carry at ', num(card.apr * 100, { fraction: 2, suffix: '%' }), ' — ', back, ' back, less what the interest takes.']
  }
  if (card.program === 'cash') {
    if (card.isFlatHouseCard) return winner ? ['Flat ', num(mult), '% — no bonus category applies to ', NOUN[rc], '. Simple and best.'] : (rc === 'travel' ? ['Flat ', num(mult), '% — but no travel protection on a ', money(q.amount), ' booking'] : ['Flat ', num(mult), '%, your default card'])
    return [num(mult, { fraction: 1 }), '% flat']
  }
  if (rc === 'travel' && card.benefits.tripProtection) return [num(mult), 'x travel + trip delay/cancellation protection — worth more than the points gap on a big trip.']
  if (isBonus) {
    const credit = card.credits.find((c) => c.category === rc)
    if (winner && credit) return [num(mult), 'x points ≈ ', money(card.bonus[rc]! * q.amount * card.pointValueCents / 100, { cents: 'decimal' }), ' back — and it clears your unused ', money(credit.amount), ' ', NOUN[rc], ' credit.']
    if (winner) return [num(mult), 'x points ≈ ', money(card.bonus[rc]! * q.amount * card.pointValueCents / 100, { cents: 'decimal' }), ' back.']
    return [num(mult), 'x ', NOUN[rc], credit ? ' — no credit to clear' : '']
  }
  const hint = rc === 'travel' ? ' on airfare booked direct' : ' here'
  return [num(1), 'x', hint]
}

/**
 * The first non-disqualified card that would sit above the utilization line after this purchase (medium+ only).
 * The line is 30% normally and 20% while a credit application is within six months.
 */
export function utilizationWatch(ranking: CardRanking, q: QueryFacts, fp: FinancialProfile): UtilizationWatch | null {
  if (q.size === 'small') return null
  const threshold = utilizationLine(fp)
  const r = ranking.ranked.find((x) => !x.disqualified && x.utilizationAfter !== null && x.utilizationAfter > threshold)
  if (!r || r.utilizationAfter === null || !r.card.limit) return null
  return { card: r.card, before: r.card.balance / r.card.limit, after: r.utilizationAfter, threshold, payBy: r.card.statementClose, event: nearCreditEvent(fp) }
}
