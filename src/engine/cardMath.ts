import type { CardRanking, Category, CreditCardRule, QueryFacts, RankedCard, RewardCategory, RichText, UserModel, UtilizationWatch } from './types'
import { money, num } from './format'

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

/** Share of a monthly bonus cap at which the capped card is treated as locked to that category. */
const CAP_LOCK_RATIO = 0.9

/** Rank the five cards for this purchase. Ties: travel prefers trip protection; otherwise the flat house card wins ("simple and best"). */
export function rankCards(user: UserModel, q: QueryFacts): CardRanking {
  const rc = rewardCategory(q.category)
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
    return { card, back: disqualified ? 0 : back, multiplier: mult, disqualified, badge, utilizationAfter }
  })
  const flatFirst = (a: typeof rows[number], b: typeof rows[number]) => {
    if (b.back !== a.back) return b.back - a.back
    if (rc === 'travel') return Number(!!b.card.benefits.tripProtection) - Number(!!a.card.benefits.tripProtection)
    return Number(!!b.card.isFlatHouseCard) - Number(!!a.card.isFlatHouseCard)
  }
  const sorted = rows.filter((r) => !r.disqualified).sort(flatFirst).concat(rows.filter((r) => r.disqualified))
  const top = sorted[0]
  const ranked: RankedCard[] = sorted.map((r, i) => {
    const winner = i === 0
    const delta = Math.round((top.back - r.back) * 100) / 100
    const isBonus = (r.card.bonus[rc] ?? 0) > 0
    let badge = r.badge
    if (!badge && r.utilizationAfter !== null && r.utilizationAfter > 0.3 && !winner) badge = { kind: 'utilization', pct: Math.round(r.utilizationAfter * 100), payBy: r.card.statementClose, tone: 'salmon' }
    if (!badge && !isBonus && !r.card.isFlatHouseCard && !winner && r.card.program !== 'cash') badge = { kind: 'noBonus', tone: 'gray' }
    return { card: r.card, back: r.back, multiplier: r.multiplier, disqualified: r.disqualified, utilizationAfter: r.utilizationAfter, winner, delta, badge,
      reason: reasonFor(r.card, rc, q, winner, isBonus, r.disqualified, user),
      deltaLabel: r.disqualified ? [] : winner ? [] : delta === 0 ? (rc === 'travel' && !r.card.benefits.tripProtection ? ['same $, no protection'] : ['same $']) : [money(delta, { prefix: '−', cents: 'decimal' }), ' vs best'] }
  })
  const flat = ranked.find((r) => r.card.isFlatHouseCard)!
  return { ranked, winner: ranked[0], flat, deltaVsFlat: Math.round((ranked[0].back - flat.back) * 100) / 100 }
}

function reasonFor(card: CreditCardRule, rc: RewardCategory, q: QueryFacts, winner: boolean, isBonus: boolean, disqualified: boolean, user: UserModel): RichText {
  const mult = card.bonus[rc] ?? card.base
  if (disqualified && card.cap) return card.cap.category === rc ? [num(card.cap.rate), '% top category (', card.cap.category, ')'] : ['Top category is ', card.cap.category, ' this month']
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
  void user
  return [num(1), 'x', hint]
}

/** The first non-disqualified card that would sit above 30% after this purchase (medium+ only). */
export function utilizationWatch(ranking: CardRanking, q: QueryFacts): UtilizationWatch | null {
  if (q.size === 'small') return null
  const r = ranking.ranked.find((x) => !x.disqualified && x.utilizationAfter !== null && x.utilizationAfter > 0.3)
  if (!r || r.utilizationAfter === null || !r.card.limit) return null
  return { card: r.card, before: r.card.balance / r.card.limit, after: r.utilizationAfter, threshold: 0.3, payBy: r.card.statementClose }
}
