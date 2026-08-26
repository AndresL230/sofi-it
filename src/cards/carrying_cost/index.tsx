import type { EngineContext } from '@/engine/types'
import { CardShell, Caps, Money, T, cn, useDelay } from '../kit'

interface Props { months: { label: string; balance: number; interest: number }[]; total: number; cardName: string }

/**
 * #9 — interest stacking month by month. The bars are CUMULATIVE interest (truthful scale:
 * the last bar is the headline figure), each one labelled with its running total, so the
 * reader sees the cost pile up rather than a balance that barely moves.
 */
function CarryingCost({ months, total, cardName }: Props) {
  const d = useDelay()
  let run = 0
  const bars = months.map((m) => ({ label: m.label, cum: (run += m.interest), balance: m.balance }))
  const maxCum = Math.max(1, bars[bars.length - 1]?.cum ?? 1)
  const last = bars[bars.length - 1]
  const card = cardName.replace('Chase ', '').replace(' Unlimited', '')
  return (
    <CardShell className="flex flex-col justify-center">
      {/* Three bars have a natural maximum width — past it the chart would read as three lonely
          columns, so wide spans move the figure beside it instead of spreading it. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5">
        <div className="min-w-0 flex-1 basis-[200px]">
          <Caps>Carried on the {card}</Caps>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <Money value={total} size="md" cents="never" signed className="text-red-ink" delayMs={parseInt(d(600))} />
            <span className={T.meta}>of interest in {months.length} months</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 basis-[240px] max-w-[300px]">
          <div className="grid border-b border-lavender" style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))` }} role="img" aria-label={`Interest stacks to ${Math.round(total)} dollars over ${months.length} months`}>
            {bars.map((b, i) => (
              <div key={b.label} className="flex h-20 flex-col justify-end">
                <div className={cn(T.micro, 'mb-1 text-center')}><Money value={Math.round(b.cum)} size="inline" cents="never" animated={false} /></div>
                <div className="mx-auto rounded-t-[3px] bg-red" style={{ width: '66%', maxWidth: 56, height: Math.max(3, (b.cum / maxCum) * 58), transformOrigin: 'bottom', animation: `growUp .3s ${d(250 + i * 160)} both` }} />
              </div>
            ))}
          </div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))` }}>
            {bars.map((b) => <div key={b.label} className={cn(T.micro, 'mt-1.5 text-center')}>{b.label}</div>)}
          </div>
        </div>

        <p className={cn(T.body, 'min-w-0 flex-1 basis-[260px] text-slate')}>Minimum payments barely dent it — still <Money value={last?.balance ?? 0} size="inline" cents="never" /> owed in {last?.label}.</p>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ months: ctx.carrying!.months.map((m) => ({ label: m.label, balance: m.balance, interest: m.interest })), total: ctx.carrying!.totalInterest, cardName: ctx.carrying!.card.name })

export { meta, condition } from './meta'
export default CarryingCost
