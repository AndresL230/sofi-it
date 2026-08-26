import type { EngineContext } from '@/engine/types'
import { CardShell, Money, DateText, Caps, T, cn } from '../kit'

interface Props { rows: { label: string; value: number }[]; outOfPocket: number; movesTo: Date | null; sticker: number }

/** #17 — receipt math: sticker price, gold offsets, one rule, then the real number in hero numerals. */
function PointsOffset({ rows, outOfPocket, movesTo, sticker }: Props) {
  return (
    /* The receipt has a natural measure: past ~470px a label and its figure drift so far
       apart the row stops reading as one line, so the ledger is capped and the extra
       bento width becomes margin rather than leader space. */
    <CardShell className="flex flex-col justify-center">
      <h3 className={cn(T.title, 'mb-2.5 max-w-[470px] text-ink')}>Points &amp; credits can shrink this</h3>
      <div className="max-w-[470px] tabular-nums">
        <Line label="Sticker price" ink="text-ink">
          <Money value={sticker} size="inline" cents="never" animated={false} />
        </Line>
        {rows.map((r) => (
          <Line key={r.label} label={r.label} ink="text-gold-ink">
            <Money value={r.value} size="inline" cents="never" prefix="−" animated={false} />
          </Line>
        ))}
        <div className="mt-2 flex items-baseline justify-between gap-3 border-t-2 border-navy pt-2.5 text-navy">
          <Caps className="min-w-0 text-navy">Real out-of-pocket</Caps>
          <Money value={outOfPocket} size="lg" className="text-navy" />
        </div>
      </div>
      {movesTo ? <p className={cn(T.meta, 'mt-2.5 max-w-[470px]')}>…which moves “affordable in full” to ~<DateText date={movesTo} />.</p> : null}
    </CardShell>
  )
}

/** Ledger row: label left, figure right on the one shared alignment edge. */
function Line({ label, ink, children }: { label: string; ink: string; children: React.ReactNode }) {
  return (
    <div className={cn(T.body, 'flex items-baseline justify-between gap-3 py-1')}>
      <span className="min-w-0 text-slate">{label}</span>
      <span className={`shrink-0 font-bold ${ink}`}>{children}</span>
    </div>
  )
}

export const select = (ctx: EngineContext): Props => ({ rows: ctx.points.rows, outOfPocket: ctx.points.outOfPocket, sticker: ctx.points.amount, movesTo: ctx.affordability.shortfall > 0 ? ctx.affordability.affordableWithPoints : null })

export { meta, condition } from './meta'
export default PointsOffset
