import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.credits.length >= 1 && ctx.q.frequency !== 'recurring' && ctx.q.size !== 'large'

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'credit_sweep',
  group: 'Cards & rewards',
  kind: 'core',
  priority: 60,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  samples: [{ query: '$54 groceries' }],
}
