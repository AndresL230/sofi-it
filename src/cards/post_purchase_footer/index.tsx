import type { EngineContext } from '@/engine/types'
import { Caps, Money, Num, NumberFlowGroup, T, cn } from '../kit'

interface Props { rows: EngineContext['ledger']; goal: EngineContext['goalLedger'] }

/**
 * #5 — before→after ledger strip; the "after" values roll in via NumberFlow, the goal
 * delta rides the header line in purple. Cells auto-fit: one per line in a narrow column,
 * side by side across the full-width footer slot.
 */
function PostPurchaseFooter({ rows, goal }: Props) {
  return (
    <div className="pc-card !rounded-sm2 px-4 py-3.5">
      {/* the goal note rides beside the section label rather than at the far edge — across the
          full-width footer justify-between would put ~1100px between the two. */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Caps className="text-slate-muted">If you buy</Caps>
        {goal ? (
          <span className="whitespace-nowrap text-meta font-semibold text-purple">
            {goal.label} {goal.delta > 0 ? <>lands <Num value={goal.delta} /> days later</> : 'unchanged'}
          </span>
        ) : null}
      </div>
      <NumberFlowGroup>
        <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-x-6 gap-y-1.5 tabular-nums">
          {rows.map((r) => (
            <span key={r.label} className="flex items-baseline gap-1 whitespace-nowrap">
              <span className={cn(T.meta, 'min-w-0 shrink truncate')}>{r.label}</span>
              {/* leader: keeps the numbers right-aligned in a narrow stack AND ties each label
                  to its own figures once the cells sit side by side across the full width. */}
              <span aria-hidden className="min-w-2.5 flex-1 self-center border-b border-lavender" />
              <span className="text-meta text-slate-muted">
                <Money value={r.before} size="inline" cents="never" animated={false} />
              </span>
              <svg width="14" height="8" viewBox="0 0 14 8" aria-hidden className="shrink-0 text-slate-hair"><path d="M0 4h12M9 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
              <span className="text-body font-bold text-ink">
                <Money value={r.after} size="inline" cents="never" />
                {r.unit ? <span className="font-medium text-slate-muted">{r.unit}</span> : null}
              </span>
            </span>
          ))}
        </div>
      </NumberFlowGroup>
    </div>
  )
}

export const select = (ctx: EngineContext): Props => ({ rows: ctx.ledger, goal: ctx.goalLedger })

export { meta, condition } from './meta'
export default PostPurchaseFooter
