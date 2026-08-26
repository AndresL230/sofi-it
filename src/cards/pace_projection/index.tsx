import { useLayoutEffect, useRef, useState } from 'react'
import type { EngineContext } from '@/engine/types'
import { CardShell, Caps, Money, T, cn, useDelay } from '../kit'
import { ordinal } from '@/engine/format'

interface Props { label: string; usual: number; spent: number; elapsed: number; dim: number; projected: number; overshoot: number; crossDay: number | null }

/**
 * #7 — month-to-date spend curve. Solid teal to today, hatched projection to month end,
 * dashed "usual" reference. Every mark is labelled where it sits, so the chart needs no legend:
 * the two money labels give the y-axis its scale, the two date ticks give the x-axis its span.
 *
 * Geometry note: the plot is measured, not scaled. The viewBox tracks the box's real pixel size
 * (so strokes, dots and label offsets stay the same weight from 300px to 720px) and the height is
 * capped — a uniformly-scaling SVG would be 260px tall on a full-width card and invert the
 * hierarchy. Overlay labels stay in PERCENT of that same viewBox, so they track the marks.
 */
function PaceProjection({ label, usual, spent, elapsed, dim, projected, overshoot, crossDay }: Props) {
  const d = useDelay()
  const plot = useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = useState(0)
  // layout effect: measure before paint so a wide card never flashes at the narrow height
  useLayoutEffect(() => {
    const el = plot.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setMeasured(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const W = Math.max(220, measured || 300)
  // grows with width but reaches its ceiling at ~640px of plot: the art has a natural maximum
  const H = Math.round(Math.min(196, Math.max(148, 96 + W * 0.16)))
  const PAD_T = 46, PAD_B = 22, PAD_X = 4
  const yBase = H - PAD_B
  const max = Math.max(projected, usual) * 1.1
  const y = (v: number) => yBase - (v / max) * (yBase - PAD_T)
  const x = (day: number) => PAD_X + (day / dim) * (W - PAD_X * 2)
  const x0 = x(0), xToday = x(elapsed), xEnd = x(dim)
  const yUsual = y(usual), ySpent = y(spent), yEnd = y(projected)
  const xCross = crossDay ? x(crossDay) : xEnd
  const solid = `M${x0} ${yBase} C ${x0 + (xToday - x0) * 0.45} ${yBase - (yBase - ySpent) * 0.16} ${xToday - (xToday - x0) * 0.28} ${ySpent + (yBase - ySpent) * 0.24} ${xToday} ${ySpent}`
  const proj = `M${xToday} ${ySpent} Q ${xToday + (xEnd - xToday) * 0.55} ${ySpent - (ySpent - yEnd) * 0.78} ${xEnd} ${yEnd}`
  const px = (v: number) => `${(v / W) * 100}%`
  const py = (v: number) => `${(v / H) * 100}%`
  return (
    <CardShell className="flex flex-col justify-center">
      {/* past ~720px of content the plot has hit its ceiling, so the headline moves beside it
          rather than the drawing inflating any further */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3.5">
        <div className="min-w-0 flex-1 basis-[240px]">
          <Caps>{label} · month to date</Caps>
          <div className={cn(T.title, 'mt-1 text-navy')}>{crossDay ? <>On pace to cross usual around the {ordinal(crossDay)}.</> : 'On pace to land under usual.'}</div>
        </div>

        <div ref={plot} className="relative min-w-0 flex-[1.6] basis-[440px] max-w-[720px]">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block overflow-visible" aria-hidden>
            <defs>
              <pattern id="pace-proj-hatch" width="7" height="7" patternTransform="rotate(-55)" patternUnits="userSpaceOnUse">
                <rect width="7" height="7" fill="var(--teal)" opacity=".05" />
                <line x1="0" y1="0" x2="0" y2="7" stroke="var(--teal)" strokeWidth="2" opacity=".16" />
              </pattern>
            </defs>
            {/* x-axis hairline */}
            <line x1={x0} y1={yBase} x2={xEnd} y2={yBase} stroke="var(--lavender)" strokeWidth="1" />
            {/* spend so far — area + curve */}
            <path d={`${solid} L ${xToday} ${yBase} L ${x0} ${yBase} Z`} fill="var(--teal)" fillOpacity=".1" style={{ animation: `fadeIn .5s ${d(300)} both` }} />
            <path d={`${proj} L ${xEnd} ${yBase} L ${xToday} ${yBase} Z`} fill="url(#pace-proj-hatch)" style={{ animation: `fadeIn .5s ${d(600)} both` }} />
            {/* the reference the whole card is about */}
            <line x1={x0} y1={yUsual} x2={xEnd} y2={yUsual} stroke="var(--lavender-deep)" strokeWidth="1.5" strokeDasharray="5 4" />
            <path d={solid} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" style={{ animation: `draw .5s ${d(200)} both` }} />
            <path d={proj} fill="none" stroke="var(--teal)" strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round" strokeOpacity=".8" style={{ animation: `fadeIn .4s ${d(600)} both` }} />
            <circle cx={xToday} cy={ySpent} r="4" fill="var(--teal)" stroke="#fff" strokeWidth="2" />
            {/* transform-box/origin keep popIn's scale about the dot itself, not the SVG origin */}
            <circle cx={xCross} cy={yUsual} r="4" fill="var(--salmon)" stroke="#fff" strokeWidth="1.5" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `popIn .3s ${d(750)} both` }} />
            <circle cx={xEnd} cy={yEnd} r="3" fill="var(--navy)" />
          </svg>

          {/* where it lands — reserved space at the top right, clear of the curve */}
          <div className="absolute right-0 top-0 text-right" style={{ animation: `fadeIn .4s ${d(700)} both` }}>
            <div className="text-lede font-extrabold text-navy"><Money value={projected} size="inline" cents="never" approx /></div>
            <div className={cn(T.caption, 'text-salmon-ink')}>
              {overshoot > 0 ? <><Money value={Math.max(1, Math.round(overshoot))} size="inline" cents="never" signed animated={false} /> over usual</> : <>under usual</>}
            </div>
          </div>
          {/* the dashed rule labels itself, above the line so nothing strikes through */}
          <div className={cn(T.micro, 'absolute left-0 whitespace-nowrap')} style={{ top: py(yUsual), transform: 'translateY(calc(-100% - 4px))' }}>
            usual <Money value={usual} size="inline" cents="never" animated={false} />
          </div>
          <div className={cn(T.micro, 'absolute whitespace-nowrap')} style={{ left: px(xToday), top: py(ySpent), transform: `translate(${xToday / W > 0.3 ? 'calc(-100% - 7px)' : '7px'}, 7px)` }}>today</div>
          <div className={cn(T.micro, 'absolute bottom-0 left-0')}>{ordinal(1)}</div>
          <div className={cn(T.micro, 'absolute bottom-0 right-0')}>{ordinal(dim)}</div>
        </div>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ label: ctx.pace.label, usual: ctx.pace.usual, spent: ctx.pace.spent, elapsed: ctx.pace.elapsedDays, dim: ctx.pace.daysInMonth, projected: ctx.pace.projectedWith, overshoot: ctx.pace.overshoot, crossDay: ctx.pace.crossesUsualOnDay })

export { meta, condition } from './meta'
export default PaceProjection
