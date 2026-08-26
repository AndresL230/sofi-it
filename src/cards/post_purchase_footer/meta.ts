import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.ledger.length > 0

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'post_purchase_footer',
  group: 'Verdict & framing',
  kind: 'core',
  priority: 30,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  anchor: 'last',
  span: 'full',
  samples: [{ query: '$60 dinner', goal: true }],
}
