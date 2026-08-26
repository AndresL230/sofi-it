import type { CardMeta, CardStack, CardType, EngineContext } from '@/types'

/**
 * Composer: (context, card metas) → CardStack.
 *   1. filter by each card's `condition(ctx)`  (a card whose data condition fails silently doesn't render)
 *   2. score = relevance(ctx) × priority       (relevance 0..1 is the card's own judgment for THIS purchase)
 *   3. sort by score
 *   4. caps: 7 cards · 1 interactive · 1 showpiece (2 on large) · 1 per capped group (see GROUP_CAP)
 *   5. anchors: verdict/plan header first, consequence + footer last; anchors are never dropped
 * The nine matrix queries take the golden-path bypass: a hand-ordered stack (still condition-filtered and capped),
 * so the scripted demo is deterministic. The engine never imports a card — metas are injected by the registry.
 */
const MAX_CARDS = 7

/**
 * Per-group ceiling, applied alongside the kind caps.
 * Seven cards declare `group: 'Cards & rewards'` (which card to pay with, utilization, benefits,
 * credit expiry, points, sweep). Two or three of them cleared every stack, so every answer read
 * like a credit-card ad and the actual verdict got crowded out. One per answer: the highest-scoring
 * one wins, which keeps the pay-with recommendation on the golden paths (it is ordered first there)
 * and lets utilization / benefits take the slot when it is genuinely the more useful angle.
 * Anchors are exempt — they are never dropped.
 */
const GROUP_CAP: Record<string, number> = { 'Cards & rewards': 1 }

/**
 * A card's profile-driven multiplier (default 1). See CardMeta.boost — today only utilization_watch
 * declares one, when a credit application is within six months.
 */
const boostOf = (m: CardMeta, ctx: EngineContext) => Math.max(1, m.boost?.(ctx) ?? 1)

/**
 * Group ceilings for this answer. A boosted card widens its own group by one, so promoting
 * utilization ahead of a lease application ADDS the gauge to the deal rather than evicting
 * "which card" — the two answer different questions.
 */
function groupCaps(eligible: CardMeta[], ctx: EngineContext): Record<string, number> {
  const caps = { ...GROUP_CAP }
  for (const m of eligible) if (boostOf(m, ctx) > 1 && caps[m.group] !== undefined) caps[m.group] += 1
  return caps
}

const MATRIX_PATHS: Record<string, { layout: CardStack['layout']; cards: CardType[] }> = {
  latte: { layout: 'quick', cards: ['verdict_banner', 'best_card_row', 'goal_impact_chip', 'merchant_habit', 'category_pulse', 'green_light', 'pace_projection', 'consequence_line', 'post_purchase_footer'] },
  dinner: { layout: 'quick', cards: ['verdict_banner', 'best_card_row', 'goal_impact_chip', 'category_pulse', 'split_check', 'credit_expiry', 'merchant_habit', 'pace_projection', 'green_light', 'consequence_line', 'post_purchase_footer'] },
  uber: { layout: 'quick', cards: ['verdict_banner', 'best_card_row', 'goal_impact_chip', 'payday_proximity', 'category_pulse', 'pace_projection', 'consequence_line', 'post_purchase_footer'] },
  crunchyroll: { layout: 'recurring', cards: ['verdict_banner', 'price_creep', 'annualized', 'subscription_stack', 'overlap_check', 'consequence_line', 'post_purchase_footer'] },
  shoes: { layout: 'considered', cards: ['verdict_banner', 'card_ranking', 'goal_impact_chip', 'hold_24h', 'duplicate_check', 'utilization_watch', 'guilt_free_balance', 'benefits_check', 'impulse_frequency', 'cost_per_use', 'consequence_line', 'post_purchase_footer'] },
  monitor: { layout: 'considered', cards: ['verdict_banner', 'card_ranking', 'goal_impact_chip', 'cost_per_use', 'carrying_cost', 'benefits_check', 'guilt_free_balance', 'utilization_watch', 'hold_24h', 'duplicate_check', 'consequence_line', 'post_purchase_footer'] },
  tickets: { layout: 'considered', cards: ['verdict_banner', 'card_ranking', 'goal_impact_chip', 'discretionary_runway', 'impulse_frequency', 'guilt_free_balance', 'hold_24h', 'utilization_watch', 'benefits_check', 'consequence_line', 'post_purchase_footer'] },
  flight: { layout: 'plan', cards: ['plan_header', 'total_cost_of_event', 'cashflow_timeline', 'points_offset', 'card_ranking', 'goal_collision', 'track_goal_cta', 'post_purchase_footer'] },
  moving: { layout: 'plan', cards: ['plan_header', 'payment_fork', 'goal_collision', 'carrying_cost', 'discretionary_runway', 'cashflow_timeline', 'card_ranking', 'consequence_line', 'post_purchase_footer'] },
}

/** Which golden path (if any) a purchase maps onto. Unknown purchases fall through to scoring. */
export function matrixPath(ctx: EngineContext): string | null {
  const { q } = ctx
  if (q.frequency === 'recurring') return 'crunchyroll'
  if (q.size === 'large') return q.category === 'travel' ? 'flight' : q.category === 'housing_moving' ? 'moving' : null
  if (q.size === 'medium') return q.category === 'shopping_apparel' ? 'shoes' : q.category === 'shopping_electronics' ? 'monitor' : q.category === 'entertainment' ? 'tickets' : null
  return q.category === 'coffee' ? 'latte' : q.category === 'dining' ? 'dinner' : q.category === 'transport' ? 'uber' : null
}

export function layoutFor(ctx: EngineContext): CardStack['layout'] {
  if (ctx.q.frequency === 'recurring') return 'recurring'
  if (ctx.q.size === 'large') return 'plan'
  return ctx.q.size === 'medium' ? 'considered' : 'quick'
}

/** Cards a generic (non-matrix) purchase may draw from, by size class. */
function genericPool(ctx: EngineContext): CardType[] {
  if (ctx.q.frequency === 'recurring') return ['verdict_banner', 'annualized', 'subscription_stack', 'price_creep', 'overlap_check', 'consequence_line', 'post_purchase_footer']
  if (ctx.q.size === 'large') return ['plan_header', 'payment_fork', 'total_cost_of_event', 'goal_collision', 'cashflow_timeline', 'carrying_cost', 'discretionary_runway', 'points_offset', 'card_ranking', 'track_goal_cta', 'consequence_line', 'post_purchase_footer']
  if (ctx.q.size === 'medium') return ['verdict_banner', 'card_ranking', 'goal_impact_chip', 'category_pulse', 'discretionary_runway', 'hold_24h', 'utilization_watch', 'guilt_free_balance', 'duplicate_check', 'benefits_check', 'impulse_frequency', 'cost_per_use', 'carrying_cost', 'pace_projection', 'consequence_line', 'post_purchase_footer']
  return ['verdict_banner', 'best_card_row', 'goal_impact_chip', 'category_pulse', 'green_light', 'credit_expiry', 'payday_proximity', 'merchant_habit', 'split_check', 'credit_sweep', 'pace_projection', 'consequence_line', 'post_purchase_footer']
}

export function compose(ctx: EngineContext, metas: CardMeta[]): CardStack {
  const byId = new Map(metas.map((m) => [m.id, m]))
  const pathName = matrixPath(ctx)
  const matrix = pathName ? MATRIX_PATHS[pathName] : null
  const pool = matrix ? matrix.cards : genericPool(ctx)
  const layout = matrix ? matrix.layout : layoutFor(ctx)
  const showpieceCap = ctx.q.size === 'large' ? 2 : 1

  // 1. conditions
  const eligible = pool.map((id) => byId.get(id)).filter((m): m is CardMeta => !!m && m.condition(ctx))
  const caps = groupCaps(eligible, ctx)
  // 2–3. score: golden paths keep their hand order (index-based score) — scoring only breaks ties / ranks generic
  // stacks. A profile boost multiplies the score either way, so a promoted card survives the 7-card cap.
  const scored = eligible.map((m, i) => ({ m, score: (matrix ? (pool.length - i) * 1000 + m.relevance(ctx) * m.priority : Math.max(0, Math.min(1, m.relevance(ctx))) * m.priority) * boostOf(m, ctx) }))
  scored.sort((a, b) => b.score - a.score)
  // 4. caps
  let interactive = 0, showpieces = 0
  const perGroup = new Map<string, number>()
  const kept: CardMeta[] = []
  for (const { m } of scored) {
    if (m.kind === 'interactive' && interactive >= 1) continue
    if (m.kind === 'showpiece' && showpieces >= showpieceCap) continue
    const groupCap = caps[m.group]
    if (groupCap !== undefined && !m.anchor && (perGroup.get(m.group) ?? 0) >= groupCap) continue
    kept.push(m)
    if (m.kind === 'interactive') interactive++
    if (m.kind === 'showpiece') showpieces++
    perGroup.set(m.group, (perGroup.get(m.group) ?? 0) + 1)
  }
  while (kept.length > MAX_CARDS) {
    const idx = [...kept].reverse().findIndex((m) => !m.anchor)
    if (idx < 0) break
    kept.splice(kept.length - 1 - idx, 1)
  }
  // 5. anchors first/last; the rest keep pool order, divided by any profile boost so a promoted
  //    card also moves UP the deal rather than only surviving the cap.
  const order = new Map(pool.map((id, i) => [id, i]))
  const rank = (m: CardMeta) => (m.anchor === 'first' ? -1000 : m.anchor === 'last' ? 1000 + (m.id === 'post_purchase_footer' ? 1 : 0) : (order.get(m.id) ?? 0) / boostOf(m, ctx))
  const cards = kept.sort((a, b) => rank(a) - rank(b)).map((m) => m.id)
  return { path: pathName ?? `${layout}-generic`, layout, cards, dropped: pool.filter((id) => !cards.includes(id)) }
}

/** Card-inspector view of a composition: every candidate with its condition, score, and why it was kept or dropped. */
export function explain(ctx: EngineContext, metas: CardMeta[]): { path: string; rows: { id: CardType; kind: string; condition: boolean; relevance: number; priority: number; score: number; kept: boolean; reason: string }[]; stack: CardStack } {
  const stack = compose(ctx, metas)
  const byId = new Map(metas.map((m) => [m.id, m]))
  const pathName = matrixPath(ctx)
  const pool = pathName ? MATRIX_PATHS[pathName].cards : genericPool(ctx)
  const showpieceCap = ctx.q.size === 'large' ? 2 : 1
  const kept = new Set(stack.cards)
  let interactiveSeen = 0, showpieceSeen = 0
  const rows = pool.map((id) => {
    const m = byId.get(id)!
    const condition = m.condition(ctx)
    const relevance = condition ? Math.max(0, Math.min(1, m.relevance(ctx))) : 0
    const score = condition ? Math.round(relevance * m.priority * boostOf(m, ctx)) : 0
    const isKept = kept.has(id)
    let reason = isKept ? (m.anchor ? `anchor (${m.anchor})` : 'kept') : !condition ? 'condition false' : ''
    if (!isKept && condition) {
      if (m.kind === 'interactive' && interactiveSeen >= 1) reason = 'cap: 1 interactive'
      else if (m.kind === 'showpiece' && showpieceSeen >= showpieceCap) reason = `cap: ${showpieceCap} showpiece`
      else reason = 'cap: 7 cards (lower priority)'
    }
    if (isKept && m.kind === 'interactive') interactiveSeen++
    if (isKept && m.kind === 'showpiece') showpieceSeen++
    return { id, kind: m.kind, condition, relevance, priority: m.priority, score, kept: isKept, reason }
  })
  return { path: stack.path, rows, stack }
}
