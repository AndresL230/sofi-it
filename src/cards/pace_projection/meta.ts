import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.frequency !== 'recurring' && ctx.q.size !== 'large' && ctx.pace.usual > 0 && ctx.pace.projectedWith > ctx.pace.usual * 1.05

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'pace_projection',
  group: 'Money context',
  kind: 'core',
  priority: 60,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  samples: [{ query: '$60 dinner' }],
}
