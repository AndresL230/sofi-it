import type { EngineContext } from '@/engine/types'
import { CardShell, Caps, Money, Num, T, cn } from '../kit'
import { CategoryBar } from '@/vendor/tremor/CategoryBar'

interface Props { label: string; spent: number; usual: number; amount: number; projected: number; daysLeft: number; overshoot: number }

/** #6 — segmented capsule: teal = spent so far, hatched = this purchase, navy tick = usual (labelled), lavender = the rest of the month. */
function CategoryPulse({ label, spent, usual, amount, projected, daysLeft, overshoot }: Props) {
  const scale = Math.max(usual * 1.18, spent + amount)
  const markerAt = usual / scale
  const tickPct = markerAt * 100
  return (
    <CardShell className="flex flex-col justify-center">
      {/* Wide spans recompose sideways rather than stretching the capsule into a hairline:
          below ~500px of content the two blocks wrap back into the narrow stack. */}
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
        <div className="min-w-0 flex-1 basis-[190px]">
          <Caps>{label} this month</Caps>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <Money value={spent + amount} size="md" cents="never" />
            <span className={T.meta}>with this <Money value={amount} size="inline" cents="never" animated={false} /></span>
          </div>
        </div>

        <div className="min-w-0 flex-[1.6] basis-[290px] max-w-[480px]">
          <CategoryBar
            height={18}
            segments={[{ value: spent / scale, fill: 'var(--teal)' }, { value: amount / scale, fill: 'hatch' }]}
            marker={{ at: markerAt }}
          />
          {/* the navy tick continues below the bar and says what it is — no legend needed */}
          <div className="relative h-4">
            {/* +1px: the bar's marker is a 2px rule drawn from its left edge, so its centre is 1px right of `left` */}
            <div className="absolute top-0 flex flex-col items-center" style={{ left: `${Math.min(88, Math.max(12, tickPct))}%`, transform: 'translateX(calc(-50% + 1px))' }}>
              <div className="h-1.5 w-px bg-navy opacity-40" />
              <div className={cn(T.micro, 'whitespace-nowrap')}>usual <Money value={usual} size="inline" cents="never" animated={false} /></div>
            </div>
          </div>
        </div>

        <p className={cn(T.body, 'min-w-0 flex-1 basis-[260px] text-slate')}>
          {daysLeft === 0 ? 'Last day of the month.' : <><Num value={daysLeft} /> days left.</>}{' '}
          On pace to finish <Money value={projected} size="inline" cents="never" approx />
          {overshoot > 0 ? <> — about <Money value={Math.round(overshoot)} size="inline" cents="never" /> over usual.</> : <> — about <Money value={Math.round(-overshoot)} size="inline" cents="never" /> under usual.</>}
        </p>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ label: ctx.pace.label, spent: ctx.pace.spent, usual: ctx.pace.usual, amount: ctx.q.amount, projected: ctx.pace.projectedWith, daysLeft: ctx.pace.daysLeft, overshoot: ctx.pace.overshoot })

export { meta, condition } from './meta'
export default CategoryPulse
