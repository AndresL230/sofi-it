import type { EngineContext } from '@/engine/types'
import { CardShell, Caps, Money, T, cn, useDelay } from '../kit'
import { lazy, Suspense } from 'react'
const SparkAreaChart = lazy(() => import('@/vendor/tremor/SparkAreaChart').then((m) => ({ default: m.SparkAreaChart })))

interface Props { monthly: number[]; raises: { name: string; delta: number; monthIndex: number }[]; candidate: { name: string; price: number }; raiseTotal: number; driftPerYear: number }

const H = 92
const ROW = 21

/**
 * #28 — the creep, drawn: a 12-month stepped area from what these same subscriptions cost a
 * year ago to what they cost now, each raise tagged where it happened. The delta between the
 * two ends is the headline figure; the "+" and the rising steps carry the direction, not hue.
 */
function PriceCreep({ monthly, raises, candidate, raiseTotal, driftPerYear }: Props) {
  const d = useDelay()
  const start = monthly[0], end = monthly[monthly.length - 1]
  const lo = Math.min(...monthly), hi = Math.max(...monthly), span = Math.max(hi - lo, 1)
  const min = lo - span * 0.5, max = hi + span * 0.3
  const y = (v: number) => ((max - v) / (max - min)) * 100
  const x = (i: number) => (i / (monthly.length - 1)) * 100

  // Tags sit in a band above the chart; a second row opens only if two raises crowd each other.
  const rows = raises.map((r, k) => (k > 0 && x(r.monthIndex) - x(raises[k - 1].monthIndex) < 32 ? 1 : 0))
  const band = (Math.max(0, ...rows) + 1) * ROW + 4

  return (
    <CardShell className="flex flex-col justify-center">
      <Caps>Same subscriptions</Caps>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
        <span className="flex items-baseline gap-1.5 text-salmon-ink">
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 self-center" aria-hidden><path d="M6 1 11.5 10.5H.5z" fill="currentColor" /></svg>
          <Money value={raiseTotal} size="lg" signed delayMs={parseInt(d(400))} />
        </span>
        <span className={cn(T.lede, 'text-slate')}>a month more than a year ago</span>
      </div>

      <div className="relative mt-4" style={{ height: band + H }}>
        <div className="absolute inset-x-0" style={{ top: band, height: H }}>
          <Suspense fallback={null}><SparkAreaChart data={monthly.map((v, i) => ({ i, v }))} index="i" category="v" color="var(--salmon)" min={min} max={max} height={H} delay={d(200)} /></Suspense>
        </div>
        {/* Markers sit in un-animated wrappers: a `both`-filled keyframe would reset the centring transform. */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: 0, top: band + (y(start) / 100) * H }}>
          <div className="h-2 w-2 rounded-full border-[1.5px] border-salmon bg-white" style={{ animation: `popIn .25s ${d(300)} both` }} />
        </div>
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: '100%', top: band + (y(end) / 100) * H }}>
          <div className="h-2.5 w-2.5 rounded-full border-2 border-white bg-navy" style={{ animation: `popIn .3s ${d(900)} both` }} />
        </div>
        {raises.map((r, k) => {
          const px = x(r.monthIndex), dotY = band + (y(monthly[r.monthIndex]) / 100) * H
          const tagY = rows[k] * ROW
          const edge = px < 22 ? 'start' : px > 78 ? 'end' : 'mid'
          return (
            <div key={r.name}>
              <div className="absolute w-px bg-lavender-deep" style={{ left: `${px}%`, top: tagY + ROW - 4, height: Math.max(0, dotY - tagY - ROW + 4), animation: `fadeIn .2s ${d(450 + k * 200)} both` }} />
              <div
                className={cn('absolute', edge === 'mid' && '-translate-x-1/2')}
                style={{ top: tagY, left: edge === 'end' ? undefined : edge === 'start' ? 0 : `${px}%`, right: edge === 'end' ? 0 : undefined }}
              >
                <div className="whitespace-nowrap rounded-pill border border-lavender bg-white px-2 py-0.5 text-caption font-semibold text-navy" style={{ animation: `popIn .3s ${d(400 + k * 200)} both` }}>
                  {r.name} <Money value={r.delta} size="inline" cents="decimal" signed animated={false} />
                </div>
              </div>
              <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${px}%`, top: dotY }}>
                <div className="h-2 w-2 rounded-full border-2 border-white bg-salmon" style={{ animation: `popIn .25s ${d(500 + k * 200)} both` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-2.5 flex items-baseline justify-between border-t border-lavender pt-2">
        <div>
          <div className={T.caption}>a year ago</div>
          <div className="mt-0.5 text-lede font-bold"><Money value={start} size="inline" cents="decimal" animated={false} /></div>
        </div>
        <div className="text-right">
          <div className={T.caption}>now</div>
          <div className="mt-0.5 text-lede font-bold"><Money value={end} size="inline" cents="decimal" animated={false} /></div>
        </div>
      </div>

      <div className={cn(T.body, 'mt-3 text-slate')}>
        <Money value={driftPerYear} size="inline" cents="never" className="font-bold text-ink" animated={false} />/yr of drift — before {candidate.name} joins.
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => {
  const raiseTotal = Math.round((ctx.subs.total - ctx.subs.totalYearAgo) * 100) / 100
  return { monthly: ctx.subs.monthly, raises: ctx.subs.raises, candidate: { name: ctx.q.serviceName ?? 'this one', price: ctx.q.amount }, raiseTotal, driftPerYear: Math.round(raiseTotal * 12) }
}

export { meta, condition } from './meta'
export default PriceCreep
