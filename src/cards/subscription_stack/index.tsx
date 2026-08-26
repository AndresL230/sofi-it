import type { EngineContext } from '@/engine/types'
import { CardShell, Money, useDelay } from '../kit'

interface Props { candidate: { name: string; price: number }; rows: { name: string; price: number }[]; total: number; newTotal: number }

/** #26 — stacked tower of thin tabular rows; the candidate slides in on top highlighted gold; total ticks up. Middle rows compress past 6. */
function SubscriptionStack({ candidate, rows, total, newTotal }: Props) {
  const d = useDelay()
  const compress = rows.length > 6
  return (
    <CardShell className="flex flex-col justify-center">
      <div className="mb-[10px] text-[14px] font-bold">The tower, with this one on top</div>
      <div className="overflow-hidden rounded-sm2 border border-lavender-soft tabular-nums">
        <div className="flex justify-between px-[14px] py-2 text-[13px] font-bold" style={{ background: 'rgba(254,216,128,.35)', animation: `riseIn .4s ${d(300)} both` }}><span>{candidate.name}</span><Money value={candidate.price} size="inline" cents="decimal" animated={false} /></div>
        {rows.map((r, i) => {
          const mid = compress && i > 0 && i < rows.length - 1
          return <div key={r.name} className="flex justify-between border-t border-lavender-soft text-slate" style={{ padding: mid ? '4px 14px' : '7px 14px', fontSize: mid ? 11 : 12.5 }}><span>{r.name}</span><Money value={r.price} size="inline" cents="decimal" animated={false} /></div>
        })}
      </div>
      <div className="mt-[10px] flex justify-between text-[14px]"><span className="text-slate">monthly total</span><span className="font-extrabold"><Money value={total} size="inline" cents="decimal" animated={false} /> → <b className="text-salmon-ink"><Money value={newTotal} size="inline" cents="decimal" /></b></span></div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ candidate: { name: ctx.q.serviceName ?? 'This one', price: ctx.q.amount }, rows: ctx.subs.rows.map((s) => ({ name: s.name, price: s.price })), total: ctx.subs.total, newTotal: ctx.subs.newTotal })

export { meta, condition } from './meta'
export default SubscriptionStack
