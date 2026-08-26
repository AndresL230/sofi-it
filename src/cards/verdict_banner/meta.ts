/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.size !== 'large'

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'verdict_banner',
  group: 'Verdict & framing',
  kind: 'core',
  priority: 100,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  anchor: 'first',
  span: 'full',
  samples: [
      { query: '$60 dinner', label: 'fine' },
      { query: '$60 dinner', goal: true, label: 'tight — goal exists' },
      { query: '$60 dinner', label: 'over', override: (p) => ((p: any) =>  ({ ...p, word: 'Over.', tone: 'over', clause: ["This clears out the month's room."], amount: p.amount * 8 }) )(p)},
    ],
}
