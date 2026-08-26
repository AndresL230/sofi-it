import type { EngineContext } from '@/engine/types'
import { Money, Num, Caps, useDelay } from '../kit'
import { ProgressCircle } from '@/vendor/tremor/ProgressCircle'

interface Props { label: string; amount: number; daysLeft: number; windowDays: number; noun: string }

/** #16 — the expiring coupon: 70/30 split by a perforated divider with punched notches; gold stub holds a 270° countdown dial. Never red. */
function CreditExpiry({ label, amount, daysLeft, windowDays, noun }: Props) {
  const d = useDelay()
  return (
    <div className="pc-card relative flex overflow-hidden">
      <div className="flex-[7] px-5 py-[18px]">
        <div className="flex items-center gap-[7px]"><div className="h-4 w-4 rounded-full shadow-[inset_0_-1px_2px_rgba(0,0,0,.2)]" style={{ background: 'linear-gradient(135deg, #F5CE6E, #C8973B)' }} /><Caps className="tracking-[.09em]">Unused credit</Caps></div>
        <div className="mt-2 text-[17px] font-semibold text-navy"><Money value={amount} size="inline" cents="never" /> {label}</div>
        <div className="mt-1 text-[14px] text-slate">This {noun} uses it before it disappears.</div>
      </div>
      <div className="relative flex min-w-[110px] flex-[3] items-center justify-center border-l-2 border-dashed border-lavender" style={{ background: 'var(--gold-tint)', animation: `pulseOnce .5s ${d(950)} both` }}>
        <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-page" />
        <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-page" />
        <ProgressCircle value={Math.min(1, Math.max(0, daysLeft / windowDays))} size={76} strokeWidth={4} arc={270} color="var(--gold-deep)" track="#F0EAD6" delay={d(450)}>
          <div className="text-[28px] font-extrabold leading-none text-navy"><Num value={daysLeft} /></div>
          <div className="text-[11px] text-slate">days left</div>
        </ProgressCircle>
      </div>
    </div>
  )
}

export const select = (ctx: EngineContext): Props => {
  const c = ctx.credits.filter((x) => x.category === 'dining' && x.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft)[0]
  return { label: c.label, amount: c.amount, daysLeft: c.daysLeft, windowDays: 30, noun: ctx.q.category === 'coffee' ? 'coffee' : 'dinner' }
}

export { meta, condition } from './meta'
export default CreditExpiry
