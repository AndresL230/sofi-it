import type { EngineContext } from '@/engine/types'
import { CardShell, Money, Num, T, useDelay } from '../kit'

interface Props { flight: number; stay: number; food: number; local: number; allIn: number; ratio: number }

/** Berg geometry (px). Every submerged band is exactly as tall as the row beside it, so the art and the figures share one grid. */
const W = 92
const TOP_H = 56
const CAPS = 'text-caption font-semibold uppercase tracking-[.1em]'
/** Berg + figures have a natural measure; past it the labels and their amounts stop reading as pairs. */
const MEASURE = 'max-w-[460px]'
/** The submerged silhouette: broad shoulders under the line, a notch, then a keel that drifts off-centre. */
const KEEL = (h: number) => {
  const y = (f: number) => Math.round(h * f)
  return `M6 0 H84 L90 ${y(0.3)} L70 ${y(0.62)} L74 ${y(0.86)} L46 ${h} L26 ${y(0.86)} L10 ${y(0.5)} Z`
}

/**
 * #33 — the iceberg, annotated: the ticket you book sits above the waterline, and the mass below
 * is built out of the three costs nobody books. Labels live beside the berg, never on top of it.
 * NB: className strings are literal — `cn` is twMerge, which eats named font-size classes.
 */
function TotalCostOfEvent({ flight, stay, food, local, allIn, ratio }: Props) {
  const d = useDelay()
  const below = [
    { label: 'Stay', value: stay },
    { label: 'Food & out', value: food },
    { label: 'Local + extras', value: local },
  ]
  const sum = Math.max(1, below.reduce((a, r) => a + r.value, 0))
  const bands = below.map((r) => ({ ...r, h: Math.round(38 + 30 * (r.value / sum)) }))
  const keelH = bands.reduce((a, b) => a + b.h, 0)
  const tops = bands.map((_, i) => bands.slice(0, i).reduce((a, b) => a + b.h, 0))
  const at = (f: number) => Math.round(keelH * f)
  /** Deeper = darker: the further under the line, the less you saw it coming. */
  const DEPTH = ['var(--lavender)', 'var(--lavender-deep)', 'rgba(32,23,71,.38)']

  return (
    <CardShell className="flex flex-col">
      {/* the diagram has a natural measure; wide spans get spacing, not a stretched berg */}
      <div className={`flex grow flex-col ${MEASURE}`}>
      <div className={`${T.title} text-navy`}>The flight is the tip.</div>
      <div className="mt-1 text-caption text-slate">The ticket is what you book. The trip is what you pay.</div>

      {/* above the waterline — the part you book */}
      <div className="mt-3 flex items-end gap-3">
        <svg width={W} height={TOP_H} viewBox={`0 0 ${W} ${TOP_H}`} className="shrink-0" aria-hidden style={{ animation: `fadeIn .4s ${d(200)} both` }}>
          <polygon points="46,6 41,26 40,56 20,56" fill="var(--lavender-soft)" />
          <polygon points="46,6 72,56 40,56 41,26" fill="#ffffff" />
          <polygon points="46,6 72,56 20,56" fill="none" stroke="var(--lavender-deep)" strokeWidth="1" strokeLinejoin="round" />
        </svg>
        <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2 pb-1.5">
          <div className="min-w-0">
            <div className={`${T.lede} text-navy`}>Flight</div>
            <div className="text-micro text-slate-muted">the part you book</div>
          </div>
          <Money value={flight} size="md" cents="never" className="shrink-0 text-navy" delayMs={parseInt(d(300))} />
        </div>
      </div>

      {/* the waterline, ending in the label for everything under it */}
      <div className="-mt-1 flex items-center gap-2" style={{ animation: `fadeIn .4s ${d(320)} both` }}>
        <svg viewBox="0 0 300 16" preserveAspectRatio="none" className="block h-4 min-w-0 flex-1" aria-hidden style={{ animation: `waterShimmer 1.1s ${d(420)} 1` }}>
          <path d="M0 6 Q 12 2 24 6 T 48 6 T 72 6 T 96 6 T 120 6 T 144 6 T 168 6 T 192 6 T 216 6 T 240 6 T 264 6 T 288 6 T 312 6" fill="none" stroke="var(--teal)" strokeWidth="1.4" opacity=".75" />
          <path d="M0 12 Q 12 8 24 12 T 48 12 T 72 12 T 96 12 T 120 12 T 144 12 T 168 12 T 192 12 T 216 12 T 240 12 T 264 12 T 288 12 T 312 12" fill="none" stroke="var(--teal)" strokeWidth="1" opacity=".3" />
        </svg>
        <div className="shrink-0 text-micro font-semibold uppercase tracking-[.12em] text-slate-muted">what you don’t book</div>
      </div>

      {/* below the waterline — one band per cost, each the height of its row */}
      <div className="flex grow gap-3" style={{ maxHeight: Math.round(keelH * 1.5) }}>
        <svg width={W} viewBox={`0 0 ${W} ${keelH}`} preserveAspectRatio="none" className="h-full shrink-0" aria-hidden>
          <defs>
            <clipPath id="tcoe-keel">
              <path d={KEEL(keelH)} />
            </clipPath>
          </defs>
          <g clipPath="url(#tcoe-keel)">
            {bands.map((b, i) => (
              <rect key={b.label} x="0" width={W} y={tops[i]} height={b.h} fill={DEPTH[i]} style={{ animation: `fadeIn .45s ${d(460 + i * 120)} both` }} />
            ))}
            <polygon points={`6,0 42,0 30,${at(0.86)} 10,${at(0.5)}`} fill="rgba(32,23,71,.07)" />
            <polygon points={`84,0 90,${at(0.3)} 70,${at(0.62)} 62,${at(0.24)}`} fill="rgba(255,255,255,.28)" />
            {tops.slice(1).map((y) => <rect key={y} x="0" y={y} width={W} height="1" fill="var(--card)" />)}
          </g>
          <path d={KEEL(keelH)} fill="none" stroke="var(--lavender-deep)" strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="flex min-w-0 flex-1 flex-col">
          {bands.map((b, i) => (
            <div key={b.label} className={`flex items-center justify-between gap-2 ${i > 0 ? 'border-t border-lavender' : ''}`} style={{ flexBasis: b.h, flexGrow: b.h, minHeight: b.h, animation: `riseIn .34s ${d(500 + i * 120)} both` }}>
              <div className={`${T.body} truncate text-slate`}>{b.label}</div>
              <Money value={b.value} size="sm" cents="never" className="shrink-0 text-navy" delayMs={parseInt(d(500 + i * 120))} />
            </div>
          ))}
        </div>
      </div>

      {/* the payoff — the whole card exists to land this number, and it anchors the bottom */}
      <div className="mt-auto pt-4">
        <div className="flex items-baseline justify-between gap-3 rounded-ctl bg-navy px-4 py-3" style={{ animation: `fadeIn .4s ${d(860)} both` }}>
          <div className={`${CAPS} text-white/80`}>Realistic all-in</div>
          <Money value={allIn} size="lg" cents="never" approx className="shrink-0 text-white" delayMs={parseInt(d(900))} />
        </div>
        <div className="mt-1.5 text-micro text-slate-muted">your last trip ran <Num value={ratio} fraction={1} animated={false} />× its flight.</div>
      </div>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ flight: ctx.eventCost!.flight, stay: ctx.eventCost!.stay, food: ctx.eventCost!.food, local: ctx.eventCost!.local, allIn: ctx.eventCost!.allIn, ratio: ctx.eventCost!.ratio })

export { meta, condition } from './meta'
export default TotalCostOfEvent
