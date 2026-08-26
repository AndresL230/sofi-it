import type { EngineContext, RichText } from '@/engine/types'
import { DateText, Rich, useDelay } from '../kit'
import { daysBetween } from '@/engine/format'

interface Props { goalName: string; emoji: string; before: Date; after: Date; paceFix: RichText }

/** #29 — compact purple chip: the goal's landing date before → after, with the slip labelled in days; the pace fix beneath. */
function GoalImpactChip({ goalName, emoji, before, after, paceFix }: Props) {
  const d = useDelay()
  const days = Math.max(0, daysBetween(before, after))
  return (
    <div>
      <div className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-pill bg-purple py-1.5 pl-3.5 pr-1.5 text-body font-semibold text-white">
        <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="inline-block" style={{ animation: `nudgeR .8s ${d(500)} 2` }}>{emoji}</span>
          <span>{goalName} lands</span>
          <DateText date={before} animated={false} className="text-white/55" />
          <span className="text-white/55" aria-hidden>→</span>
          <DateText date={after} />
        </span>
        <span className="rounded-pill bg-white/15 px-2 py-0.5 text-caption font-bold tabular-nums">{days} {days === 1 ? 'day' : 'days'} later</span>
      </div>
      <div className="ml-1 mt-1.5 flex gap-1 text-meta font-semibold text-purple">
        <span aria-hidden>↳</span><span><Rich text={paceFix} /></span>
      </div>
    </div>
  )
}

export const select = (ctx: EngineContext): Props => ({ goalName: ctx.goalImpact!.goal.name.split(' ')[0], emoji: ctx.goalImpact!.goal.emoji ?? '✦', before: ctx.goalImpact!.landsBefore, after: ctx.goalImpact!.landsAfter, paceFix: ctx.goalImpact!.paceFix })

export { meta, condition } from './meta'
export default GoalImpactChip
