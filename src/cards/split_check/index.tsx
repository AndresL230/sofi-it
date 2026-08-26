import { useState } from 'react'
import type { EngineContext } from '@/engine/types'
import { Money, NumberFlowGroup, Caps } from '../kit'

interface Props { amount: number; tightAt: number; maxPeople: number }

/** #23 — the live receipt: zigzag torn edge, stepper 1–4, per-person share rolls like an odometer, verdict pill re-evaluates for the share. */
function SplitCheck({ amount, tightAt, maxPeople }: Props) {
  const [people, setPeople] = useState(1)
  const share = amount / people
  const tight = share >= tightAt
  return (
    <div>
      <div className="pc-card rounded-b-none px-5 pb-1 pt-[18px]">
        <Caps className="text-center tracking-[.12em]">The check</Caps>
        <div className="mt-1 text-center"><Money value={amount} size="lg" /></div>
        <div className="my-[14px] border-t-[1.5px] border-dotted border-lavender" />
        <div className="flex items-center justify-center gap-[14px]">
          <button onClick={() => setPeople(Math.max(1, people - 1))} className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-full border-[1.5px] border-teal text-[18px] text-teal hover:bg-teal-tint" aria-label="Fewer people">−</button>
          <div className="flex gap-2">
            {Array.from({ length: maxPeople }, (_, i) => {
              const on = i < people
              return (
                <div key={i} className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-[1.5px] transition-colors duration-200" style={{ background: on ? 'var(--teal)' : '#fff', borderColor: on ? 'var(--teal)' : 'var(--lavender-deep)' }}>
                  <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]" aria-hidden><circle cx="12" cy="8" r="4" fill={on ? '#fff' : 'var(--lavender-deep)'} /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill={on ? '#fff' : 'var(--lavender-deep)'} /></svg>
                </div>
              )
            })}
          </div>
          <button onClick={() => setPeople(Math.min(maxPeople, people + 1))} className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-full border-[1.5px] border-teal text-[18px] text-teal hover:bg-teal-tint" aria-label="More people">+</button>
        </div>
        <div className="mt-3 text-center"><div className="text-[12px] text-slate">your share</div><NumberFlowGroup><Money value={share} size="md" cents={Number.isInteger(Math.round(share * 100) / 100) ? 'never' : 'decimal'} className="text-navy" /></NumberFlowGroup></div>
        <div className="mb-3 mt-[14px] border-t-[1.5px] border-dotted border-lavender" />
        <div className="pb-3 text-center">
          <span className="inline-block rounded-pill px-[18px] py-[6px] text-[13px] font-bold text-white transition-colors [transition-duration:250ms]" style={{ background: tight ? 'var(--salmon)' : 'var(--teal)' }}>{tight ? 'tight' : 'fine'}</span>
          <div className="mt-[6px] text-[11px] text-slate">verdict for your share</div>
        </div>
      </div>
      <div className="-mt-[14px] h-3" style={{ background: 'linear-gradient(-45deg, transparent 8px, #fff 0) 0 0/16px 16px, linear-gradient(45deg, transparent 8px, #fff 0) 8px 0/16px 16px', filter: 'drop-shadow(0 3px 3px rgba(32,23,71,.05))' }} aria-hidden />
    </div>
  )
}

export const select = (ctx: EngineContext): Props => ({ amount: ctx.q.amount, tightAt: ctx.splitTightAt, maxPeople: 4 })

export { meta, condition } from './meta'
export default SplitCheck
