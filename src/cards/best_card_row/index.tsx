import { useState } from 'react'
import type { CardMateriality, EngineContext, RankedCard } from '@/engine/types'
import { CardShell, CardArt, Money, Rich, Caps, T, cn } from '../kit'
import { RankingRows } from '../_ranking'

interface Props { winner: RankedCard; rows: RankedCard[]; matters: CardMateriality }

/**
 * #12 — mini card art (1.586:1), the card as the verdict, and one figure for why it is worth
 * switching to. The figure follows the reason the engine had for showing this row at all: money
 * gained, interest avoided, coverage added, or a credit that would otherwise expire.
 */
function BestCardRow({ winner, rows, matters }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <CardShell className="flex flex-col justify-center">
      {/* Wide spans recompose sideways — identity left, the why and the expander right — rather than
          leaving the right half of a 980px card empty. Below ~600px the two blocks wrap back. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex min-w-0 flex-1 basis-[248px] items-center gap-3.5">
        {/* CardArt md is 76×48 = 1.583:1 — the real card proportion. Left unscaled here. */}
        <CardArt art={winner.card.art} label={winner.card.artLabel} last4={winner.card.last4} />
        <div className="min-w-0 flex-1">
          <Caps>Pay with</Caps>
          <h3 className={cn(T.title, 'mt-1 font-extrabold leading-snug text-navy')}>{winner.card.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
            {matters.reason === 'protection' ? (
              <span className={cn(T.caption, 'font-semibold text-teal-ink')}>trip cover your {matters.versus} does not carry</span>
            ) : (
              <>
                <span className="text-metric-sm font-extrabold tabular-nums leading-none text-green">
                  <Money value={matters.amount} size="inline" cents="decimal" signed={matters.reason !== 'credit'} animated={false} />
                </span>
                <span className={T.caption}>
                  {matters.reason === 'gain' ? <>more than your {matters.versus}</> : null}
                  {matters.reason === 'interest' ? <>cheaper than your {matters.versus}, after interest</> : null}
                  {matters.reason === 'credit' ? <>of credit this uses up before it expires</> : null}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1 basis-[240px]">
        <p className={cn(T.body, 'text-slate')}><Rich text={winner.reason} animated={false} /></p>
        <button
          onClick={() => setOpen(!open)}
          /* Standalone disclosure control: padding gives it a >=24px target, the negative
             margins keep the label optically flush with the copy above. */
          className="-mx-2 -mb-1 mt-1 inline-flex w-fit cursor-pointer items-center gap-1 rounded-sm2 px-2 py-1.5 text-body font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
          aria-expanded={open}
        >
          {open ? 'Hide cards' : 'See all cards'}
          <span className={cn('transition-transform', open && 'rotate-90')} aria-hidden>›</span>
        </button>
      </div>
      </div>
      {open ? <RankingRows rows={rows} /> : null}
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ winner: ctx.ranking.winner, rows: ctx.ranking.ranked, matters: ctx.ranking.matters! })

export { meta, condition } from './meta'
export default BestCardRow
