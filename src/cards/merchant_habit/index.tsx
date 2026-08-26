import type { EngineContext } from '@/engine/types'
import { CardShell, Money, Num, T, cn, useDelay } from '../kit'

interface Props { merchant: string; visits: number; slots: number; ytdSpend: number }

/** #19 — loyalty punch card: 8 slots, this month's visits stamped navy, the rest empty. Zero judgment. */
function MerchantHabit({ merchant, visits, slots, ytdSpend }: Props) {
  const d = useDelay()
  return (
    <CardShell className="flex flex-col gap-3">
      {/* The stamp row is capped: on a wide bento span the extra width goes to the figures moving
          beside it, so the row stays a punch card instead of spreading into isolated dots. */}
      <div className="flex max-w-[320px] items-baseline justify-between gap-2">
        <div className={T.lede}>{merchant}</div>
        <div className="shrink-0 text-micro font-semibold uppercase tracking-[.1em] text-slate-muted">Regular&rsquo;s card</div>
      </div>

      <div className="flex flex-1 flex-wrap content-center items-center gap-x-6 gap-y-3">
        <div className="grid min-w-[250px] max-w-[320px] flex-1 gap-1.5" style={{ gridTemplateColumns: `repeat(${slots}, minmax(0, 1fr))` }} aria-hidden>
          {Array.from({ length: slots }, (_, i) => {
            const punched = i < visits
            return (
              <div
                key={i}
                className={cn('aspect-square w-full max-w-7 rounded-full', punched ? 'bg-navy' : 'border-2 border-lavender-deep bg-white')}
                style={punched ? { animation: `popIn .25s ${d(200 + i * 60)} both` } : undefined}
              />
            )
          })}
        </div>

        <div className="flex min-w-[200px] flex-1 flex-wrap items-baseline gap-x-2 text-navy">
          <span className="flex items-baseline gap-1.5">
            <Num value={visits} className="text-metric font-extrabold" />
            <span className={`${T.lede} text-slate`}>{visits === 1 ? 'visit' : 'visits'} this month</span>
          </span>
          <span className="whitespace-nowrap text-meta text-slate-muted">
            · <Money value={ytdSpend} size="inline" cents="never" /> here this year
          </span>
        </div>
      </div>
    </CardShell>
  )
}

/** Slots grow with the habit: 8 normally, but always one empty past a heavy month so the card
 *  reads "this would be the next stamp" instead of saturating. Capped at 12 — beyond that the row
 *  stops being a punch card. A visits count above the cap still prints in full beside it. */
const slotsFor = (visits: number) => Math.max(8, Math.min(12, visits + 1))

export const select = (ctx: EngineContext): Props => ({ merchant: ctx.merchantHabit!.merchant, visits: ctx.merchantHabit!.visitsThisMonth, slots: slotsFor(ctx.merchantHabit!.visitsThisMonth), ytdSpend: ctx.merchantHabit!.ytdSpend })

export { meta, condition } from './meta'
export default MerchantHabit
