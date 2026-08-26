import { useState } from 'react'
import type { EngineContext, RankedCard } from '@/engine/types'
import { CardShell, Num } from '../kit'
import { RankingRows } from '../_ranking'

interface Props { rows: RankedCard[]; title: string; visible: number }

/** #13 — the leaderboard: rank rail, mini art, reason, delta; winner glows; disqualifier badges replace the delta. */
function CardRanking({ rows, title, visible }: Props) {
  const [all, setAll] = useState(false)
  const shown = all ? rows : rows.slice(0, visible)
  const hidden = rows.length - shown.length
  return (
    <CardShell className="h-full">
      <div className="mb-1 text-[14px] font-bold">{title}</div>
      <RankingRows rows={shown} />
      {rows.length > visible ? (
        <button onClick={() => setAll(!all)} className="mt-3 cursor-pointer text-[13px] font-semibold text-teal hover:text-teal-ink" aria-expanded={all}>{all ? 'Show top cards only' : <><Num value={hidden} animated={false} /> more cards ›</>}</button>
      ) : null}
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ rows: ctx.ranking.ranked, title: ctx.q.size === 'large' ? 'Which card, when you book' : 'Which card', visible: 3 })

export { meta, condition } from './meta'
export default CardRanking
