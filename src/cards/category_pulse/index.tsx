import type { EngineContext } from '@/engine/types'
import { CardShell, Money, Num } from '../kit'
import { CategoryBar } from '@/vendor/tremor/CategoryBar'

interface Props { label: string; spent: number; usual: number; amount: number; projected: number; daysLeft: number; overshoot: number }

/** #6 — segmented capsule: teal = spent, hatched = this purchase, navy tick = usual, lavender = remaining. */
function CategoryPulse({ label, spent, usual, amount, projected, daysLeft, overshoot }: Props) {
  const scale = Math.max(usual * 1.18, spent + amount)
  return (
    <CardShell className="flex flex-col justify-center">
      <div className="mb-[9px] flex justify-between text-[13.5px]"><b>{label} this month</b><span className="text-slate"><Money value={spent} size="inline" cents="never" /> of <Money value={usual} size="inline" cents="never" /> usual</span></div>
      <CategoryBar
        segments={[{ value: spent / scale, fill: 'var(--teal)' }, { value: amount / scale, fill: 'hatch' }]}
        marker={{ at: usual / scale }}
      />
      <div className="mt-2 text-[12.5px] text-slate">{daysLeft === 0 ? 'last day of the month' : <><Num value={daysLeft} /> days left</>} · pace says you finish <Money value={projected} size="inline" cents="never" approx />, {overshoot > 0 ? <>about <Money value={Math.round(overshoot)} size="inline" cents="never" /> over usual.</> : <>about <Money value={Math.round(-overshoot)} size="inline" cents="never" /> under usual.</>}</div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ label: ctx.pace.label, spent: ctx.pace.spent, usual: ctx.pace.usual, amount: ctx.q.amount, projected: ctx.pace.projectedWith, daysLeft: ctx.pace.daysLeft, overshoot: ctx.pace.overshoot })

export { meta, condition } from './meta'
export default CategoryPulse
