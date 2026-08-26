import type { EngineContext, PaymentOption } from '@/engine/types'
import { CardShell, Money, Rich, useDelay } from '../kit'

interface Props { amount: number; options: PaymentOption[] }

/** #32 — the branching paths: one navy dot splits into three bezier branches feeding three cost bars proportional to true total. The bars argue. */
function PaymentFork({ amount, options }: Props) {
  const d = useDelay()
  const max = Math.max(...options.map((o) => o.total))
  const COLORS: Record<PaymentOption['key'], string> = { cash: 'var(--teal)', loan: 'var(--purple)', card: 'var(--red)' }
  return (
    <CardShell className="px-[22px] py-5">
      <div className="text-[15px] font-semibold text-navy">Three ways to pay <Money value={amount} size="inline" cents="never" animated={false} /></div>
      <svg viewBox="0 0 340 64" className="mt-[6px] block w-full" aria-hidden>
        <circle cx="170" cy="8" r="5" fill="var(--navy)" />
        {['M170 13 v10 C170 42 60 36 60 62', 'M170 13 v49', 'M170 13 v10 C170 42 280 36 280 62'].map((p) => <path key={p} d={p} fill="none" stroke="var(--navy)" strokeWidth="2" pathLength={1} strokeDasharray="1" strokeDashoffset="1" style={{ animation: `draw .3s ${d(200)} both` }} />)}
      </svg>
      <div className="flex gap-[14px] text-center">
        {options.map((o, i) => (
          <div key={o.key} className="relative flex-1 rounded-ctl px-[6px] py-[10px]" style={{ boxShadow: o.winner ? '0 0 0 1.5px var(--teal)' : undefined }}>
            {o.winner ? <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-teal px-2 py-[2px] text-[9px] font-bold text-white">true cost winner</div> : null}
            <div className="flex h-24 items-end justify-center"><div className="w-7 rounded-t-[6px]" style={{ height: `${(o.total / max) * 96}px`, background: COLORS[o.key], transformOrigin: 'bottom', animation: `growUp .2s ${d(500 + i * 200)} both` }} /></div>
            <div className="mt-2 text-[13px] font-semibold">{o.label}</div>
            <div className="text-[18px] font-extrabold"><Money value={o.total} size="inline" cents="never" animated={false} /></div>
            <div className="text-[11px] text-slate"><Rich text={o.note} animated={false} /></div>
          </div>
        ))}
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ amount: ctx.q.amount, options: ctx.paymentOptions })

export { meta, condition } from './meta'
export default PaymentFork
