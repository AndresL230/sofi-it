import { useEffect, useState } from 'react'
import type { EngineContext } from '@/engine/types'
import { CardShell, Money, useDelay } from '../kit'

interface Props { monthly: number; yearly: number; months: number }

/** #25 — multiplication wall: monthly tile × twelve month-tiles filling in sequence = yearly, counting up in hero numerals. */
function Annualized({ monthly, yearly, months }: Props) {
  const d = useDelay()
  const [shown, setShown] = useState(0)
  const delay = parseInt(d(300)) + months * 40
  useEffect(() => { setShown(yearly) }, [yearly])
  return (
    <CardShell className="flex flex-wrap items-center gap-3">
      <div className="rounded-[8px] bg-lavender-soft px-3 py-2 text-[18px] font-extrabold"><Money value={monthly} size="inline" cents={Number.isInteger(monthly) ? 'never' : 'decimal'} animated={false} /><span className="text-[11px] font-semibold text-slate-muted">/mo</span></div>
      <div className="text-[18px] text-slate-muted">×</div>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(4, 14px)' }}>
        {Array.from({ length: months }, (_, i) => <div key={i} className="h-[14px] w-[14px] rounded-[3px] bg-teal" style={{ animation: `fadeIn .15s ${d(300 + i * 40)} both` }} />)}
      </div>
      <div className="text-[18px] text-slate-muted">=</div>
      <div className="text-[26px] font-extrabold"><Money value={shown} size="inline" cents="never" delayMs={delay} /><span className="text-[13px] font-semibold text-slate-muted">/yr</span></div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ monthly: ctx.q.amount, yearly: Math.round(ctx.q.amount * 12), months: 12 })

export { meta, condition } from './meta'
export default Annualized
