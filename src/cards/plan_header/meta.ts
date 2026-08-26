import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.size === 'large'

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'plan_header',
  group: 'Verdict & framing',
  kind: 'core',
  priority: 100,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  anchor: 'first',
  span: 'full',
  samples: [{ query: '$1,200 flight to Lisbon in March' }, { query: '$2,800 to move apartments' }],
}
