import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.frequency === 'recurring' && ctx.subs.overlap !== null

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'overlap_check',
  group: 'Recurring',
  kind: 'core',
  priority: 75,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  samples: [{ query: '$15/mo Crunchyroll' }],
}
