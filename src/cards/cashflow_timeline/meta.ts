import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.size === 'large' && ctx.affordability.shortfall > 0

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'cashflow_timeline',
  group: 'Money context',
  kind: 'core',
  priority: 90,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  samples: [{ query: '$1,200 flight to Lisbon in March' }],
}
