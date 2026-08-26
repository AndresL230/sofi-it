import type { EngineContext } from '@/engine/types'
import { CardShell, Money, useDelay } from '../kit'
import { ordinal } from '@/engine/format'

interface Props { label: string; usual: number; spent: number; elapsed: number; dim: number; projected: number; overshoot: number; crossDay: number | null }

/** #7 — trajectory mini-chart: solid line for elapsed days, dotted arc to month-end, dashed usual, salmon flag where it crosses. */
function PaceProjection({ usual, spent, elapsed, dim, projected, overshoot, crossDay }: Props) {
  const d = useDelay()
  const W = 340, H = 92
  const max = Math.max(projected, usual) * 1.08
  const y = (v: number) => H - 6 - (v / max) * (H - 18)
  const xToday = (elapsed / dim) * W
  const yUsual = y(usual)
  const ySpent = y(spent)
  const yEnd = y(projected)
  const xCross = crossDay ? (crossDay / dim) * W : W
  const solid = `M0 ${y(0)} C ${xToday * 0.4} ${y(0) - (y(0) - ySpent) * 0.2} ${xToday * 0.7} ${ySpent + (y(0) - ySpent) * 0.2} ${xToday} ${ySpent}`
  const dotted = `M${xToday} ${ySpent} Q ${xToday + (W - xToday) * 0.55} ${ySpent - (ySpent - yEnd) * 0.7} ${W} ${yEnd}`
  return (
    <CardShell>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" aria-hidden>
          <line x1="0" y1={yUsual} x2={W} y2={yUsual} stroke="var(--lavender)" strokeWidth="1.5" strokeDasharray="5 5" />
          <path d={solid} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" style={{ animation: `draw .5s ${d(200)} both` }} />
          <path d={dotted} fill="none" stroke="var(--teal)" strokeWidth="2" strokeDasharray="3 5" opacity=".7" />
          <circle cx={xToday} cy={ySpent} r="4" fill="var(--teal)" />
          <circle cx={xCross} cy={yUsual} r="3.5" fill="var(--salmon)" style={{ animation: `popIn .3s ${d(700)} both` }} />
        </svg>
        <div className="absolute text-[9px] text-slate-muted" style={{ left: 2, top: yUsual - 12 }}>usual <Money value={usual} size="inline" cents="never" animated={false} /></div>
        <div className="absolute rounded-pill bg-salmon-tint px-2 py-[2px] text-[10px] font-bold text-salmon-ink" style={{ left: `${Math.min(84, (xCross / W) * 100)}%`, top: 2, animation: `popIn .3s ${d(750)} both` }}><Money value={Math.max(1, Math.round(overshoot))} size="inline" cents="never" signed /></div>
        <div className="absolute text-[9.5px] text-slate-muted" style={{ left: `${(xToday / W) * 100}%`, top: ySpent + 6 }}>today</div>
      </div>
      <div className="mt-2 text-[12.5px] text-slate">{crossDay ? <>On pace to cross usual around the {ordinal(crossDay)}.</> : 'On pace to land under usual.'}</div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ label: ctx.pace.label, usual: ctx.pace.usual, spent: ctx.pace.spent, elapsed: ctx.pace.elapsedDays, dim: ctx.pace.daysInMonth, projected: ctx.pace.projectedWith, overshoot: ctx.pace.overshoot, crossDay: ctx.pace.crossesUsualOnDay })

export { meta, condition } from './meta'
export default PaceProjection
