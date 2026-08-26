/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.size === 'medium' && ctx.q.isDiscretionary && ctx.q.frequency !== 'recurring' && ctx.verdict.tone === 'tight'

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'guilt_free_balance',
  group: 'Large-purchase showpieces',
  kind: 'showpiece',
  priority: 84,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  column: 'left',
  samples: [{ query: '$180 concert tickets', label: 'gold — exceeds what\'s left' }, { query: '$180 concert tickets', label: 'green — within allowance', override: (p) => ((p: any) =>  ({ ...p, covers: p.left, remainder: 0, thing: 'these tickets' }) )(p)}],
}
