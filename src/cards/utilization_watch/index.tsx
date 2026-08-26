import type { EngineContext } from '@/engine/types'
import { CardShell, Num, DateText, useDelay } from '../kit'

interface Props { cardName: string; after: number; threshold: number; payBy: Date }

/** #14 — half-arc speedometer banded green→gold→red, tick at the threshold, needle at the post-purchase utilization. */
function UtilizationWatch({ cardName, after, threshold, payBy }: Props) {
  const d = useDelay()
  const cx = 100, cy = 92, R = 74
  const pt = (frac: number, r: number) => { const a = Math.PI * (1 - Math.min(1, Math.max(0, frac))); return [cx + r * Math.cos(a), cy - r * Math.sin(a)] as const }
  const [nx, ny] = pt(after, 55)
  const [tx1, ty1] = pt(threshold, R + 5), [tx2, ty2] = pt(threshold, R + 17)
  const arc = `M${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`
  return (
    <CardShell className="flex items-center gap-4">
      <svg viewBox="0 0 200 100" className="w-[150px] shrink-0" aria-hidden>
        <path d={arc} fill="none" stroke="var(--green)" strokeWidth="9" pathLength={100} strokeDasharray={`${threshold * 100} 100`} opacity=".8" />
        <path d={arc} fill="none" stroke="var(--gold-deep)" strokeWidth="9" pathLength={100} strokeDasharray="30 100" strokeDashoffset={-threshold * 100} opacity=".8" />
        <path d={arc} fill="none" stroke="var(--red)" strokeWidth="9" pathLength={100} strokeDasharray={`${100 - threshold * 100 - 30} 100`} strokeDashoffset={-(threshold * 100 + 30)} opacity=".8" />
        <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="var(--navy)" strokeWidth="1.5" />
        <text x={tx2 - 12} y={ty2 - 6} fontSize="9" fill="var(--slate)" fontWeight="600">{Math.round(threshold * 100)}%</text>
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--navy)" strokeWidth="2.5" strokeLinecap="round" style={{ transformOrigin: `${cx}px ${cy}px`, animation: `popIn .4s ${d(300)} both` }} />
        <circle cx={cx} cy={cy} r="4.5" fill="var(--navy)" />
      </svg>
      <div>
        <div className="text-[13px] text-slate">{cardName} lands at <b className="text-salmon-ink"><Num value={Math.round(after * 100)} suffix="%" /></b> with this.</div>
        <div className="mt-1 text-[13.5px] font-bold text-navy">Pay it before <DateText date={payBy} fmt="ordinal" /> and your score never sees it.</div>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ cardName: ctx.utilization!.card.name.replace('Chase ', ''), after: ctx.utilization!.after, threshold: ctx.utilization!.threshold, payBy: ctx.utilization!.payBy })

export { meta, condition } from './meta'
export default UtilizationWatch
