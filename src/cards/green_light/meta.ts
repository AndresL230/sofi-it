import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) =>
  ctx.q.size === 'small' && ctx.q.frequency !== 'recurring' && ctx.pace.usual > 0 && ctx.pace.projectedWith <= ctx.pace.usual * 0.9 && (ctx.goalImpact ? ctx.goalImpact.onTrack : true)

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'green_light',
  group: 'Verdict & framing',
  kind: 'core',
  priority: 85,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  samples: [{ query: '$54 groceries' }],
}
