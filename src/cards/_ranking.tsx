import type { RankedCard } from '@/engine/types'
import { CardArt, Money, Rich, DateText, T, cn } from './kit'

/**
 * Leaderboard rows shared by best_card_row's expander and card_ranking.
 * Row grid: rank rail · card art · (name + reason), with the earn amount sitting on the
 * name's first baseline. Amounts and deltas share one right-hand edge down the list.
 */
export function RankingRows({ rows, grow }: { rows: RankedCard[]; grow?: boolean }) {
  return (
    /* `grow` is for the standalone leaderboard: when the bento row stretches the card, the
       rows take the extra height (capped) and centre their content, instead of leaving a
       void under the list. Without it rows stay at their natural height. */
    <div className={cn('mt-2 flex flex-col gap-2', grow && 'min-h-0 flex-1')}>
      {rows.map((r, i) => (
        <div
          key={r.card.id}
          className={cn(
            'flex flex-col justify-center rounded-ctl px-2.5 py-2.5',
            grow && 'max-h-[144px] flex-1',
            r.winner ? 'bg-teal-tint' : 'bg-lavender-soft',
            r.disqualified && 'opacity-70',
          )}
        >
          <div className="flex items-start gap-2.5">
            <div className={cn(T.meta, 'w-3 shrink-0 pt-1 text-center font-extrabold tabular-nums leading-none', r.winner ? 'text-teal-ink' : 'text-slate-muted')}>{i + 1}</div>
            <ArtThumb card={r.card} />
            <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2">
              <h4 className={cn(T.lede, 'min-w-0 font-bold leading-snug text-ink')}>{r.card.name.replace('Chase ', '')}</h4>
              <div className="text-right text-metric-sm font-extrabold tabular-nums leading-none" style={{ color: r.winner ? 'var(--green)' : 'var(--ink)' }}>
                {r.disqualified ? <span className="text-slate-muted">—</span> : <Money value={r.back} size="inline" cents="decimal" animated={false} />}
              </div>
              <div className="mt-1 min-w-0 space-y-1">
                <p className={cn(T.caption, 'leading-snug')}><Rich text={r.reason} animated={false} /></p>
                <RankNote badge={r.badge} />
              </div>
              <div className={cn(T.micro, 'mt-1 whitespace-nowrap text-right')}>{r.deltaLabel.length ? <Rich text={r.deltaLabel} animated={false} /> : null}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Real cards are 1.586:1. CardArt's own `sm` box (58×37) is squarer than that and its
 * label collides with the last-4 at that width, so rows scale the correct-ratio `md`
 * box (76×48 = 1.583:1) down to 61×38 instead of re-proportioning it.
 */
function ArtThumb({ card }: { card: RankedCard['card'] }) {
  return (
    <div className="h-[39px] w-[61px] shrink-0">
      <div className="origin-top-left scale-[.8]">
        <CardArt art={card.art} label={card.artLabel} last4={card.last4} size="md" />
      </div>
    </div>
  )
}

/**
 * Caveats read as annotated notes, not pills: a wrapped pill in a 340px column looks
 * broken. A filled dot carries the colour (gold = a cap on the reward, salmon = a
 * utilization warning) and the words repeat it, so neither depends on hue alone.
 */
export function RankNote({ badge }: { badge?: RankedCard['badge'] }) {
  if (!badge) return null
  if (badge.kind === 'cap')
    return (
      <Note dot="var(--gold-deep)" ink="var(--gold-ink)">
        <Money value={badge.left} size="inline" cents="never" animated={false} /> of <Money value={badge.cap} size="inline" cents="never" animated={false} /> left at {badge.rate}%
      </Note>
    )
  if (badge.kind === 'utilization')
    return (
      <Note dot="var(--salmon)" ink="var(--salmon-ink)">
        Would hit {badge.pct}% — pay by <DateText date={badge.payBy} fmt="ordinal" animated={false} />
      </Note>
    )
  return <Note dot="var(--lavender-deep)" ink="var(--slate-muted)">no bonus category</Note>
}

function Note({ dot, ink, children }: { dot: string; ink: string; children: React.ReactNode }) {
  return (
    <div className={cn(T.caption, 'flex items-start gap-1.5 font-semibold leading-snug')} style={{ color: ink }}>
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} aria-hidden />
      <span className="min-w-0">{children}</span>
    </div>
  )
}
