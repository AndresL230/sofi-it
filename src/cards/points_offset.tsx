import type { EngineContext } from '@/engine/types'
import { defineCard, CardShell, Money, DateText } from './kit'

interface Props { rows: { label: string; value: number }[]; outOfPocket: number; movesTo: Date | null }

/** #17 — receipt math: right-aligned ledger rows in tabular numerals, a rule, then real out-of-pocket in hero numerals. */
function PointsOffset({ rows, outOfPocket, movesTo }: Props) {
  return (
    <CardShell className="border-t-[3px] border-gold px-[22px]">
      <div className="mb-2 text-[14px] font-bold">Points &amp; credits can shrink this</div>
      <div className="tabular-nums">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between py-1 text-[13px] text-slate"><span>{r.label}</span><span className="font-semibold"><Money value={r.value} size="inline" cents="never" prefix="−" animated={false} /></span></div>
        ))}
        <div className="my-2 border-t border-ink" />
        <div className="flex items-baseline justify-between"><span className="text-[13px] font-bold">real out-of-pocket</span><Money value={outOfPocket} size="md" /></div>
      </div>
      {movesTo ? <div className="mt-[6px] text-[12px] text-slate">…which moves "affordable in full" to ~<DateText date={movesTo} />.</div> : null}
    </CardShell>
  )
}

export const condition = (ctx: EngineContext) => ctx.q.size === 'large' && ctx.points.rows.length > 0
export const select = (ctx: EngineContext): Props => ({ rows: ctx.points.rows, outOfPocket: ctx.points.outOfPocket, movesTo: ctx.affordability.shortfall > 0 ? ctx.affordability.affordableWithPoints : null })

export default defineCard<Props>({ type: 'points_offset', section: 'Cards & rewards', label: '', condition, select, Component: PointsOffset, samples: [{ query: '$1,200 flight to Lisbon in March' }] })
