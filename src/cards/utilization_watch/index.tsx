import type { EngineContext } from '@/engine/types'
import { CardShell, Num, DateText, T, cn, useDelay } from '../kit'

interface Props { cardName: string; after: number; threshold: number; payBy: Date; event: { label: string; monthsAway: number } | null }

/** The verdict is carried by the word first and the hue second — never by hue alone. */
const VERDICT = {
  fine: { word: 'Fine.', color: 'var(--teal)', ink: 'var(--teal-ink)' },
  tight: { word: 'Tight.', color: 'var(--salmon)', ink: 'var(--salmon-ink)' },
  over: { word: 'Over.', color: 'var(--red)', ink: 'var(--red-ink)' },
} as const

/**
 * #14 — half-dial: neutral track, one coloured fill to the post-purchase utilization, a notch at the safe line.
 * The line is 30% normally and 20% while a credit application sits inside six months (engine-supplied).
 */
function UtilizationWatch({ cardName, after, threshold, payBy, event }: Props) {
  const d = useDelay()
  const v = after <= threshold ? VERDICT.fine : after < 0.5 ? VERDICT.tight : VERDICT.over
  const pct = Math.round(after * 100)
  const line = Math.round(threshold * 100)
  const fill = Math.max(2, Math.min(100, after * 100))

  const cx = 100, cy = 104, R = 74
  const pt = (frac: number, r: number) => { const a = Math.PI * (1 - Math.min(1, Math.max(0, frac))); return [cx + r * Math.cos(a), cy - r * Math.sin(a)] as const }
  const arc = `M${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`
  const [mx1, my1] = pt(threshold, R - 10), [mx2, my2] = pt(threshold, R + 10)
  const [lx, ly] = pt(threshold, R + 21)

  return (
    <CardShell className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <div className="w-[120px] shrink-0">
          <div className="relative">
          <svg viewBox="0 0 200 116" className="w-full" role="img" aria-label={`${pct} percent utilization; ${line} percent is the safe line`}>
            <path d={arc} fill="none" stroke="var(--lavender)" strokeWidth="13" strokeLinecap="round" />
            <path
              d={arc} fill="none" stroke={v.color} strokeWidth="13" strokeLinecap="round"
              pathLength={100} strokeDasharray={`${fill} 100`} strokeDashoffset={fill}
              style={{ animation: `draw .7s ${d(250)} ease-out forwards` }}
            />
            {/* A notch cut through the ring marks the safe line — it survives greyscale. */}
            <line x1={mx1} y1={my1} x2={mx2} y2={my2} stroke="var(--navy)" strokeWidth="2" strokeLinecap="round" />
            <text x={lx} y={ly} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--slate)">{line}%</text>
          </svg>
          {/* The readout sits in the widest part of the arc mouth; its caption stays outside it. */}
          <div className="absolute inset-x-0 bottom-0 text-center text-metric font-extrabold tabular-nums leading-none text-navy"><Num value={pct} suffix="%" /></div>
          </div>
          <div className={cn(T.micro, 'mt-1.5 text-center')}>utilization after this</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Alert color={v.ink} />
            <span className="text-title font-extrabold leading-none" style={{ color: v.ink }}>{v.word}</span>
          </div>
          <p className={cn(T.caption, 'mt-2 leading-snug')}>{cardName} crosses its {line}% line with this.</p>
          {/* A credit application in sight is why the line moved — the card says so rather than moving it silently. */}
          {event ? (
            <p className={cn(T.caption, 'mt-1.5 font-semibold leading-snug text-navy')}>
              Your {event.label.toLowerCase()} is <Num value={event.monthsAway} animated={false} /> {event.monthsAway === 1 ? 'month' : 'months'} out — the line is tighter until then.
            </p>
          ) : null}
        </div>
      </div>
      {/* The escape hatch is the payoff line: it sits under the gauge at natural height and
          sinks to the card floor when a tall bento row stretches the card. */}
      <div className="mt-3 flex flex-1 flex-col justify-end">
        <p className={cn(T.body, 'border-t border-lavender pt-2.5 font-semibold text-navy')}>
          Pay it before <DateText date={payBy} fmt="ordinal" /> and your score never sees it.
        </p>
      </div>
    </CardShell>
  )
}

function Alert({ color }: { color: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" aria-hidden className="shrink-0">
      <circle cx="8" cy="8" r="6.6" />
      <path d="M8 4.6v4.2M8 11.3v.3" />
    </svg>
  )
}

export const select = (ctx: EngineContext): Props => ({ cardName: ctx.utilization!.card.name.replace('Chase ', ''), after: ctx.utilization!.after, threshold: ctx.utilization!.threshold, payBy: ctx.utilization!.payBy, event: ctx.utilization!.event })

export { meta, condition } from './meta'
export default UtilizationWatch
