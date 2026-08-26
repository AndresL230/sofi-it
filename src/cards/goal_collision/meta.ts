import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.collision !== null

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'goal_collision',
  group: 'Goals',
  kind: 'interactive',
  priority: 92,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  label: 'interactive',
  samples: [{ query: '$2,800 to move apartments', goal: true }],
}
