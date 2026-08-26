import type { EngineContext } from '@/engine/types'
import { Money, Num, Caps, T, cn, useDelay } from '../kit'
import { ProgressCircle } from '@/vendor/tremor/ProgressCircle'

interface Props { label: string; amount: number; daysLeft: number; windowDays: number; noun: string }

/** #16 — the expiring coupon: the value leads on the ticket body, a 270° countdown dial rides the gold stub. Never red. */
function CreditExpiry({ label, amount, daysLeft, windowDays, noun }: Props) {
  const d = useDelay()
  return (
    <div className="pc-card relative flex h-full overflow-hidden">
      {/* Ticket body centres on the stub's dial, so a stretched row keeps the two halves aligned. */}
      <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4.5">
        <div className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full shadow-[inset_0_-1px_2px_rgba(0,0,0,.2)]" style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))' }} aria-hidden />
          <Caps>Unused credit</Caps>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
          <Money value={amount} size="md" cents="never" className="text-navy" />
          <span className={cn(T.lede, 'min-w-0 text-slate')}>{label}</span>
        </div>
        <p className={cn(T.body, 'mt-1.5 text-slate')}>This {noun} uses it before it disappears.</p>
      </div>
      <div className="relative flex w-[102px] shrink-0 items-center justify-center border-l-2 border-dashed border-lavender-deep" style={{ background: 'var(--gold-tint)', animation: `pulseOnce .5s ${d(950)} both` }}>
        <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-page" aria-hidden />
        <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-page" aria-hidden />
        <ProgressCircle value={Math.min(1, Math.max(0, daysLeft / windowDays))} size={70} strokeWidth={5} arc={270} color="var(--gold-deep)" track="#EBE1C8" delay={d(450)}>
          <div className="text-metric-sm font-extrabold tabular-nums leading-none text-navy"><Num value={daysLeft} /></div>
          <div className={cn(T.micro, 'mt-1')}>days left</div>
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
