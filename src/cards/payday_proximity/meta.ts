import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.size === 'small' && ctx.q.frequency !== 'recurring' && ctx.runway.daysToPayday <= 4 && ctx.runway.daysToPayday >= 1 && ctx.verdict.tone !== 'fine'

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'payday_proximity',
  group: 'Money context',
  kind: 'showpiece',
  priority: 90,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  samples: [{ query: '$28 Uber' }],
}
