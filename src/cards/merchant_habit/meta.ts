import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.merchantHabit !== null && ctx.merchantHabit.visitsThisMonth >= 2 && ctx.q.size === 'small'

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'merchant_habit',
  group: 'Behavior lens',
  kind: 'core',
  priority: 90,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  samples: [{ query: '$6 latte' }],
}
