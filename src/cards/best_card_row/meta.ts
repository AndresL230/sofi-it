import type { CardMeta, EngineContext } from '@/types'

/**
 * Renders at every size now, but only when the card choice actually changes the money —
 * see CardRanking.matters. On a purchase where every card earns the same and there is nothing to
 * clear or avoid, the answer says nothing about cards and the row goes to money context instead.
 */
export const condition = (ctx: EngineContext) => ctx.ranking.matters !== null && ctx.q.frequency !== 'recurring'

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'best_card_row',
  group: 'Cards & rewards',
  kind: 'core',
  priority: 95,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  /**
   * Trip cover on a big booking is a different question from what the trip really costs after points,
   * so on that one case the row widens its own group cap instead of losing the slot to points_offset.
   */
  boost: (ctx) => (ctx.ranking.matters?.reason === 'protection' ? 1.2 : 1),
  samples: [{ query: '$60 dinner' }],
}
