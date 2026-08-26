import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.isRestaurant && ctx.q.amount >= 40 && ctx.q.size !== 'large'

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'split_check',
  group: 'Behavior lens',
  kind: 'interactive',
  priority: 88,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  label: 'interactive',
  samples: [{ query: '$60 dinner' }],
}
