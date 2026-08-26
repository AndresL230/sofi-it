import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.size === 'large' && ctx.runway.roomAfter < 0

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'payment_fork',
  group: 'Large-purchase showpieces',
  kind: 'showpiece',
  priority: 95,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  column: 'left',
  samples: [{ query: '$2,800 to move apartments' }],
}
