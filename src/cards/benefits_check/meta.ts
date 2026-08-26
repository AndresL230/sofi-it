import type { CardMeta, EngineContext } from '@/types'

const EXCLUDED = ['dining', 'coffee', 'groceries', 'transport', 'subscription']

export const condition = (ctx: EngineContext) => ctx.q.size !== 'small' && !EXCLUDED.includes(ctx.q.category) && ctx.benefits.some((b) => b.active)

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'benefits_check',
  group: 'Cards & rewards',
  kind: 'core',
  priority: 82,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  column: 'left',
  samples: [{ query: '$140 running shoes', label: 'apparel' }, { query: '$450 monitor', label: 'electronics — extended warranty' }],
}
