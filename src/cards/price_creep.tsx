import type { EngineContext } from '@/engine/types'
import { defineCard, CardShell, Money, useDelay } from './kit'
import { lazy, Suspense } from 'react'
const SparkAreaChart = lazy(() => import('@/vendor/tremor/SparkAreaChart').then((m) => ({ default: m.SparkAreaChart })))

interface Props { monthly: number[]; monthLabels: string[]; raises: { name: string; delta: number; monthIndex: number }[]; candidate: { name: string; price: number }; raiseTotal: number; driftPerYear: number }

/** #28 — the creeping sparkline: 12-month stepped area, salmon dots with floating micro-tags at each raise, hollow dot beyond the end for the candidate. */
function PriceCreep({ monthly, monthLabels, raises, candidate, raiseTotal, driftPerYear }: Props) {
  const d = useDelay()
  const start = monthly[0], end = monthly[monthly.length - 1]
  const withCandidate = end + candidate.price
  const H = 84
  const min = Math.min(...monthly) * 0.97, max = withCandidate * 1.02
  const y = (v: number) => ((max - v) / (max - min)) * 100
  const x = (i: number) => (i / (monthly.length - 1)) * 92
  return (
    <CardShell>
      <div className="text-[15px] font-semibold">Same subscriptions. <b className="text-salmon-ink"><Money value={raiseTotal} size="inline" cents={Number.isInteger(raiseTotal) ? 'never' : 'decimal'} signed animated={false} />/mo</b> in raises.</div>
      <div className="relative mt-[26px]" style={{ height: H + 18 }}>
        <div className="absolute inset-x-0 top-0" style={{ height: H, width: '92%' }}>
          <Suspense fallback={null}><SparkAreaChart data={monthly.map((v, i) => ({ i, v }))} index="i" category="v" color="var(--salmon)" min={min} max={max} height={H} delay={d(200)} /></Suspense>
        </div>
        <svg className="absolute inset-x-0 top-0" style={{ height: H, width: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {raises.map((r, k) => <circle key={r.name} cx={x(r.monthIndex)} cy={y(monthly[r.monthIndex])} r="1.2" fill="var(--salmon)" style={{ animation: `popIn .2s ${d(350 + k * 250)} both` }} />)}
          <circle cx="97" cy={y(withCandidate)} r="1.6" fill="#fff" stroke="var(--salmon)" strokeWidth=".7" style={{ animation: `popIn .3s ${d(900)} both` }} />
        </svg>
        {raises.map((r, k) => (
          <div key={r.name} className="absolute whitespace-nowrap rounded-pill border border-lavender bg-white px-2 py-[2px] text-[10px] text-navy" style={{ left: `${x(r.monthIndex)}%`, top: `${(y(monthly[r.monthIndex]) / 100) * H - 24 - (k % 2) * 14}px`, transform: 'translateX(-30%)', animation: `popIn .3s ${d(400 + k * 250)} both` }}>
            <span className="absolute left-1/2 top-full h-[6px] w-px bg-lavender-deep" />{r.name} <Money value={r.delta} size="inline" cents={Number.isInteger(r.delta) ? 'never' : 'decimal'} signed animated={false} />
          </div>
        ))}
        <div className="absolute bottom-0 left-0 text-[14px] font-bold text-navy"><Money value={start} size="inline" cents="never" animated={false} /></div>
        <div className="absolute text-[16px] font-semibold text-navy" style={{ left: '84%', top: `${(y(end) / 100) * H + 4}px` }}><Money value={end} size="inline" cents="never" animated={false} /></div>
        <div className="absolute right-0 text-right text-[10px] font-semibold text-salmon-ink" style={{ top: `${(y(withCandidate) / 100) * H - 28}px` }}><Money value={withCandidate} size="inline" cents="never" animated={false} /><br />with {candidate.name}</div>
        <div className="absolute inset-x-0 bottom-0 flex justify-between pr-[8%] text-[9px] text-slate-muted">{monthLabels.map((m, i) => <span key={i} style={{ visibility: i % 2 ? 'hidden' : 'visible' }}>{m}</span>)}</div>
      </div>
      <div className="mt-[14px] text-[13px] text-slate">That's <Money value={driftPerYear} size="inline" cents="never" animated={false} />/yr of drift — before adding this one.</div>
    </CardShell>
  )
}

export const condition = (ctx: EngineContext) => ctx.q.frequency === 'recurring' && ctx.subs.raises.length > 0
export const select = (ctx: EngineContext): Props => {
  const labels = Array.from({ length: 12 }, (_, i) => new Date(ctx.now.getFullYear(), ctx.now.getMonth() - 11 + i, 1).toLocaleDateString('en-US', { month: 'short' }).charAt(0))
  const raiseTotal = Math.round((ctx.subs.total - ctx.subs.totalYearAgo) * 100) / 100
  return { monthly: ctx.subs.monthly, monthLabels: labels, raises: ctx.subs.raises, candidate: { name: ctx.q.serviceName ?? 'this one', price: ctx.q.amount }, raiseTotal, driftPerYear: Math.round(raiseTotal * 12) }
}

export default defineCard<Props>({ type: 'price_creep', column: 'left', section: 'Recurring', label: '', condition, select, Component: PriceCreep, samples: [{ query: '$15/mo Crunchyroll' }] })
