import type { EngineContext } from '@/engine/types'
import { defineCard, Money } from './kit'

interface Props { title: string; amount: number }

/** #2 — replaces the verdict banner on large purchases. No tint. */
function PlanHeader({ title, amount }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-[2px]">
      <h2 className="m-0 text-h2 font-extrabold text-ink">{title}</h2>
      <Money value={amount} size="lg" />
    </div>
  )
}

export const condition = (ctx: EngineContext) => ctx.q.size === 'large'
export const select = (ctx: EngineContext): Props => ({
  title: ctx.q.category === 'travel' ? "Not today — but here's the path." : ctx.runway.roomAfter < 0 ? "Checking can't absorb this one." : "It fits — here's the cleanest way to pay.",
  amount: ctx.q.amount,
})

export default defineCard<Props>({ type: 'plan_header', section: 'Verdict & framing', label: '', condition, select, Component: PlanHeader, span: 'full', samples: [{ query: '$1,200 flight to Lisbon in March' }, { query: '$2,800 to move apartments' }] })
