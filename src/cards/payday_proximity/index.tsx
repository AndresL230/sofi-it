import type { EngineContext } from '@/engine/types'
import { CardShell, Money, Num, Badge, T, cn, useDelay, type CardActions } from '../kit'
import { weekdayShort, weekdayLong } from '@/engine/format'

interface Props { daysToPayday: number; tiles: { date: Date; today: boolean; payday: boolean }[]; paycheck: number; payday: Date }

/**
 * #11 — five-day strip on a 5-column grid, so the rail and the floating paycheck tag land on
 * exact tile centres at any card width. Today is navy, payday teal with the incoming paycheck
 * tagged above it; the teal rail is the wait. Verdicts are words first, colour second.
 */
function PaydayProximity({ daysToPayday, tiles, paycheck, payday, actions }: Props & { actions: CardActions }) {
  const d = useDelay()
  const n = tiles.length
  const step = 100 / n
  const centre = (i: number) => step / 2 + i * step
  const payIdx = tiles.findIndex((t) => t.payday)
  const railTo = centre(payIdx < 0 ? n - 1 : payIdx)
  return (
    <CardShell className="flex flex-col justify-center">
      <div className="flex items-baseline gap-1.5">
        <span className="text-metric font-extrabold tracking-[-0.01em] text-navy"><Num value={daysToPayday} /></span>
        <span className={cn(T.lede, 'text-navy')}>days to payday</span>
      </div>

      {/* Five 44px tiles have a natural maximum span — stretched past it the week reads as five
          islands, so wide cards put the verdicts beside the strip instead of under it. */}
      <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-5">
        <div className="relative min-w-0 flex-1 basis-[300px] max-w-[360px]">
          <div className="absolute h-0.5 bg-lavender" style={{ top: 21, left: `${centre(0)}%`, right: `${centre(0)}%` }} />
          <div className="absolute h-0.5 bg-teal" style={{ top: 21, left: `${centre(0)}%`, width: `${railTo - centre(0)}%`, animation: `sparkReveal .5s ${d(350)} both` }} />
          <div className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {tiles.map((t, i) => (
              <div key={t.date.toISOString()} className="relative flex flex-col items-center">
                {/* Wrapper holds the centring transform; popIn ends at transform:none and would
                    otherwise cancel the -translate-x-1/2, hanging the tag off the tile's left edge. */}
                {t.payday ? (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2">
                    <div className="flex flex-col items-center" style={{ animation: `popIn .3s ${d(600)} both` }}>
                      <span className={cn(T.caption, 'whitespace-nowrap font-bold text-green')}><Money value={paycheck} size="inline" cents="never" signed animated={false} /></span>
                      <span className="mt-0.5 h-2.5 w-px bg-green" />
                    </div>
                  </div>
                ) : null}
                <div
                  className={cn('flex h-11 w-11 items-center justify-center rounded-ctl border-[1.5px] text-title font-bold', t.today ? 'border-navy bg-navy text-white' : t.payday ? 'border-teal bg-teal text-white' : 'border-lavender bg-white text-navy')}
                  style={{ animation: t.today || t.payday ? `popIn .3s ${d(200 + i * 60)} both` : undefined }}
                >
                  {t.date.getDate()}
                </div>
                <div className={cn(T.micro, 'mt-1.5 whitespace-nowrap', (t.today || t.payday) && 'font-semibold text-slate')}>{t.today ? 'today' : t.payday ? 'payday' : weekdayShort(t.date)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 basis-[230px]">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2.5">
              <Badge tone="salmon" size="sm" className="w-16 justify-center">Tight.</Badge>
              <span className={cn(T.body, 'text-slate')}>if you buy it today</span>
            </div>
            <div className="flex items-baseline gap-2.5">
              <Badge tone="teal" size="sm" className="w-16 justify-center">Fine.</Badge>
              <span className={cn(T.body, 'text-slate')}>if it waits for {weekdayLong(payday)}</span>
            </div>
          </div>

          <button
            onClick={() => actions.remindLater(weekdayLong(payday))}
            className="mt-3.5 -mx-1.5 inline-flex min-h-6 w-fit items-center gap-1 rounded-ctl px-1.5 py-1 text-body font-semibold text-teal transition-colors hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 active:opacity-70"
          >
            Remind me {weekdayLong(payday)} <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => {
  const tiles = Array.from({ length: 5 }, (_, i) => { const date = new Date(ctx.now.getFullYear(), ctx.now.getMonth(), ctx.now.getDate() + i); return { date, today: i === 0, payday: i === ctx.runway.daysToPayday } })
  return { daysToPayday: ctx.runway.daysToPayday, tiles, paycheck: ctx.runway.paycheck, payday: ctx.runway.nextPayday }
}

export { meta, condition } from './meta'
export default PaydayProximity
