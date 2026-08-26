import { useState } from 'react'
import type { EngineContext, RankedCard } from '@/engine/types'
import { CardShell, Num, T, cn } from '../kit'
import { RankingRows } from '../_ranking'

interface Props { rows: RankedCard[]; title: string; visible: number }

/** #13 — the leaderboard: rank rail, mini art, reason, delta; the winner is tinted and its earn runs green. */
function CardRanking({ rows, title, visible }: Props) {
  const [all, setAll] = useState(false)
  const shown = all ? rows : rows.slice(0, visible)
  const hidden = rows.length - shown.length
  return (
    <CardShell className="flex h-full flex-col">
      {/* "you'd earn" labels the whole right-hand column, so no single figure needs its own caption. */}
      <div className="flex items-baseline justify-between gap-2">
        <h3 className={cn(T.title, 'min-w-0 text-ink')}>{title}</h3>
        <span className={cn(T.micro, 'shrink-0 whitespace-nowrap pr-2.5')}>you'd earn</span>
      </div>
      <RankingRows rows={shown} grow />
      {rows.length > visible ? (
        /* Standalone disclosure control: -mx-2 keeps the label optically flush with the
           rows above while the padding carries it past the 24px minimum target. */
        <button
          onClick={() => setAll(!all)}
          className="-mx-2 -mb-1 mt-2 w-fit cursor-pointer rounded-sm2 px-2 py-1.5 text-left text-body font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
          aria-expanded={all}
        >
          {all ? 'Show top cards only' : <><Num value={hidden} animated={false} /> more cards ›</>}
        </button>
      ) : null}
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ rows: ctx.ranking.ranked, title: ctx.q.size === 'large' ? 'Which card, when you book' : 'Which card', visible: 3 })

export { meta, condition } from './meta'
export default CardRanking
