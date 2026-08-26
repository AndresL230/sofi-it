import type { EngineContext } from '@/engine/types'
import { CardShell, Money, Num, Badge, useDelay, type CardActions } from '../kit'
import { weekdayShort, weekdayLong } from '@/engine/format'

interface Props { daysToPayday: number; tiles: { date: Date; today: boolean; payday: boolean }[]; paycheck: number; payday: Date }

/** #11 — five-tile calendar strip; today navy, payday teal with a floating +paycheck tag; a dot travels ~70% of the way. */
function PaydayProximity({ daysToPayday, tiles, paycheck, payday, actions }: Props & { actions: CardActions }) {
  const d = useDelay()
  const payIdx = tiles.findIndex((t) => t.payday)
  const from = 8, to = 8 + ((payIdx <= 0 ? 4 : payIdx) / (tiles.length - 1)) * 84 * 0.7
  return (
    <CardShell>
      <div className="text-[15px] font-semibold text-navy">⚡ <Num value={daysToPayday} /> days to payday</div>
      <div className="relative mx-1 mb-[10px] mt-[26px]">
        <div className="absolute left-[8%] right-[8%] top-[21px] h-[2px] bg-lavender" />
        <div className="absolute top-[17px] h-2 w-2 rounded-full bg-teal" style={{ ['--dot-from' as string]: `${from}%`, ['--dot-to' as string]: `${to}%`, animation: `dotTravelVar .7s ${d(300)} both` }} />
        <div className="relative flex justify-between">
          {tiles.map((t) => (
            <div key={t.date.toISOString()} className="relative text-center">
              {t.payday ? <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10.5px] font-bold text-green"><Money value={paycheck} size="inline" cents="never" signed animated={false} /><div className="mx-auto mt-[1px] h-[6px] w-px bg-green" /></div> : null}
              <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border-[1.5px] text-[15px] font-bold" style={{ background: t.today ? 'var(--navy)' : t.payday ? 'var(--teal)' : '#fff', color: t.today || t.payday ? '#fff' : 'var(--navy)', borderColor: t.today ? 'var(--navy)' : t.payday ? 'var(--teal)' : 'var(--lavender)' }}>{t.payday ? '$' : t.date.getDate()}</div>
              <div className="mt-1 text-[10px] text-slate-muted">{weekdayShort(t.date)}{t.today ? ' · today' : t.payday ? ' · payday' : ''}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-[10px]">
        <Badge tone="salmon" size="md">buy today → tight</Badge>
        <span className="text-slate-muted">→</span>
        <Badge tone="teal" size="md">buy {weekdayLong(payday)} → fine</Badge>
        <button onClick={() => actions.remindLater(weekdayLong(payday))} className="ml-auto cursor-pointer text-[13px] font-semibold text-teal hover:text-teal-ink">Remind me {weekdayLong(payday)}</button>
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
