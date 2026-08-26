import type { EngineContext, PaymentOption } from '@/engine/types'
import { CardShell, Money, Rich, T, useDelay } from '../kit'

interface Props { amount: number; options: PaymentOption[] }

/** Heat ramp: nothing added → some → most. Never colour alone — every branch prints its own delta. */
const TONE: Record<PaymentOption['key'], string> = { cash: 'var(--teal)', loan: 'var(--salmon)', card: 'var(--red)' }
/** Branch-graph geometry (px): gutter width, trunk x inside it, node y inside each row. */
const GUTTER = 30
const SPINE = 7
const NODE = 15
/** A comparison row has a natural measure: past this the label and its total stop reading as a pair. */
const ROW = 'max-w-[520px]'

/**
 * #32 — one decision splits into three branches, and each lands on a row of a shared grid:
 * totals in one column, interest bars on one capped scale, terms on one baseline. The rows argue.
 * Wide spans grow the branch spacing, not the artwork; the closing line anchors the bottom.
 * NB: className strings are literal — `cn` is twMerge, which eats named font-size classes.
 */
function PaymentFork({ amount, options }: Props) {
  const d = useDelay()
  const maxExtra = Math.max(1, ...options.map((o) => o.total - amount))
  return (
    <CardShell className="flex flex-col">
      <div className={`${T.title} text-navy`}>
        Three ways to pay <Money value={amount} size="inline" cents="never" animated={false} />
      </div>
      <div className="mt-1 text-caption text-slate">The bars are what interest adds.</div>

      {/* the trunk: one decision, before it splits */}
      <div className="relative mt-3 h-3.5" aria-hidden>
        <span className="absolute top-0 rounded-full bg-navy" style={{ left: SPINE - 3.5, width: 8, height: 8 }} />
        <span className="absolute bottom-0 bg-navy" style={{ left: SPINE - 0.5, top: 7, width: 2 }} />
      </div>

      {/* the branches take any extra card height as spacing, so the tree opens up instead of leaving a void */}
      <div className="flex grow flex-col">
        {options.map((o, i) => {
          const extra = Math.max(0, o.total - amount)
          const last = i === options.length - 1
          return (
            <div key={o.key} className="flex grow items-start" style={{ animation: `riseIn .34s ${d(240 + i * 90)} both` }}>
              <div className="relative shrink-0 self-stretch" style={{ width: GUTTER }} aria-hidden>
                <div className="absolute rounded-bl-sm2 border-b-2 border-l-2 border-navy" style={{ left: SPINE - 0.5, top: 0, right: 6, height: NODE }} />
                {last ? null : <span className="absolute bottom-0 bg-navy" style={{ left: SPINE - 0.5, top: NODE, width: 2 }} />}
                <span className="absolute rounded-full ring-2 ring-white" style={{ right: 0, top: NODE - 4, width: 8, height: 8, background: TONE[o.key] }} />
              </div>

              <div className={`min-w-0 flex-1 rounded-ctl px-3 py-2.5 ${ROW} ${o.winner ? 'bg-teal-tint shadow-winner' : ''}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <div className={`${T.lede} truncate text-navy`}>{o.label}</div>
                  <Money value={o.total} size="sm" cents="never" animated={false} className="shrink-0 text-navy" />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3" role="img" aria-label={extra > 0 ? `${o.label}: ${extra} dollars of interest added` : `${o.label}: no interest added`}>
                  <div className={`h-2 min-w-0 max-w-[420px] flex-1 rounded-pill ${o.winner ? 'bg-white' : 'bg-lavender-soft'}`}>
                    <div
                      className="h-full rounded-pill"
                      style={{ width: extra > 0 ? `${Math.max(8, (extra / maxExtra) * 100)}%` : '8px', background: TONE[o.key], animation: `sparkReveal .5s ${d(460 + i * 90)} both` }}
                    />
                  </div>
                  <div className={`w-11 shrink-0 text-right text-caption font-bold ${extra > 0 ? 'text-slate' : 'text-teal-ink'}`}>
                    <Money value={extra} size="inline" cents="never" signed={extra > 0} animated={false} />
                  </div>
                </div>
                <div className="mt-1.5 text-meta text-slate"><Rich text={o.note} animated={false} /></div>
                {o.winner ? (
                  <div className="mt-1.5 flex items-center gap-1 text-caption font-semibold text-teal-ink">
                    <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0" aria-hidden><path d="M2.4 6.4 4.8 8.8 9.6 3.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Lowest true cost
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className={`mt-3.5 border-t border-lavender pt-3 text-meta text-slate ${ROW}`}>
        Best to worst: <span className="font-bold text-navy"><Money value={maxExtra} size="inline" cents="never" animated={false} /></span> apart on the same purchase.
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ amount: ctx.q.amount, options: ctx.paymentOptions })

export { meta, condition } from './meta'
export default PaymentFork
