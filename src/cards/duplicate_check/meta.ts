import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.duplicate !== null

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'duplicate_check',
  group: 'Behavior lens',
  kind: 'core',
  priority: 88,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  samples: [{ query: '$140 running shoes' }],
}
