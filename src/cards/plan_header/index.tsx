import type { EngineContext } from '@/engine/types'
import { Money } from '../kit'

interface Props { title: string; thing: string; amount: number }

/**
 * #2 — replaces the verdict banner on large purchases. Frameless editorial header:
 * the verdict sentence is the headline, and the one figure sits under a hairline beside
 * the thing it is the price of, so it is never an unlabelled number.
 */
function PlanHeader({ title, thing, amount }: Props) {
  return (
    <header className="px-0.5">
      {/* capped measure: the header owns all 12 columns, and a 27px headline set across
          1140px reads as a strip of words, not a sentence. */}
      <h2 className="m-0 max-w-[30ch] text-metric-lg font-extrabold leading-tight text-navy">{title}</h2>
      {/* the figure and the thing it is the price of stay side by side at every width —
          justify-between would strand them at opposite ends of the full-width header. */}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-lavender pt-3 text-navy">
        <Money value={amount} size="md" className="shrink-0" />
        <span className="min-w-0 text-body text-slate">{thing}</span>
      </div>
    </header>
  )
}

const sentenceCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'This purchase')

export const select = (ctx: EngineContext): Props => ({
  title: ctx.q.category === 'travel' ? "Not today — but here's the path." : ctx.runway.roomAfter < 0 ? "Checking can't absorb this one." : "It fits — here's the cleanest way to pay.",
  thing: sentenceCase(ctx.q.thing),
  amount: ctx.q.amount,
})

export { meta, condition } from './meta'
export default PlanHeader
