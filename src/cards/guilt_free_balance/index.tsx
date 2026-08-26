import type { EngineContext } from '@/engine/types'
import { CardShell, Money, T, cn, useDelay } from '../kit'
import { ProgressCircle } from '@/vendor/tremor/ProgressCircle'

interface Props { monthly: number; left: number; covers: number; remainder: number; thing: string }

/** covered = the allowance pays for all of it · partial = it eats what's left and then some · spent = there's nothing left to spend. */
type State = 'covered' | 'partial' | 'spent'

/** State glyph: a filled / half / empty disc, so the verdict survives without color. */
function Disc({ state }: { state: State }) {
  return (
    <svg viewBox="0 0 12 12" className="mt-px h-3 w-3 shrink-0" aria-hidden>
      <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {state === 'covered' ? <circle cx="6" cy="6" r="5" fill="currentColor" /> : null}
      {state === 'partial' ? <path d="M6 1.5A4.5 4.5 0 0 1 6 10.5z" fill="currentColor" /> : null}
    </svg>
  )
}

/** #34 — the fun-money gauge, the lightest card in the system. Teal is what stays yours, gold is what this buy claims. Never red, no warnings. */
function GuiltFreeBalance({ monthly, left, covers, remainder, thing }: Props) {
  const d = useDelay()
  const state: State = remainder <= 0 ? 'covered' : covers > 0 ? 'partial' : 'spent'
  const frac = monthly > 0 ? left / monthly : 0
  const after = Math.max(0, left - covers)
  const afterFrac = monthly > 0 ? after / monthly : 0
  const verdict = state === 'covered' ? <>All of it is pre-approved.</> : state === 'partial' ? <>Pre-approved up to <Money value={covers} size="inline" cents="never" animated={false} />.</> : <>This month's fun money is spent.</>
  return (
    <CardShell className="flex items-stretch gap-4.5">
      <div className="shrink-0">
        <div className="relative h-[76px] w-[76px]">
          <svg width="0" height="0" aria-hidden><defs><linearGradient id="gfgTeal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--teal)" /><stop offset="100%" stopColor="var(--green)" /></linearGradient></defs></svg>
          <ProgressCircle value={frac} size={76} strokeWidth={7} color={frac > 0 ? 'var(--gold-deep)' : 'transparent'} track="var(--lavender)" delay={d(350)} settle>
            <div className="text-metric-sm font-extrabold text-navy"><Money value={left} size="inline" cents="never" /></div>
            <div className="mt-0.5 text-micro text-slate">left</div>
          </ProgressCircle>
          {afterFrac > 0 ? (
            <div className="pointer-events-none absolute inset-0">
              <ProgressCircle value={afterFrac} size={76} strokeWidth={7} gradientId="gfgTeal" track="transparent" delay={d(350)} />
            </div>
          ) : null}
        </div>
        {state !== 'spent' ? (
          <div className="mt-2 space-y-0.5 text-micro text-slate">
            {afterFrac > 0 ? <div className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-green" />still yours</div> : null}
            <div className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />this buy</div>
          </div>
        ) : null}
      </div>

      {/* A stretched bento row gives the extra height to the gap above the state chip, not to a void below it. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className={cn(T.title, 'text-navy')}>{verdict}</div>
        <div className="mt-1 max-w-[46ch] text-body text-slate">
          You set aside <Money value={monthly} size="inline" cents="never" animated={false} />/mo for this — no questions asked.
        </div>
        <div className="mt-auto pt-2.5">
          <div
            className="inline-flex max-w-full items-start gap-1.5 rounded-sm2 px-2.5 py-1.5 text-caption font-semibold"
            style={state === 'covered' ? { background: 'var(--green-tint)', color: 'var(--green)' } : { background: 'var(--gold-tint-solid)', color: 'var(--gold-ink)' }}
          >
            <Disc state={state} />
            <span>
              {state === 'covered' ? <>covers all of {thing} — nothing to decide</> : null}
              {state === 'partial' ? <>the last <Money value={remainder} size="inline" cents="never" animated={false} /> is a real decision</> : null}
              {state === 'spent' ? <>all <Money value={remainder} size="inline" cents="never" animated={false} /> of {thing} is a real decision</> : null}
            </span>
          </div>
        </div>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ monthly: ctx.allowance.monthly, left: ctx.allowance.left, covers: ctx.allowance.covers, remainder: ctx.allowance.remainder, thing: ctx.q.thing.length <= 16 ? `these ${ctx.q.thing}` : 'this' })

export { meta, condition } from './meta'
export default GuiltFreeBalance
