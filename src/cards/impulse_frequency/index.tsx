import type { EngineContext } from '@/engine/types'
import { CardShell, Money, Num } from '../kit'
import { Tracker } from '@/vendor/tremor/Tracker'

interface Props { weeks: number; dots: { week: number; amount: number }[]; todayWeek: number; label: string; amounts: number[] }

/** #20 — quarter dot-strip: 13 week ticks; past buys as filled navy dots sized by amount; this one hollow and pulsing at today. */
function ImpulseFrequency({ weeks, dots, todayWeek, label, amounts }: Props) {
  const maxAmt = Math.max(1, ...dots.map((x) => x.amount))
  return (
    <CardShell>
      <Tracker
        count={weeks}
        renderTick={(i) => {
          const hit = dots.filter((x) => x.week === i)
          const isToday = i === todayWeek
          return (
            <div className="flex flex-col items-center gap-1">
              {hit.map((h, k) => <div key={k} className="rounded-full bg-navy" style={{ width: 9 + (h.amount / maxAmt) * 7, height: 9 + (h.amount / maxAmt) * 7 }} />)}
              {isToday ? <div className="h-4 w-4 rounded-full border-[2.5px] border-navy bg-white" style={{ animation: 'pulseOnce 1s .5s 3' }} /> : null}
              <div className="w-[2px]" style={{ height: 12, background: isToday ? 'var(--navy)' : 'var(--lavender)' }} />
            </div>
          )
        }}
      />
      <div className="mt-[10px] text-[12.5px] text-slate">
        <Num value={dots.length + 1} /> {label} this quarter — {amounts.map((a, i) => <span key={i}><Money value={a} size="inline" cents="never" animated={false} />{i < amounts.length - 1 ? ', ' : ''}</span>)}{amounts.length ? ', and' : ''} today's hollow one.
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
