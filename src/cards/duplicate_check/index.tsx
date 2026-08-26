import type { EngineContext } from '@/engine/types'
import { CardShell, Money, Num } from '../kit'

interface Props { priorLabel: string; priorAmount: number; weeksAgo: number; thisLabel: string; thisAmount: number; count: number; kind: string }

/** #22 — two polaroid tiles rotated ∓2° with a VS chip on the seam. Data only. */
function DuplicateCheck({ priorLabel, priorAmount, weeksAgo, thisLabel, thisAmount, count, kind }: Props) {
  const tile = (rot: string, top: React.ReactNode, bottom: React.ReactNode) => (
    <div className="w-32 border border-lavender bg-white px-2 pb-[10px] pt-2 shadow-polaroid" style={{ transform: `rotate(${rot})` }}>
      <div className="h-[74px]" style={{ background: 'repeating-linear-gradient(45deg, #F0EEF1 0 6px, #FAFAF9 6px 12px)' }} />
      <div className="mt-[7px] text-center text-[10.5px] text-slate">{top}<br />{bottom}</div>
    </div>
  )
  return (
    <CardShell className="flex flex-col justify-center">
      <div className="mb-3 text-[13px] text-slate"><Num value={count} suffix={count === 2 ? 'nd' : count === 3 ? 'rd' : 'th'} /> {kind} purchase this quarter.</div>
      <div className="relative flex items-stretch justify-center gap-1">
        {tile('-2deg', <><Num value={weeksAgo} animated={false} /> weeks ago</>, <>{priorLabel} · <b><Money value={priorAmount} size="inline" cents="never" animated={false} /></b></>)}
        <div className="absolute left-1/2 top-[42%] z-[2] flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-navy text-[10px] font-extrabold text-white">VS</div>
        {tile('2deg', 'today', <>{thisLabel} · <b><Money value={thisAmount} size="inline" cents="never" animated={false} /></b></>)}
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ priorLabel: ctx.duplicate!.label, priorAmount: ctx.duplicate!.prior.amount, weeksAgo: ctx.duplicate!.weeksAgo, thisLabel: ctx.q.thing.length <= 18 ? ctx.q.thing : 'these', thisAmount: ctx.q.amount, count: ctx.impulse.countThisQuarter + 1, kind: ctx.q.category === 'shopping_apparel' ? 'apparel' : ctx.pace.label.toLowerCase() })

export { meta, condition } from './meta'
export default DuplicateCheck
