import type { EngineContext, RankedCard } from '@/engine/types'
import { CardShell } from '../kit'
import { RankingRows } from '../_ranking'

interface Props { rows: RankedCard[]; title: string }

/** #13 — the leaderboard: rank rail, mini art, reason, delta; winner glows; disqualifier badges replace the delta. */
function CardRanking({ rows, title }: Props) {
  return (
    <CardShell>
      <div className="mb-1 text-[14px] font-bold">{title}</div>
      <RankingRows rows={rows} />
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ rows: ctx.ranking.ranked, title: ctx.q.size === 'large' ? 'Which card, when you book' : 'Which card' })

export { meta, condition } from './meta'
export default CardRanking
