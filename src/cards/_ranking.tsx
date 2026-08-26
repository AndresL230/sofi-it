import type { RankedCard } from '@/engine/types'
import { CardArt, Money, Rich, Badge, DateText, cn } from './kit'

/** Leaderboard rows shared by best_card_row's expander and card_ranking. */
export function RankingRows({ rows, compact }: { rows: RankedCard[]; compact?: boolean }) {
  return (
    <>
      {rows.map((r, i) => (
        <div key={r.card.id} className={cn('mt-2 flex items-center gap-3 rounded-ctl px-[14px] py-3', r.winner ? 'bg-white shadow-winner' : 'bg-[#FAFAF9]', r.disqualified && 'opacity-60')}>
          <div className="w-6 shrink-0 text-center text-[26px] font-extrabold leading-none" style={{ color: r.winner ? 'var(--teal)' : 'var(--lavender-deep)' }}>{i + 1}</div>
          <CardArt art={r.card.art} label={r.card.artLabel} last4={r.card.last4} size={compact ? 'sm' : 'md'} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><span className="text-[14px] font-bold">{r.card.name.replace('Chase ', '')}</span><RankBadge badge={r.badge} /></div>
            <div className="mt-[2px] text-[12.5px] text-slate"><Rich text={r.reason} animated={false} /></div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[15px] font-extrabold" style={{ color: r.winner ? 'var(--green)' : 'var(--ink)' }}>{r.disqualified ? '—' : <Money value={r.back} size="inline" cents="decimal" animated={false} />}</div>
            {r.deltaLabel.length ? <div className="text-[11px] text-slate-muted"><Rich text={r.deltaLabel} animated={false} /></div> : null}
          </div>
        </div>
      ))}
    </>
  )
}

/** Badges sit in a narrow column beside the $ figures — they wrap within it rather than overflow it (380px). */
const WRAP = 'max-w-full flex-wrap whitespace-normal text-left leading-tight'

export function RankBadge({ badge }: { badge?: RankedCard['badge'] }) {
  if (!badge) return null
  if (badge.kind === 'cap') return <Badge tone="gold" size="xs" className={WRAP}><Money value={badge.left} size="inline" cents="never" animated={false} />&nbsp;of&nbsp;<Money value={badge.cap} size="inline" cents="never" animated={false} />&nbsp;left at {badge.rate}%</Badge>
  if (badge.kind === 'utilization') return <Badge tone="salmon" size="xs" className={cn(WRAP, 'min-w-[96px]')}>Would hit {badge.pct}% — pay by&nbsp;<DateText date={badge.payBy} fmt="ordinal" animated={false} /></Badge>
  return <Badge tone="gray" size="xs" className={WRAP}>no bonus category</Badge>
}
