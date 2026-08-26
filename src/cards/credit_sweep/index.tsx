import { useEffect, useState } from 'react'
import type { EngineContext } from '@/engine/types'
import { CardShell, Money, Caps, T, cn, useDelay } from '../kit'

interface Props { credits: { label: string; amount: number }[]; total: number }

/** #15 — the sweep total leads; below it one mini ticket per unused credit (gold stock, perforated edge) staggers in. */
function CreditSweep({ credits, total }: Props) {
  const d = useDelay()
  const [swept, setSwept] = useState(0)
  useEffect(() => { setSwept(total) }, [total])
  const last = d(300 + credits.length * 80)
  return (
    <CardShell className="flex flex-col justify-center">
      {/* The gold coin and the ticket stock carry the gold FILL; the figure itself stays navy. */}
      <div className="flex items-center gap-2">
        <span className="h-3.5 w-3.5 shrink-0 rounded-full shadow-[inset_0_-1px_2px_rgba(0,0,0,.2)]" style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))' }} aria-hidden />
        <Caps>Unused credits</Caps>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <Money value={swept} size="lg" cents="never" className="text-navy" delayMs={parseInt(last)} />
        <span className={T.caption}>you can sweep into this</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {credits.map((c, i) => (
          <div
            key={c.label}
            className="flex min-w-0 items-baseline gap-1.5 rounded-sm2 border-l-2 border-dashed border-gold-deep px-2.5 py-2"
            style={{ background: 'var(--gold-tint-solid)', animation: `popIn .3s ${d(300 + i * 80)} both` }}
          >
            <b className={cn(T.lede, 'font-extrabold tabular-nums text-ink')}><Money value={c.amount} size="inline" cents="never" animated={false} /></b>
            <span className={cn(T.caption, 'min-w-0')}>{c.label}</span>
          </div>
        ))}
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ credits: ctx.credits.map((c) => ({ label: c.label.replace(' credit', '').replace('Chase ', ''), amount: c.amount })), total: ctx.credits.reduce((a, c) => a + c.amount, 0) })

export { meta, condition } from './meta'
export default CreditSweep
