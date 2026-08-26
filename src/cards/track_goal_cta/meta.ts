import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => !ctx.goal && ctx.q.category === 'travel' && ctx.q.size === 'large'

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'track_goal_cta',
  group: 'Goals',
  kind: 'core',
  priority: 88,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  span: 'full',
  samples: [
    { query: '$1,200 flight to Lisbon in March' },
    { query: '$1,200 flight to Lisbon in March', label: 'already tracked', override: (p) => ({ ...(p as Record<string, unknown>), tracked: true }) },
  ],
}
