import { useEffect, useState } from 'react'
import type { EngineContext } from '@/engine/types'
import { defineCard, CardShell, Money, useDelay } from './kit'

interface Props { months: { label: string; balance: number; interest: number }[]; total: number; cardName: string }

/** #9 — three month columns: remaining balance with a red interest cap; cumulative tag counts up above the third. */
function CarryingCost({ months, total }: Props) {
  const d = useDelay()
  const [shown, setShown] = useState(0)
  useEffect(() => { const t = setTimeout(() => setShown(total), parseInt(d(900))); return () => clearTimeout(t) }, [total, d])
  const maxBal = Math.max(...months.map((m) => m.balance + m.interest * 6))
  return (
    <CardShell>
      <div className="mb-[10px] text-[13px] text-slate">If it rides the card: interest stacks monthly.</div>
      <div className="relative flex h-[110px] items-end justify-center gap-[22px]">
        {months.map((m, i) => (
          <div key={m.label} className="relative text-center">
            {i === months.length - 1 ? (
              <div className="absolute left-1/2 top-[2px] -translate-x-1/2 whitespace-nowrap rounded-pill bg-red px-2 py-[2px] text-[10.5px] font-bold text-white" style={{ animation: `popIn .3s ${d(900)} both` }}><Money value={shown} size="inline" cents="never" signed /></div>
            ) : null}
            <div className="mx-auto flex w-[34px] flex-col justify-end" style={{ height: 82 }}>
              <div className="rounded-t-[4px] bg-red" style={{ height: Math.max(4, (m.interest * 6 / maxBal) * 82), transformOrigin: 'bottom', animation: `growUp .25s ${d(300 + i * 150)} both` }} />
              <div className="bg-lavender" style={{ height: (m.balance / maxBal) * 82, transformOrigin: 'bottom', animation: `growUp .25s ${d(200 + i * 150)} both` }} />
            </div>
            <div className="mt-[5px] text-[10.5px] text-slate-muted">{m.label}</div>
          </div>
        ))}
      </div>
    </CardShell>
  )
}

export const condition = (ctx: EngineContext) => ctx.carrying !== null && ctx.q.frequency !== 'recurring'
export const select = (ctx: EngineContext): Props => ({ months: ctx.carrying!.months.map((m) => ({ label: m.label, balance: m.balance, interest: m.interest })), total: ctx.carrying!.totalInterest, cardName: ctx.carrying!.card.name })

export default defineCard<Props>({ type: 'carrying_cost', section: 'Money context', label: '', condition, select, Component: CarryingCost, samples: [{ query: '$450 monitor' }] })
