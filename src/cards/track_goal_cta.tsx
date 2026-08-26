import { useState } from 'react'
import type { EngineContext, Goal } from '@/engine/types'
import { defineCard, type CardActions } from './kit'

interface Props { goal: Goal; label: string }

/** #31 — full-width purple button with a vault illustration; tap → coin drop (300ms) → toast → auto-return home. */
function TrackGoalCta({ goal, label, actions }: Props & { actions: CardActions }) {
  const [coin, setCoin] = useState(false)
  return (
    <button onClick={() => { setCoin(true); setTimeout(() => { setCoin(false); actions.trackGoal(goal) }, 450) }} className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-ctl bg-purple px-[26px] py-[15px] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--purple-hover)]">
      <span className="relative h-[26px] w-[26px] shrink-0" aria-hidden>
        <span className="absolute inset-0 rounded-[6px] border-2 border-white/55" />
        <span className="absolute left-[7px] top-[7px] h-2 w-2 rounded-full border-2 border-white/55" />
        {coin ? <span className="absolute -top-[2px] left-2 h-[10px] w-[10px] rounded-full bg-gold" style={{ animation: 'coinDrop .4s both' }} /> : null}
      </span>
      {label}
    </button>
  )
}

export const condition = (ctx: EngineContext) => !ctx.goal && ctx.q.category === 'travel' && ctx.q.size === 'large'
export const select = (ctx: EngineContext): Props => ({ goal: ctx.suggestedGoal, label: `Track ${ctx.suggestedGoal.name.split(' ')[0]} as a goal` })

export default defineCard<Props>({ type: 'track_goal_cta', section: 'Goals', label: '', condition, select, Component: TrackGoalCta, span: 'full', samples: [{ query: '$1,200 flight to Lisbon in March' }] })
