import { useMemo, useState } from 'react'
import type { EngineContext } from '@/engine/types'
import { defineCard, CardShell, DateText, Slider, Money } from './kit'
import { daysBetween, addDays } from '@/engine/format'

interface Props { goalName: string; emoji: string; thing: string; amount: number; today: Date; goalProtected: Date; goalPushed: Date; purchaseWaits: Date; balancedT: number; paydays: Date[]; at: (t: number) => { goalDate: Date; purchaseDate: Date } }

/** #30 — interactive showpiece: two stacked mini-timelines on one x-axis + a tradeoff slider; dragging redistributes both dates live. */
function GoalCollision({ goalName, emoji, thing, today, goalProtected, goalPushed, purchaseWaits, balancedT, paydays, at }: Props) {
  const [t, setT] = useState(Math.round(balancedT * 100))
  const { goalDate, purchaseDate } = at(t / 100)
  const horizon = Math.max(14, daysBetween(today, goalPushed), daysBetween(today, purchaseWaits), daysBetween(today, goalProtected))
  const pct = (d: Date) => Math.min(100, Math.max(0, (daysBetween(today, d) / horizon) * 100))
  const balanced = useMemo(() => at(balancedT), [at, balancedT])
  const ticks = useMemo(() => paydays.filter((p) => daysBetween(today, p) <= horizon), [paydays, today, horizon])
  const Track = ({ color, to, label }: { color: string; to: Date; label: React.ReactNode }) => (
    <div className="relative h-2 rounded-pill bg-lavender-soft">
      {ticks.map((p) => <div key={p.toISOString()} className="absolute -top-[2px] h-3 w-px bg-lavender-deep" style={{ left: `${pct(p)}%` }} />)}
      <div className="absolute inset-y-0 left-0 rounded-pill transition-[width] duration-150" style={{ width: `${pct(to)}%`, background: color }} />
      <div className="absolute -top-[22px] whitespace-nowrap text-[10.5px] font-bold transition-[left] duration-150" style={{ left: `${pct(to)}%`, transform: `translateX(-${Math.min(100, Math.max(0, pct(to)))}%)`, color }}>{label}</div>
    </div>
  )
  return (
    <CardShell>
      <div className="text-[14px] font-bold">{goalName} vs. {thing}</div>
      <div className="mt-7 flex flex-col gap-8">
        <Track color="var(--purple)" to={goalDate} label={<>{emoji} {goalName} <DateText date={goalDate} /></>} />
        <Track color="var(--navy)" to={purchaseDate} label={<>buy {daysBetween(today, purchaseDate) <= 0 ? 'today' : <DateText date={purchaseDate} />}</>} />
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-slate-muted"><span>today</span><span><DateText date={addDays(today, horizon)} animated={false} /></span></div>
      <Slider className="mt-[18px]" min={0} max={100} step={1} value={[t]} onValueChange={([v]) => setT(v)} aria-label="Tradeoff between protecting the goal and buying now" rangeClassName="bg-purple" thumbClassName="border-purple" />
      <div className="flex justify-between text-[10.5px] text-slate-muted"><span>protect {goalName}</span><span>move now</span></div>
      <div className="mt-[10px] text-[12.5px] text-slate">Both fit if {goalName} moves to <DateText date={balanced.goalDate} animated={false} /> — or this waits until <DateText date={purchaseWaits} animated={false} />.</div>
    </CardShell>
  )
}

export const condition = (ctx: EngineContext) => ctx.collision !== null
export const select = (ctx: EngineContext): Props => ({ goalName: ctx.collision!.goal.name.split(' ')[0], emoji: ctx.collision!.goal.emoji ?? '✦', thing: ctx.q.category === 'housing_moving' ? 'the move' : ctx.q.category === 'travel' ? 'the flight' : 'this purchase', amount: ctx.q.amount, today: ctx.now, goalProtected: ctx.collision!.goalProtected, goalPushed: ctx.collision!.goalPushed, purchaseWaits: ctx.collision!.purchaseWaits, balancedT: ctx.collision!.balancedT, paydays: ctx.affordability.paydays, at: ctx.collision!.at })

export default defineCard<Props>({ type: 'goal_collision', section: 'Goals', label: 'interactive', condition, select, Component: GoalCollision, samples: [{ query: '$2,800 to move apartments', goal: true }] })
void Money
