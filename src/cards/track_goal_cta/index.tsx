import { useState } from 'react'
import type { EngineContext, Goal } from '@/engine/types'
import { Button, CardShell, DateText, Money, T, cn, type CardActions } from '../kit'

interface Props { goal: Goal; label: string; /** Gallery/preview only — the card owns this after a tap. */ tracked?: boolean }

/** Vault: a safe with a dial and a handle, plus the coin that drops in on tap. */
function Vault({ coin, done }: { coin: boolean; done: boolean }) {
  return (
    <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-sm2 bg-purple-tint" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="var(--purple)" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2.6" y="4.6" width="18.8" height="15.8" rx="3" />
        <circle cx="10.2" cy="12.5" r="3.4" />
        <path d="M10.2 12.5V9.9" />
        <path d="M17 10.4v4.2" />
      </svg>
      {coin ? <span className="absolute left-3 top-1 h-2.5 w-2.5 rounded-full bg-gold" style={{ animation: 'coinDrop .4s both' }} /> : null}
      {done ? <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-purple text-micro font-bold leading-none text-white">✓</span> : null}
    </span>
  )
}

/** #31 — the goals opt-in: a quiet white card whose primary action is a purple button, with an inline-text out and a done state that says "Tracked" in words. */
function TrackGoalCta({ goal, label, tracked = false, actions }: Props & { actions: CardActions }) {
  const [state, setState] = useState<'idle' | 'coin' | 'tracked' | 'skipped'>(tracked ? 'tracked' : 'idle')
  const done = state === 'tracked'
  return (
    <CardShell className="flex h-full flex-col justify-center">
      {/* Wide spans read as a banner — copy left, action right; narrow ones wrap the action under the copy. */}
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3.5">
        <div className="flex min-w-0 flex-[1_1_300px] items-start gap-3.5">
          <Vault coin={state === 'coin'} done={done} />
          <div className="min-w-0 flex-1">
            <div className={cn(T.title, 'text-navy')}>{done ? `${goal.name} — tracked` : label}</div>
            <div className="mt-1 max-w-[54ch] text-body text-slate">
              <Money value={goal.target} size="inline" cents="never" animated={false} /> by <DateText date={goal.deadline} animated={false} /> — <Money value={goal.weekly} size="inline" cents="never" animated={false} />/wk keeps it on pace.
            </div>
          </div>
        </div>

        {done ? (
          <div className="max-w-[38ch] rounded-sm2 bg-purple-tint px-3 py-2 text-body text-purple">
            <span className="font-bold">Tracked.</span> Small buys now check against {goal.name.split(' ')[0]} first.
          </div>
        ) : state === 'skipped' ? (
          <div className="flex items-center gap-3 text-body text-slate">
            <span>Not tracking it.</span>
            <button onClick={() => setState('idle')} className="cursor-pointer rounded-sm2 font-semibold text-teal underline-offset-2 hover:text-teal-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50">Undo</button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Button
              variant="purple"
              size="sm"
              className="active:translate-y-px"
              onClick={() => { setState('coin'); setTimeout(() => { setState('tracked'); actions.trackGoal(goal) }, 450) }}
            >
              Track it
            </Button>
            <button
              onClick={() => setState('skipped')}
              className="cursor-pointer rounded-sm2 px-1 py-1 text-body font-semibold text-slate underline-offset-2 transition-colors hover:text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 active:translate-y-px"
            >
              Not now
            </button>
          </div>
        )}
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ goal: ctx.suggestedGoal, label: `Track ${ctx.suggestedGoal.name.split(' ')[0]} as a goal` })

export { meta, condition } from './meta'
export default TrackGoalCta
