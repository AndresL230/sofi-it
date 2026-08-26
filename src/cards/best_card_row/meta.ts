import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.size === 'small' && ctx.q.frequency !== 'recurring'

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'best_card_row',
  group: 'Cards & rewards',
  kind: 'core',
  priority: 95,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  samples: [{ query: '$60 dinner' }],
}
