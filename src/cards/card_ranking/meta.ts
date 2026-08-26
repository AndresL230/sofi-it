import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.size !== 'small' && ctx.q.frequency !== 'recurring'

/**
 * Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority.
 *
 * NOT in any composer pool. The full leaderboard is now reached two ways — inside best_card_row's
 * "See all cards" expander, and standalone in the card gallery. An answer leads with the compact row
 * or with nothing; five rows of rewards arithmetic is not what a spending decision needs up front.
 */
export const meta: CardMeta = {
  id: 'card_ranking',
  group: 'Cards & rewards',
  kind: 'core',
  priority: 95,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  column: 'left',
  samples: [{ query: '$140 running shoes' }],
}
