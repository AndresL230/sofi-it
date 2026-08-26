import type { EngineContext } from '@/engine/types'
import { CardShell, Caps, DateText, Money, T, cn, useDelay } from '../kit'
import { daysBetween } from '@/engine/format'

interface Props { today: Date; paydays: Date[]; inFull: Date; accelerated: Date; redirectMonthly: number; paycheck: number }

/**
 * #10 — one line from today to the date this is affordable. The teal stretch is the
 * redirect plan (purple marker = the date it lands), the open stretch is what waiting costs.
 * Both dates are named in text, so the line never has to be read by colour alone.
 */
function CashflowTimeline({ today, paydays, inFull, accelerated, redirectMonthly, paycheck }: Props) {
  const d = useDelay()
  const horizon = Math.max(14, daysBetween(today, inFull))
  const at = (dt: Date) => Math.min(100, Math.max(0, (daysBetween(today, dt) / horizon) * 100))
  const accX = at(accelerated)
  const accLabelX = Math.min(82, Math.max(26, accX))
  return (
    <CardShell className="flex flex-col justify-center">
      {/* A date line reads well wide, so it keeps the full span up to its 720px ceiling; past that
          the header moves beside it rather than the rail growing further. */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="min-w-0 flex-1 basis-[260px]">
          <Caps>Affordable in full</Caps>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="text-metric font-extrabold tracking-[-0.01em] text-purple"><DateText date={accelerated} /></span>
            <span className={T.meta}>if you redirect <Money value={redirectMonthly} size="inline" cents="never" animated={false} />/mo</span>
          </div>
        </div>

        <div className="mx-2 min-w-0 flex-[1.4] basis-[540px] max-w-[720px]">
          <div className={cn(T.caption, 'mb-2 text-right text-slate')}><span className="font-bold text-navy"><DateText date={inFull} /></span> at today's pace</div>
          <div className="relative h-2 rounded-pill bg-lavender-soft" role="img" aria-label="Timeline from today to the date this is affordable in full">
            <div className="absolute inset-y-0 left-0 rounded-pill bg-teal" style={{ width: `${accX}%`, animation: `sparkReveal .6s ${d(250)} both` }} />
            {paydays.map((p) => (
              <div key={p.toISOString()} className="absolute flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full border border-teal bg-white text-micro font-bold leading-none text-teal" style={{ top: -3, left: `${at(p)}%` }}>$</div>
            ))}
            <div className="absolute -top-1 left-0 h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-white bg-navy" />
            <div className="absolute -top-1 right-0 h-4 w-4 translate-x-1/2 rounded-full border-2 border-navy bg-white" />
            {/* positioning transform stays on the wrapper: popIn is `both`-filled and ends at
                transform:none, which would cancel a -translate-x-1/2 on the same element. */}
            <div className="absolute -top-1 h-4 w-4 -translate-x-1/2" style={{ left: `${accX}%` }}>
              <div className="h-full w-full rounded-full border-[3px] border-white bg-purple" style={{ animation: `popIn .3s ${d(650)} both` }} />
            </div>
          </div>

          <div className="relative mt-2 h-4">
            <div className={cn(T.micro, 'absolute left-0 top-0')}>today</div>
            <div className={cn(T.micro, 'absolute top-0 whitespace-nowrap font-semibold text-purple')} style={{ left: `${accLabelX}%`, transform: 'translateX(-50%)' }}>with redirect</div>
          </div>
          {paydays.length ? <div className={cn(T.micro, 'mt-1')}>$ = payday · <Money value={paycheck} size="inline" cents="never" animated={false} /> biweekly</div> : null}
        </div>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ today: ctx.now, paydays: ctx.affordability.paydays.slice(0, 8), inFull: ctx.affordability.affordableInFull, accelerated: ctx.affordability.accelerated, redirectMonthly: ctx.affordability.redirectMonthly, paycheck: ctx.runway.paycheck })

export { meta, condition } from './meta'
export default CashflowTimeline
