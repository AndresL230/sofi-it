import type { EngineContext } from '@/engine/types'
import { CardShell, Caps, DateText, Money, T, cn, useDelay } from '../kit'

interface Props { checking: number; room: number; reserved: number; bills: { label: string; amount: number }[]; payday: Date }

/**
 * #8 — the runway: one bar = everything in checking, split into the lit teal stretch you may
 * actually spend, the navy stretch held for essentials + buffer, and the named bills at the end.
 * Segments are true shares of the balance, so the bar can be read as a proportion.
 */
function DiscretionaryRunway({ checking, room, reserved, bills, payday }: Props) {
  const d = useDelay()
  const total = Math.max(checking, room + reserved + bills.reduce((a, b) => a + b.amount, 0))
  const share = (v: number) => Math.max(0, v / total)
  const pct = (v: number) => `${share(v) * 100}%`
  return (
    <CardShell className="flex flex-col justify-center">
      {/* Wide spans put the figure beside the bar instead of stretching one 36px bar across the
          whole card; under ~500px of content it wraps back to the narrow stack. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1 basis-[185px]">
          <Caps>Runway to payday</Caps>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <Money value={room} size="md" cents="never" className="text-teal-ink" />
            <span className={T.meta}>of <Money value={checking} size="inline" cents="never" animated={false} /> in checking</span>
          </div>
        </div>

        <div className="min-w-0 flex-[1.6] basis-[295px] max-w-[480px]">
          <div className="flex h-9 items-stretch overflow-hidden rounded-sm2 bg-lavender-soft" role="img" aria-label={`${room} dollars of room out of ${checking} dollars in checking`} style={{ animation: `sparkReveal .55s ${d(250)} both` }}>
            <div className="flex items-center pl-2.5 text-micro font-bold uppercase tracking-[.08em] text-white" style={{ width: pct(room), background: 'var(--teal)' }}>{share(room) > 0.17 ? 'yours' : null}</div>
            <div className="flex items-center justify-center bg-navy text-micro font-bold uppercase tracking-[.08em] text-white/75" style={{ width: pct(reserved) }}>{share(reserved) > 0.19 ? 'buffer' : null}</div>
            {bills.map((b, i) => (
              <div key={b.label} className="flex items-center justify-center gap-1 whitespace-nowrap px-1 text-micro font-bold uppercase tracking-[.06em] text-navy" style={{ width: pct(b.amount), background: i % 2 ? 'var(--lavender)' : 'var(--lavender-deep)' }}>
                {share(b.amount) > 0.13 ? <>{b.label}{share(b.amount) > 0.22 ? <Money value={b.amount} size="inline" cents="never" animated={false} /> : null}</> : null}
              </div>
            ))}
          </div>
        </div>

        <p className={cn(T.body, 'min-w-0 flex-1 basis-[250px] text-slate')}>
          Yours until <span className="font-semibold text-navy"><DateText date={payday} fmt="weekdayLong" /></span> — the rest is rent, essentials and buffer.
        </p>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ checking: ctx.runway.checking, room: ctx.runway.room, reserved: ctx.runway.bufferFloor + ctx.runway.essentialsRemaining, bills: ctx.runway.bills.filter((b) => b.amount > 0).map((b) => ({ label: b.label, amount: b.amount })), payday: ctx.runway.nextPayday })

export { meta, condition } from './meta'
export default DiscretionaryRunway
