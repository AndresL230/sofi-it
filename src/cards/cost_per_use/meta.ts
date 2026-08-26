import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.size === 'medium' && ctx.q.isDiscretionary && ctx.q.frequency !== 'recurring' && (ctx.q.category === 'shopping_apparel' || ctx.q.category === 'shopping_electronics' || ctx.q.category === 'other')

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'cost_per_use',
  group: 'Behavior lens',
  kind: 'interactive',
  priority: 90,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  label: 'interactive',
  samples: [{ query: '$140 running shoes' }, { query: '$450 monitor' }],
}
