import type { CardMeta, EngineContext } from '@/types'

export const condition = (ctx: EngineContext) => ctx.q.size === 'medium' && ctx.q.isDiscretionary && ctx.q.frequency !== 'recurring' && ctx.verdict.tone === 'tight'

/** The three allowance states the card can be in; the engine only hands us one, so the gallery stages the others. */
type Sample = { monthly: number; left: number; covers: number; remainder: number; thing: string }
const stage = (patch: Partial<Sample>) => (p: unknown) => ({ ...(p as Sample), ...patch })

/** Self-description read by the glob registry; relevance is a 0..1 score the composer multiplies by priority. */
export const meta: CardMeta = {
  id: 'guilt_free_balance',
  group: 'Large-purchase showpieces',
  kind: 'showpiece',
  priority: 84,
  condition,
  relevance: (ctx) => (condition(ctx) ? 1 : 0),
  column: 'left',
  samples: [
    { query: '$180 concert tickets', label: 'covered — the allowance pays for all of it', override: stage({ covers: 60, remainder: 0, thing: 'these tickets' }) },
    { query: '$180 concert tickets', label: 'partial — it eats what is left and then some' },
    { query: '$180 concert tickets', label: 'spent — nothing left this month', override: stage({ left: 0, covers: 0, remainder: 180, thing: 'these tickets' }) },
  ],
}
