import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => (ctx.q.category === 'dining' || ctx.q.category === 'coffee') && ctx.credits.some((c) => c.category === 'dining' && c.daysLeft >= 0 && c.daysLeft < 10)

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'credit_expiry',
  group: 'Cards & rewards',
  kind: 'showpiece',
  priority: 86,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  samples: [{ query: '$60 dinner' }],
}
