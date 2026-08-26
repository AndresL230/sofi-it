import type { EngineContext } from '@/engine/types'
import { defineCard, CardShell, Money, DateText } from './kit'

interface Props { checking: number; room: number; reserved: number; bills: { label: string; amount: number }[]; payday: Date }

/** #8 — a literal runway: navy band, white center-line dashes, bills as lavender blocks from the right, lit teal stretch = room, payday beacon. */
function DiscretionaryRunway({ checking, room, reserved, bills, payday }: Props) {
  const pct = (v: number) => `${Math.max(0, (v / checking) * 100)}%`
  return (
    <CardShell>
      <div className="mb-3 text-[13px] text-slate">Your runway to the next paycheck.</div>
      <div className="relative flex h-[46px] items-stretch overflow-hidden rounded-sm2 bg-navy">
        <div className="flex items-center whitespace-nowrap pl-3 text-[12px] font-bold text-white" style={{ width: pct(room), background: 'var(--teal)', minWidth: room > 0 ? 72 : 0 }}><Money value={room} size="inline" cents="never" />&nbsp;of room</div>
        <div className="relative" style={{ width: pct(reserved) }}><div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.5) 0 12px, transparent 12px 26px)' }} /></div>
        {bills.map((b, i) => (
          <div key={b.label} className="flex items-center justify-center text-[9px] font-bold uppercase text-navy" style={{ width: pct(b.amount), background: i % 2 ? 'var(--lavender)' : 'var(--lavender-deep)', minWidth: b.amount / checking > 0.15 ? 60 : 0 }}>
            {b.label}{b.amount / checking > 0.15 ? <>&nbsp;<Money value={b.amount} size="inline" cents="never" animated={false} /></> : null}
          </div>
        ))}
        <div className="absolute right-[5px] top-[6px] h-2 w-2 rounded-full bg-gold" style={{ boxShadow: '0 0 8px 2px rgba(254,216,128,.8)' }} />
      </div>
      <div className="mt-[6px] flex justify-between text-[10.5px] text-slate-muted"><span>today</span><span>payday <DateText date={payday} fmt="weekday" /> ✦</span></div>
    </CardShell>
  )
}

export const condition = (ctx: EngineContext) => ctx.q.frequency !== 'recurring' && ctx.q.size !== 'small' && ctx.runway.room > 0
export const select = (ctx: EngineContext): Props => ({ checking: ctx.runway.checking, room: ctx.runway.room, reserved: ctx.runway.bufferFloor + ctx.runway.essentialsRemaining, bills: ctx.runway.bills.filter((b) => b.amount > 0).map((b) => ({ label: b.label, amount: b.amount })), payday: ctx.runway.nextPayday })

export default defineCard<Props>({ type: 'discretionary_runway', section: 'Money context', label: '', condition, select, Component: DiscretionaryRunway, samples: [{ query: '$180 concert tickets' }] })
