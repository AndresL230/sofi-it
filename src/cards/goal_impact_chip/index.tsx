import type { EngineContext, RichText } from '@/engine/types'
import { DateText, Rich, useDelay } from '../kit'

interface Props { goalName: string; emoji: string; before: Date; after: Date; paceFix: RichText }

/** #29 — purple pill with a plane that nudges right as the date crossfades; the pace fix beneath. */
function GoalImpactChip({ goalName, emoji, before, after, paceFix }: Props) {
  const d = useDelay()
  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-pill bg-purple px-4 py-2 text-[13px] font-semibold text-white">
        <span className="inline-block" style={{ animation: `nudgeR .8s ${d(500)} 2` }}>{emoji}</span> {goalName} lands <DateText date={before} animated={false} /> → <DateText date={after} />
      </span>
      <div className="ml-[6px] mt-[6px] text-[11px] font-medium text-purple"><Rich text={paceFix} /></div>
    </div>
  )
}

export const select = (ctx: EngineContext): Props => ({ goalName: ctx.goalImpact!.goal.name.split(' ')[0], emoji: ctx.goalImpact!.goal.emoji ?? '✦', before: ctx.goalImpact!.landsBefore, after: ctx.goalImpact!.landsAfter, paceFix: ctx.goalImpact!.paceFix })

export { meta, condition } from './meta'
export default GoalImpactChip
