import type { EngineContext } from '@/engine/types'
import { CardShell, Money, DateText } from '../kit'
import { daysBetween } from '@/engine/format'

interface Props { today: Date; paydays: Date[]; inFull: Date; accelerated: Date; redirectMonthly: number; paycheck: number }

/** #10 — horizontal line with biweekly $-dot paydays, today navy, teal "affordable in full" flag, purple accelerated flag. */
function CashflowTimeline({ today, paydays, inFull, accelerated, redirectMonthly, paycheck }: Props) {
  const horizon = Math.max(14, daysBetween(today, inFull))
  const x = (d: Date) => `${Math.min(100, Math.max(0, (daysBetween(today, d) / horizon) * 100))}%`
  const accX = (daysBetween(today, accelerated) / horizon) * 100
  return (
    <CardShell className="px-6 pb-[30px] pt-[22px] flex flex-col justify-center">
      <div className="relative mx-2 mb-14 mt-9 h-2 rounded-pill bg-lavender-soft">
        <div className="absolute inset-y-0 left-0 rounded-pill bg-teal" style={{ width: `${Math.min(accX, 100)}%` }} />
        <div className="absolute -top-1 left-0 h-4 w-4 rounded-full border-[3px] border-white bg-teal shadow-pop" />
        <div className="absolute -top-8 left-0 whitespace-nowrap text-[11.5px] font-bold text-navy">Today</div>
        {paydays.map((p) => (
          <div key={p.toISOString()} className="absolute -top-[3px] flex h-[14px] w-[14px] -translate-x-1/2 items-center justify-center rounded-full bg-white text-[8px] font-bold text-teal ring-1 ring-teal" style={{ left: x(p) }}>$</div>
        ))}
        {paydays.length ? <div className="absolute left-0 top-9 whitespace-nowrap text-[10.5px] text-slate-muted">paydays · biweekly <Money value={paycheck} size="inline" cents="never" animated={false} /></div> : null}
        <div className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-white bg-purple shadow-pop" style={{ left: `${accX}%` }} />
        <div className="absolute -top-8 whitespace-nowrap text-[11.5px] font-bold text-purple" style={accX >= 50 ? { right: 0, textAlign: 'right' } : { left: `${accX}%`, transform: `translateX(-${Math.min(40, accX)}%)` }}><DateText date={accelerated} /> — with <Money value={redirectMonthly} size="inline" cents="never" animated={false} />/mo redirect</div>
        <div className="absolute -top-1 right-0 h-4 w-4 rounded-full border-[3px] border-white bg-navy shadow-pop" />
        <div className="absolute right-0 top-5 whitespace-nowrap text-[11.5px] font-bold text-navy">Affordable in full: ~<DateText date={inFull} /></div>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ today: ctx.now, paydays: ctx.affordability.paydays.slice(0, 8), inFull: ctx.affordability.affordableInFull, accelerated: ctx.affordability.accelerated, redirectMonthly: ctx.affordability.redirectMonthly, paycheck: ctx.runway.paycheck })

export { meta, condition } from './meta'
export default CashflowTimeline
