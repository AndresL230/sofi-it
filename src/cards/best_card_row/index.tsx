import { useState } from 'react'
import type { EngineContext, RankedCard } from '@/engine/types'
import { CardShell, CardArt, Money, Rich, Caps, T, cn } from '../kit'
import { RankingRows } from '../_ranking'

interface Props { winner: RankedCard; rows: RankedCard[]; deltaVsFlat: number; flatShort: string }

/** #12 — mini card art (1.586:1), the card as the verdict, the gain against the flat card as the one figure. */
function BestCardRow({ winner, rows, deltaVsFlat, flatShort }: Props) {
  const [open, setOpen] = useState(false)
  const better = deltaVsFlat > 0
  return (
    <CardShell className="flex flex-col justify-center">
      <div className="flex items-center gap-3.5">
        {/* CardArt md is 76×48 = 1.583:1 — the real card proportion. Left unscaled here. */}
        <CardArt art={winner.card.art} label={winner.card.artLabel} last4={winner.card.last4} />
        <div className="min-w-0 flex-1">
          <Caps>Pay with</Caps>
          <h3 className={cn(T.title, 'mt-1 font-extrabold leading-snug text-navy')}>{winner.card.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
            {better ? (
              <>
                <span className="text-metric-sm font-extrabold tabular-nums leading-none text-green"><Money value={deltaVsFlat} size="inline" cents="decimal" signed animated={false} /></span>
                <span className={T.caption}>more than your {flatShort}</span>
              </>
            ) : (
              <span className={cn(T.caption, 'font-semibold')}>already the best of your cards</span>
            )}
          </div>
        </div>
      </div>

      <p className={cn(T.body, 'mt-3 text-slate')}><Rich text={winner.reason} animated={false} /></p>

      <button
        onClick={() => setOpen(!open)}
        /* Standalone disclosure control: padding gives it a >=24px target, the negative
           margins keep the label optically flush with the copy above. */
        className="-mx-2 -mb-1 mt-1.5 inline-flex w-fit cursor-pointer items-center gap-1 rounded-sm2 px-2 py-1.5 text-body font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
        aria-expanded={open}
      >
        {open ? 'Hide cards' : 'See all cards'}
        <span className={cn('transition-transform', open && 'rotate-90')} aria-hidden>›</span>
      </button>
      {open ? <RankingRows rows={rows} /> : null}
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ winner: ctx.ranking.winner, rows: ctx.ranking.ranked, deltaVsFlat: ctx.ranking.deltaVsFlat, flatShort: ctx.ranking.flat.card.name.replace('SoFi Unlimited', '').trim() })

export { meta, condition } from './meta'
export default BestCardRow
