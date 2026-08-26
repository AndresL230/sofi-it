import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.goalImpact !== null && ctx.goalImpact.daysPushed > 0 && ctx.q.size !== 'large'

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'goal_impact_chip',
  group: 'Goals',
  kind: 'core',
  priority: 93,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  span: 'full',
  bare: true,
  samples: [{ query: '$60 dinner', goal: true }],
}
