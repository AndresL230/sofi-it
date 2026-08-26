import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.carrying !== null && ctx.q.frequency !== 'recurring'

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'carrying_cost',
  group: 'Money context',
  kind: 'core',
  priority: 88,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  column: 'left',
  samples: [{ query: '$450 monitor' }],
}
