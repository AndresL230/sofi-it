import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.consequence.length > 0

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'consequence_line',
  group: 'Verdict & framing',
  kind: 'core',
  priority: 40,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  anchor: 'last',
  span: 'full',
  bare: true,
  samples: [{ query: '$60 dinner' }],
}
