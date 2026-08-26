import type { CardStack, CardType, EngineContext, StackEntry } from './types'
import { INTERACTIVE_CARDS, SHOWPIECE_CARDS } from './types'

/**
 * Composer: (classification facts in ctx, goal state, data conditions) → CardStack.
 * Golden paths encode the trigger matrix (the nine queries); everything else gets the generic
 * stack for its size/frequency. The composer never imports a card — eligibility is injected so
 * each card's co-located `condition(ctx)` stays with the card (eslint: engine ↛ cards).
 *
 * Caps: 7 cards · 1 interactive · 1 showpiece (2 on large). Required framing cards are never dropped;
 * everything else is dropped lowest-priority-first.
 */
const MAX_CARDS = 7
const e = (type: CardType, priority: number, opts: Partial<StackEntry> = {}): StackEntry => ({ type, priority, ...opts })

type Path = { name: string; layout: CardStack['layout']; entries: StackEntry[] }

function goldenPath(ctx: EngineContext): Path {
  const { q } = ctx
  const goal = !!ctx.goal
  const framing = (top: CardType = 'verdict_banner') => [e(top, 100, { required: true }), e('consequence_line', 40, { required: true }), e('post_purchase_footer', 30, { required: true })]

  if (q.frequency === 'recurring') {
    return { name: 'crunchyroll', layout: 'recurring', entries: [...framing(), e('price_creep', 90), e('annualized', 85), e('subscription_stack', 80), e('overlap_check', 75)] }
  }
  if (q.size === 'large') {
    if (q.category === 'travel') {
      return { name: 'flight', layout: 'plan', entries: [
        e('plan_header', 100, { required: true }), e('total_cost_of_event', 95), e('cashflow_timeline', 90), e('points_offset', 85), e('card_ranking', 80),
        goal ? e('goal_collision', 88) : e('track_goal_cta', 88, { required: true }), e('post_purchase_footer', 30, { required: true }),
      ] }
    }
    return { name: q.category === 'housing_moving' ? 'moving' : 'large-generic', layout: 'plan', entries: [
      e('plan_header', 100, { required: true }), e('payment_fork', 95), e('goal_collision', 92), e('carrying_cost', 85), e('discretionary_runway', 80), e('cashflow_timeline', 70), e('card_ranking', 60),
      e('consequence_line', 40, { required: true }), e('post_purchase_footer', 30, { required: true }),
    ] }
  }
  if (q.size === 'medium') {
    const base = [...framing(), e('card_ranking', 95), e('goal_impact_chip', 93)]
    if (q.category === 'shopping_apparel') return { name: 'shoes', layout: 'considered', entries: [...base, e('hold_24h', 90), e('duplicate_check', 88), e('utilization_watch', 86), e('guilt_free_balance', 84), e('benefits_check', 82), e('impulse_frequency', 60), e('cost_per_use', 50)] }
    if (q.category === 'shopping_electronics') return { name: 'monitor', layout: 'considered', entries: [...base, e('cost_per_use', 90), e('carrying_cost', 88), e('benefits_check', 86), e('guilt_free_balance', 84), e('utilization_watch', 82), e('hold_24h', 60), e('duplicate_check', 55)] }
    if (q.category === 'entertainment') return { name: 'tickets', layout: 'considered', entries: [...base, e('discretionary_runway', 90), e('impulse_frequency', 88), e('guilt_free_balance', 86), e('hold_24h', 84), e('utilization_watch', 70), e('benefits_check', 50)] }
    return { name: 'medium-generic', layout: 'considered', entries: [...base, e('category_pulse', 90), e('discretionary_runway', 88), e('hold_24h', 86), e('utilization_watch', 84), e('guilt_free_balance', 82), e('duplicate_check', 80), e('benefits_check', 70), e('pace_projection', 60)] }
  }
  // small
  const base = [...framing(), e('best_card_row', 95), e('goal_impact_chip', 93)]
  if (q.category === 'coffee') return { name: 'latte', layout: 'quick', entries: [...base, e('merchant_habit', 90), e('category_pulse', 88), e('green_light', 60), e('pace_projection', 50)] }
  if (q.category === 'dining') return { name: 'dinner', layout: 'quick', entries: [...base, e('category_pulse', 90), e('split_check', 88), e('credit_expiry', 86), e('merchant_habit', 70), e('pace_projection', 60), e('green_light', 50)] }
  if (q.category === 'transport') return { name: 'uber', layout: 'quick', entries: [...base, e('payday_proximity', 90), e('category_pulse', 88), e('pace_projection', 60)] }
  if (q.category === 'groceries') return { name: 'groceries', layout: 'quick', entries: [...base, e('green_light', 90), e('category_pulse', 88), e('credit_sweep', 60)] }
  return { name: 'small-generic', layout: 'quick', entries: [...base, e('category_pulse', 90), e('green_light', 85), e('credit_expiry', 80), e('payday_proximity', 78), e('credit_sweep', 70), e('pace_projection', 60), e('merchant_habit', 55)] }
}

export function compose(ctx: EngineContext, eligible: (t: CardType) => boolean): CardStack {
  const path = goldenPath(ctx)
  const showpieceCap = ctx.q.size === 'large' ? 2 : 1
  // 1. data conditions — a card whose condition fails silently doesn't render
  const seen = new Set<CardType>()
  const candidates = path.entries.filter((en) => { if (seen.has(en.type)) return false; seen.add(en.type); return en.required || eligible(en.type) })
  // required framing cards still need their own condition (e.g. an empty consequence line)
  const kept: StackEntry[] = candidates.filter((en) => !en.required || eligible(en.type))
  // 2. caps by priority
  const byPriority = [...kept].sort((a, b) => b.priority - a.priority)
  let interactive = 0, showpieces = 0
  const chosen: StackEntry[] = []
  for (const en of byPriority) {
    const isI = INTERACTIVE_CARDS.includes(en.type), isS = SHOWPIECE_CARDS.includes(en.type)
    if (isI && interactive >= 1) continue
    if (isS && showpieces >= showpieceCap) continue
    chosen.push(en)
    if (isI) interactive++
    if (isS) showpieces++
  }
  // 3. total cap — drop lowest-priority optional cards first
  while (chosen.length > MAX_CARDS) {
    const idx = [...chosen].reverse().findIndex((c) => !c.required)
    if (idx < 0) break
    chosen.splice(chosen.length - 1 - idx, 1)
  }
  const order = new Map(path.entries.map((en, i) => [en.type, i]))
  const cards = chosen.sort((a, b) => (order.get(a.type) ?? 0) - (order.get(b.type) ?? 0)).map((c) => c.type)
  const dropped = path.entries.map((x) => x.type).filter((t) => !cards.includes(t))
  return { path: path.name, layout: path.layout, cards, dropped }
}
