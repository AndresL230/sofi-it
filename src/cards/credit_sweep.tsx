import { useEffect, useState } from 'react'
import type { EngineContext } from '@/engine/types'
import { defineCard, CardShell, Money, useDelay } from './kit'

interface Props { credits: { label: string; amount: number }[]; total: number }

/** #15 — mini ticket chips (gold tint, perforated left edge), one per unused credit; the "swept" pill counts up as they stagger in. */
function CreditSweep({ credits, total }: Props) {
  const d = useDelay()
  const [swept, setSwept] = useState(0)
  useEffect(() => { setSwept(total) }, [total])
  return (
    <CardShell className="flex flex-wrap items-center gap-[10px]">
      {credits.map((c, i) => (
        <div key={c.label} className="rounded-[4px_10px_10px_4px] border-l-2 border-dashed border-gold-deep px-3 py-2 text-[12px] text-slate" style={{ background: 'var(--gold-tint)', animation: `popIn .3s ${d(300 + i * 80)} both` }}>
          <b className="text-[14px] text-ink"><Money value={c.amount} size="inline" cents="never" animated={false} /></b> {c.label}
        </div>
      ))}
      <span className="ml-auto rounded-pill bg-green-tint px-[14px] py-[6px] text-[13px] font-extrabold text-green" style={{ animation: `popIn .3s ${d(300 + credits.length * 80)} both` }}><Money value={swept} size="inline" cents="never" delayMs={parseInt(d(300 + credits.length * 80))} /> swept</span>
    </CardShell>
  )
}

export const condition = (ctx: EngineContext) => ctx.credits.length >= 1 && ctx.q.frequency !== 'recurring' && ctx.q.size !== 'large'
export const select = (ctx: EngineContext): Props => ({ credits: ctx.credits.map((c) => ({ label: c.label.replace(' credit', '').replace('Chase ', ''), amount: c.amount })), total: ctx.credits.reduce((a, c) => a + c.amount, 0) })

export default defineCard<Props>({ type: 'credit_sweep', section: 'Cards & rewards', label: '', condition, select, Component: CreditSweep, samples: [{ query: '$54 groceries' }] })
