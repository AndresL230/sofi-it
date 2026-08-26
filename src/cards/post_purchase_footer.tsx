import type { EngineContext } from '@/engine/types'
import { defineCard, Money, Num, NumberFlowGroup, Caps } from './kit'

interface Props { rows: EngineContext['ledger']; goal: EngineContext['goalLedger'] }

/** #5 — before→after ledger strip; the "after" values roll in via NumberFlow; goal delta in purple at the far right. */
function PostPurchaseFooter({ rows, goal }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-[18px] gap-y-[6px] rounded-sm2 border border-lavender bg-white px-4 py-3">
      <Caps className="text-[10px] font-bold text-slate-muted">If you buy</Caps>
      <NumberFlowGroup>
        {rows.map((r) => (
          <span key={r.label} className="inline-flex items-center gap-[5px] text-[12.5px] text-slate tabular-nums">
            <span>{r.label}</span>
            <Money value={r.before} size="inline" cents="never" animated={false} />
            <svg width="14" height="8" viewBox="0 0 14 8" aria-hidden className="text-slate-hair"><path d="M0 4h12M9 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
            <Money value={r.after} size="inline" cents="never" className="font-semibold text-ink" />
            {r.unit ? <span className="text-slate-muted">{r.unit}</span> : null}
          </span>
        ))}
      </NumberFlowGroup>
      {goal ? (
        <span className="ml-auto text-[12.5px] font-bold text-purple">
          {goal.label} {goal.delta === 0 ? 'unchanged' : <><Num value={goal.delta} /> days</>}
        </span>
      ) : null}
    </div>
  )
}

export const condition = (ctx: EngineContext) => ctx.ledger.length > 0
export const select = (ctx: EngineContext): Props => ({ rows: ctx.ledger, goal: ctx.goalLedger })

export default defineCard<Props>({ type: 'post_purchase_footer', section: 'Verdict & framing', label: '', condition, select, Component: PostPurchaseFooter, span: 'full', samples: [{ query: '$60 dinner', goal: true }] })
