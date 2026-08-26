import { useMemo, useState } from 'react'
import type { EngineContext } from '@/engine/types'
import { CardShell, DateText, Money, Slider, T, cn } from '../kit'
import { daysBetween, addDays, cap } from '@/engine/format'

interface Props { goalName: string; emoji: string; thing: string; amount: number; today: Date; goalProtected: Date; goalPushed: Date; purchaseWaits: Date; balancedT: number; paydays: Date[]; at: (t: number) => { goalDate: Date; purchaseDate: Date } }

/** Days → the coarsest honest unit ("9 days", "4 weeks"). */
const span = (d: number) => (d < 14 ? `${d} day${d === 1 ? '' : 's'}` : `${Math.round(d / 7)} weeks`)

/**
 * The timeline recomposes with width: under ~475px of card the label sits above its bar; wider than that
 * it wraps up into a gutter beside the bar, so a bento span spends its extra width on layout and the rails
 * stay short enough to read as a timeline. The axis row reuses the same three classes to stay aligned.
 */
const GUTTER = 'flex h-4 min-w-0 flex-[1_1_170px] items-center gap-2'
const RAIL = 'min-w-0 flex-[2_1_250px]'
const ROW = 'flex flex-wrap items-start gap-x-4'

/**
 * One lane of the shared timeline: a static label, the bar with its marker, the date below.
 * `solid` is where the lane sits with no tradeoff; the translucent tail is the slip the slider adds.
 */
function Lane({ color, label, note, date, solidPct, markPct }: { color: string; label: React.ReactNode; note?: React.ReactNode; date: React.ReactNode; solidPct: number; markPct: number }) {
  const dot = Math.min(97, Math.max(3, markPct))
  return (
    <div className={ROW}>
      <div className={cn(GUTTER, 'justify-between text-caption font-bold')} style={{ color }}>
        <span className="truncate">{label}</span>
        {note ? <span className="shrink-0 font-semibold opacity-80">{note}</span> : null}
      </div>
      <div className={RAIL}>
        <div className="flex h-4 items-center">
          <div className="relative h-1.5 w-full rounded-pill bg-lavender-soft">
            <div className="absolute inset-y-0 left-0 rounded-pill transition-[width] duration-150" style={{ width: `${Math.min(solidPct, markPct)}%`, background: color }} />
            {markPct > solidPct ? <div className="absolute inset-y-0 rounded-pill transition-[left,width] duration-150" style={{ left: `${solidPct}%`, width: `${markPct - solidPct}%`, background: color, opacity: 0.28 }} /> : null}
            <div className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-pill ring-2 ring-white transition-[left] duration-150" style={{ left: `${dot}%`, background: color }} />
          </div>
        </div>
        <div className="relative h-4">
          <div className="absolute whitespace-nowrap text-caption font-bold transition-[left] duration-150" style={{ left: `${markPct}%`, transform: `translateX(-${markPct}%)`, color }}>{date}</div>
        </div>
      </div>
    </div>
  )
}

/** #30 — interactive showpiece: the tradeoff sentence up top, two mini-timelines on one x-axis as the evidence, a slider that redistributes both dates live. */
function GoalCollision({ goalName, emoji, thing, amount, today, goalProtected, goalPushed, purchaseWaits, balancedT, paydays, at }: Props) {
  const [t, setT] = useState(Math.round(balancedT * 100))
  const { goalDate, purchaseDate } = at(t / 100)
  const horizon = Math.max(14, daysBetween(today, goalPushed), daysBetween(today, purchaseWaits), daysBetween(today, goalProtected))
  const pct = (d: Date) => Math.min(100, Math.max(0, (daysBetween(today, d) / horizon) * 100))
  /** Payday ticks, thinned so a long horizon never packs them into a hatch of specks. */
  const ticks = useMemo(() => {
    const all = paydays.filter((p) => daysBetween(today, p) > 0 && daysBetween(today, p) <= horizon).map((p) => (daysBetween(today, p) / horizon) * 100)
    return all.reduce<number[]>((keep, x) => (keep.length === 0 || x - keep[keep.length - 1] >= 4 ? [...keep, x] : keep), [])
  }, [paydays, today, horizon])
  const slip = Math.max(0, daysBetween(goalProtected, goalDate))
  const wait = Math.max(0, daysBetween(today, purchaseDate))

  return (
    <CardShell className="flex h-full flex-col justify-between">
      <p className={cn(T.title, 'max-w-[46ch] text-navy')}>
        {wait <= 0 ? 'Buying now' : `Waiting ${span(wait)}`}
        {slip <= 0 ? <> keeps {goalName} on pace.</> : <> {wait > 0 ? 'still ' : ''}pushes {goalName} out <span className="whitespace-nowrap text-purple">{span(slip)}</span>.</>}
      </p>

      {/* The timeline has a natural maximum — past it the card keeps its rails legible instead of inflating them. */}
      <div className="mt-4.5 max-w-[720px]">
        <div className="flex flex-col gap-3.5">
          <Lane
            color="var(--purple)"
            label={<>{emoji} {goalName} lands</>}
            note={slip > 0 ? `${span(slip)} late` : 'on pace'}
            date={<DateText date={goalDate} />}
            solidPct={pct(goalProtected)}
            markPct={pct(goalDate)}
          />
          <Lane
            color="var(--navy)"
            label={<>{cap(thing)} · <Money value={amount} size="inline" cents="never" animated={false} /></>}
            note={wait > 0 ? `in ${span(wait)}` : undefined}
            date={wait <= 0 ? <>today</> : <DateText date={purchaseDate} />}
            solidPct={pct(purchaseDate)}
            markPct={pct(purchaseDate)}
          />
        </div>

        {/* Shared x-axis — same two-column split as a lane, so the ruler stays under the rails at every width. */}
        <div className={cn(ROW, 'mt-2.5')}>
          <div className={cn(GUTTER, 'h-0')} aria-hidden />
          <div className={RAIL}>
            <div className="relative h-2.5 border-t border-lavender">
              <span className="absolute left-0 top-0 h-2.5 w-0.5 bg-slate" />
              {ticks.map((x, i) => <span key={i} className="absolute top-0 h-1.5 w-px bg-lavender-deep" style={{ left: `${x}%` }} />)}
            </div>
            <div className="mt-1 flex items-center justify-between gap-2 text-micro">
              <span className="font-semibold text-slate">today</span>
              {ticks.length > 1 ? <span className="flex items-center gap-1"><span className="inline-block h-2 w-px bg-lavender-deep" />paydays</span> : null}
              <span><DateText date={addDays(today, horizon)} animated={false} /></span>
            </div>
          </div>
        </div>

        {/* The slider is a control, not a date axis — it keeps the group's full width so it never reads as a third lane. */}
        <Slider className="mt-4" min={0} max={100} step={1} value={[t]} onValueChange={([v]) => setT(v)} aria-label={`Tradeoff between protecting ${goalName} and buying now`} rangeClassName="bg-purple" thumbClassName="border-purple" />
        <div className="flex justify-between gap-2 text-caption text-slate-muted"><span className="truncate">protect {goalName}</span><span className="shrink-0">get it now</span></div>
      </div>

      <div className="pt-3.5">
        <p className="max-w-[72ch] border-t border-lavender-soft pt-3 text-body text-slate">
          <span className="font-bold text-navy">The clean path:</span> wait until <DateText date={purchaseWaits} animated={false} className="font-semibold text-slate" /> and {thing} is covered — {goalName} never moves off <DateText date={goalProtected} animated={false} className="font-semibold text-slate" />.
        </p>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ goalName: ctx.collision!.goal.name.split(' ')[0], emoji: ctx.collision!.goal.emoji ?? '✦', thing: ctx.q.category === 'housing_moving' ? 'the move' : ctx.q.category === 'travel' ? 'the flight' : 'this purchase', amount: ctx.q.amount, today: ctx.now, goalProtected: ctx.collision!.goalProtected, goalPushed: ctx.collision!.goalPushed, purchaseWaits: ctx.collision!.purchaseWaits, balancedT: ctx.collision!.balancedT, paydays: ctx.affordability.paydays, at: ctx.collision!.at })

export { meta, condition } from './meta'
export default GoalCollision
