import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.frequency !== 'recurring' && ctx.q.size !== 'small' && ctx.runway.room > 0

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'discretionary_runway',
  group: 'Money context',
  kind: 'core',
  priority: 88,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  samples: [{ query: '$180 concert tickets' }],
}
