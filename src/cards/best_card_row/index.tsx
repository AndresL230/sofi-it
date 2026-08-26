import { useState } from 'react'
import type { EngineContext, RankedCard } from '@/engine/types'
import { CardShell, CardArt, Money, Rich } from '../kit'
import { RankingRows } from '../_ranking'

interface Props { winner: RankedCard; rows: RankedCard[]; deltaVsFlat: number; flatShort: string }

/** #12 — mini card art, earn line, green delta pill, chevron expanding to the full ranking. */
function BestCardRow({ winner, rows, deltaVsFlat, flatShort }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <CardShell>
      <div className="flex flex-wrap items-center gap-[14px]">
        <CardArt art={winner.card.art} label={winner.card.artLabel} last4={winner.card.last4} />
        <div className="min-w-[180px] flex-1 text-[14px]"><b>{winner.card.name}</b> — <Rich text={winner.reason} animated={false} /></div>
        <span className="shrink-0 rounded-pill bg-green-tint px-[11px] py-1 text-[12px] font-bold text-green">{deltaVsFlat > 0 ? <><Money value={deltaVsFlat} size="inline" cents="decimal" signed animated={false} /> vs your {flatShort}</> : 'best available'}</span>
      </div>
      <button onClick={() => setOpen(!open)} className="mt-[10px] inline-flex cursor-pointer items-center gap-1 text-[13.5px] font-semibold text-teal hover:text-teal-ink" aria-expanded={open}>{open ? 'Hide cards' : 'See all cards'} <span className={open ? 'rotate-90 transition-transform' : 'transition-transform'}>›</span></button>
      {open ? <RankingRows rows={rows} /> : null}
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ winner: ctx.ranking.winner, rows: ctx.ranking.ranked, deltaVsFlat: ctx.ranking.deltaVsFlat, flatShort: ctx.ranking.flat.card.name.replace('SoFi Unlimited', '').trim() })

export { meta, condition } from './meta'
export default BestCardRow
