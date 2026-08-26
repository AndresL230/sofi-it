import type { CardMeta, EngineContext } from '@/types'

const NEVER = ['groceries', 'transport', 'housing_moving', 'subscription']

export const condition = (ctx: EngineContext) => ctx.q.size === 'medium' && ctx.q.isDiscretionary && ctx.q.frequency !== 'recurring' && !NEVER.includes(ctx.q.category)

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'hold_24h',
  group: 'Behavior lens',
  kind: 'interactive',
  priority: 90,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  label: 'interactive',
  samples: [{ query: '$140 running shoes' }],
}
