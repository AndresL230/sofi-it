import type { EngineContext } from '@/engine/types'
import { CardShell, Caps, Money, T, cn, useDelay } from '../kit'

interface Props { candidate: { name: string; price: number }; rows: { name: string; price: number }[]; total: number; newTotal: number }

/**
 * #26 — the tower: every subscription is a bar sized by price, biggest at the bottom, and the
 * candidate lands on top of the pile under its own "adding" label (band + bold + a signed
 * amount, so the new row never depends on colour alone). The new monthly total is the payoff.
 */
function SubscriptionStack({ candidate, rows, total, newTotal }: Props) {
  const d = useDelay()
  const sorted = [...rows].sort((a, b) => b.price - a.price)
  const max = Math.max(candidate.price, ...sorted.map((r) => r.price))
  const tight = sorted.length > 6
  const bar = (price: number, fill: string) => (
    <span className="h-1.5 flex-1 overflow-hidden rounded-pill bg-lavender-soft">
      <span className="block h-full rounded-pill" style={{ width: `${Math.max(6, (price / max) * 100)}%`, background: fill }} />
    </span>
  )
  return (
    <CardShell className="flex flex-col">
      <Caps className="px-2 text-gold-ink">Adding</Caps>
      <div className="mt-1.5 flex items-center gap-2 rounded-sm2 px-2 py-2 text-lede font-bold" style={{ background: 'var(--gold-tint-solid)', animation: `riseIn .4s ${d(300)} both` }}>
        <span className="w-24 shrink-0 truncate">{candidate.name}</span>
        {bar(candidate.price, 'var(--gold-deep)')}
        <span className="w-16 shrink-0 text-right tabular-nums"><Money value={candidate.price} size="inline" cents="decimal" signed animated={false} /></span>
      </div>

      {sorted.length > 0 && <Caps className="mt-3.5 px-2">The {sorted.length} you already pay</Caps>}
      <div className={cn('mb-3.5 mt-1.5 flex flex-1 flex-col justify-around tabular-nums', tight ? 'space-y-1' : 'space-y-1.5')}>
        {sorted.map((r) => (
          <div key={r.name} className="flex items-center gap-2 px-2 text-meta">
            <span className="w-24 shrink-0 truncate text-slate">{r.name}</span>
            {bar(r.price, 'var(--navy)')}
            <span className="w-16 shrink-0 text-right"><Money value={r.price} size="inline" cents="decimal" animated={false} /></span>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-baseline justify-between gap-2 border-t border-lavender pt-3">
        <div>
          <div className={T.lede}>Monthly total</div>
          <div className={cn(T.caption, 'mt-0.5')}>up from <Money value={total} size="inline" cents="decimal" animated={false} /></div>
        </div>
        <Money value={newTotal} size="lg" className="shrink-0" delayMs={parseInt(d(600))} />
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ candidate: { name: ctx.q.serviceName ?? 'This one', price: ctx.q.amount }, rows: ctx.subs.rows.map((s) => ({ name: s.name, price: s.price })), total: ctx.subs.total, newTotal: ctx.subs.newTotal })

export { meta, condition } from './meta'
export default SubscriptionStack
