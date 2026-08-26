import { useState } from 'react'
import type { EngineContext } from '@/engine/types'
import { Money, NumberFlowGroup, Caps, T, cn } from '../kit'
import { fmtMoney } from '@/engine/format'

interface Props { amount: number; tightAt: number; maxPeople: number }

/** Stepper: 36px hit target, reads as a button in every state — hover, press, focus, disabled. */
const STEP = 'flex h-9 w-9 shrink-0 cursor-pointer select-none items-center justify-center rounded-full border-[1.5px] border-teal bg-white text-metric-sm font-bold leading-none text-teal transition-colors hover:bg-teal-tint active:bg-teal-tint2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 disabled:cursor-not-allowed disabled:border-lavender disabled:bg-lavender-soft disabled:text-slate-muted'
const SEAT = 'flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-full border-[1.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50'
/** Verdict chip — the flat tint + ink pair the other cards use, never a loud solid fill. */
const CHIP = { fine: 'bg-teal-tint text-teal-ink', tight: 'bg-salmon-tint text-salmon-ink' } as const

/**
 * #23 — the live receipt: torn edge, stepper 1–4, per-person share rolls like an odometer,
 * verdict re-evaluates for the share.
 *
 * A receipt is a narrow object, so the paper caps at 520px and the perforation rule can never
 * run the full width of a wide bento span. Past ~444px of content the two halves — who's in,
 * what each pays — sit side by side instead of stacking.
 */
function SplitCheck({ amount, tightAt, maxPeople }: Props) {
  const [people, setPeople] = useState(1)
  const share = amount / people
  const tight = share >= tightAt
  const cents = Number.isInteger(Math.round(share * 100) / 100) ? 'never' : 'decimal'
  const ways = people === 1 ? 'just you, for now' : `split ${people} ways`
  const word = tight ? 'Tight.' : 'Fine.'
  return (
    <div className="flex h-full flex-col">
      <div className="pc-card flex flex-1 flex-col rounded-b-none px-5 pb-5 pt-4.5">
        <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center">
          <div className="flex items-baseline justify-between gap-2">
            <Caps>The check</Caps>
            <Money value={amount} size="sm" cents="never" animated={false} className="text-slate" />
          </div>
          <div className="my-3.5 border-t-[1.5px] border-dotted border-lavender" />

          <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-5">
            <div className="shrink-0 basis-[240px]">
              <Caps className="mb-2.5 text-center">who's in</Caps>
              <div className="flex items-center justify-center gap-3">
                <button type="button" onClick={() => setPeople(Math.max(1, people - 1))} disabled={people <= 1} aria-label="One fewer person" className={STEP}>−</button>
                <div role="group" aria-label="How many people are splitting" className="flex gap-1.5">
                  {Array.from({ length: maxPeople }, (_, i) => {
                    const n = i + 1
                    const on = n <= people
                    return (
                      <button key={n} type="button" onClick={() => setPeople(n)} aria-pressed={n === people} aria-label={n === 1 ? 'Just me' : `Split ${n} ways`} className={cn(SEAT, on ? 'border-teal bg-teal hover:border-[var(--teal-hover)] hover:bg-[var(--teal-hover)]' : 'border-lavender-deep bg-white hover:border-teal hover:bg-teal-tint')}>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden><circle cx="12" cy="8" r="4" fill={on ? '#fff' : 'var(--lavender-deep)'} /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill={on ? '#fff' : 'var(--lavender-deep)'} /></svg>
                      </button>
                    )
                  })}
                </div>
                <button type="button" onClick={() => setPeople(Math.min(maxPeople, people + 1))} disabled={people >= maxPeople} aria-label="One more person" className={STEP}>+</button>
              </div>
            </div>

            <div className="grow basis-[180px] text-center" role="status" aria-live="polite" aria-atomic="true">
              <span className="sr-only">{fmtMoney(share, cents)} per person — {ways}. Verdict: {word}</span>
              <div aria-hidden>
                <Caps>per person</Caps>
                <div className="mt-1"><NumberFlowGroup><Money value={share} size="hero" cents={cents} className="text-navy" /></NumberFlowGroup></div>
                <div className={cn(T.meta, 'mt-1.5')}>{ways}</div>
              </div>
            </div>
          </div>

          {/* The verdict spans both halves, so at a wide span it ties the control column to the
              payoff column instead of leaving the shorter one stranded. Announced via the sr-only
              line above, so the chip itself stays out of the a11y tree. */}
          <div className="mt-4 text-center" aria-hidden>
            <span className={cn('inline-block rounded-pill px-2.5 py-0.5 text-caption font-bold transition-colors duration-300', tight ? CHIP.tight : CHIP.fine)}>{word}</span>
            <div className={cn(T.caption, 'mt-1.5')}>for your share, not the whole check</div>
          </div>
        </div>
      </div>
      <div className="-mt-3.5 h-3" style={{ background: 'linear-gradient(-45deg, transparent 8px, #fff 0) 0 0/16px 16px, linear-gradient(45deg, transparent 8px, #fff 0) 8px 0/16px 16px', filter: 'drop-shadow(0 3px 3px rgba(32,23,71,.05))' }} aria-hidden />
    </div>
  )
}

export const select = (ctx: EngineContext): Props => ({ amount: ctx.q.amount, tightAt: ctx.splitTightAt, maxPeople: 4 })

export { meta, condition } from './meta'
export default SplitCheck
