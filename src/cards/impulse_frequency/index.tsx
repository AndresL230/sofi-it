import type { EngineContext } from '@/engine/types'
import { CardShell, Money, Num, T, cn } from '../kit'
import { Tracker } from '@/vendor/tremor/Tracker'

interface Props { weeks: number; dots: { week: number; amount: number }[]; todayWeek: number; label: string; amounts: number[] }

/** #20 — quarter dot-strip: 13 week ticks; past buys as filled navy dots sized by amount; this one hollow and pulsing at today. */
function ImpulseFrequency({ weeks, dots, todayWeek, label, amounts }: Props) {
  const maxAmt = Math.max(1, ...dots.map((x) => x.amount))
  return (
    <CardShell className="flex flex-col gap-2.5">
      <div className="flex items-baseline gap-1.5 text-navy">
        <Num value={dots.length + 1} className="text-metric font-extrabold" />
        <span className={`${T.lede} text-slate`}>{label} this quarter</span>
      </div>

      {/* 13 weeks has a natural maximum width — past it the ticks read as scattered, not a strip */}
      <div className="flex max-w-[520px] flex-1 flex-col justify-center" aria-hidden>
        <Tracker
          count={weeks}
          renderTick={(i) => {
            const hit = dots.filter((x) => x.week === i)
            const isToday = i === todayWeek
            return (
              <div className="flex flex-col items-center gap-1">
                {hit.map((h, k) => <div key={k} className="rounded-full bg-navy" style={{ width: 10 + (h.amount / maxAmt) * 8, height: 10 + (h.amount / maxAmt) * 8 }} />)}
                {isToday ? <div className="h-4 w-4 rounded-full border-2 border-navy bg-white" style={{ animation: 'pulseOnce 1s .5s 3' }} /> : null}
                <div className={cn('h-3 w-0.5', isToday ? 'bg-navy' : 'bg-lavender')} />
              </div>
            )
          }}
        />
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-micro text-slate-muted">{weeks} weeks ago</span>
          <span className="text-micro font-semibold text-navy">today</span>
        </div>
      </div>

      <div className="text-caption text-slate">
        Earlier: {amounts.map((a, i) => (
          <span key={i}>
            <b className="font-semibold text-navy"><Money value={a} size="inline" cents="never" animated={false} /></b>{i < amounts.length - 1 ? ' · ' : ''}
          </span>
        ))} — today&rsquo;s is the hollow one.
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({
  weeks: ctx.impulse.weeks, dots: ctx.impulse.past.map((p) => ({ week: p.weekIndex, amount: p.txn.amount })), todayWeek: ctx.impulse.todayWeekIndex,
  label: ctx.q.category === 'shopping_apparel' ? 'apparel buys' : ctx.q.category === 'entertainment' ? 'nights out' : `${ctx.pace.label.toLowerCase()} buys`,
  amounts: ctx.impulse.past.map((p) => Math.round(p.txn.amount)),
})

export { meta, condition } from './meta'
export default ImpulseFrequency
