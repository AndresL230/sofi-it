import type { CardMeta, EngineContext } from '@/types'
import { CREDIT_EVENT_BOOST } from '@/types'

export const condition = (ctx: EngineContext) => ctx.utilization !== null

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'utilization_watch',
  group: 'Cards & rewards',
  kind: 'core',
  priority: 86,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  // A credit application inside six months promotes the gauge near the top of the deal.
  boost: (ctx) => (ctx.utilization?.event ? CREDIT_EVENT_BOOST : 1),
  column: 'left',
  samples: [{ query: '$140 running shoes' }],
}
