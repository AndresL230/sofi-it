import type { EngineContext } from '@/engine/types'
import { CardShell, Money, Num, T, cn } from '../kit'

interface Props { priorLabel: string; priorAmount: number; weeksAgo: number; thisLabel: string; thisAmount: number; count: number; kind: string }

/** One polaroid in the side-by-side: the amount is the "photo", the caption says what and when. */
function Tile({ rot, label, when, amount, fill, ink }: { rot: string; label: string; when: React.ReactNode; amount: number; fill: string; ink: string }) {
  return (
    <div className="flex-1 border border-lavender bg-white p-2 pb-3 shadow-polaroid" style={{ transform: `rotate(${rot})` }}>
      <div className={cn('flex h-14 items-center justify-center', fill)}>
        <Money value={amount} size="md" cents="never" animated={false} className={ink} />
      </div>
      <div className="mt-2 text-center">
        <div className={cn(T.caption, 'line-clamp-2 font-semibold text-navy')} title={label}>{label}</div>
        <div className={cn(T.micro, 'mt-0.5')}>{when}</div>
      </div>
    </div>
  )
}

/**
 * #22 — two polaroid tiles rotated ∓2° with a VS chip on the seam. Data only.
 *
 * The polaroid pair has a natural maximum (312px): past that the paper stops growing and the
 * extra span goes to layout instead — at ≥524px of content the verdict text moves beside the
 * comparison rather than above it. Both arrangements come from one wrapping flex row.
 */
function DuplicateCheck({ priorLabel, priorAmount, weeksAgo, thisLabel, thisAmount, count, kind }: Props) {
  const delta = Math.round(thisAmount - priorAmount)
  return (
    <CardShell className="flex flex-col justify-center">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="grow basis-[200px]">
          <div className={cn(T.title, 'text-navy')}>You've been here before.</div>
          <div className={cn(T.meta, 'mt-1')}><Num value={count} suffix={count === 2 ? 'nd' : count === 3 ? 'rd' : 'th'} /> {kind} purchase this quarter.</div>
          <div className={cn(T.body, 'mt-2 text-slate')}>
            {delta === 0 ? 'Same price as last time.' : (
              <><b className="font-bold text-navy"><Money value={Math.abs(delta)} size="inline" cents="never" animated={false} /></b> {delta > 0 ? 'more' : 'less'} than last time.</>
            )}
          </div>
        </div>

        <div className="flex w-full max-w-[312px] grow basis-[300px] items-stretch">
          <Tile rot="-2deg" label={priorLabel} when={<><Num value={weeksAgo} animated={false} /> weeks ago</>} amount={priorAmount} fill="bg-lavender-soft" ink="text-slate" />
          <div className="z-[2] -mx-2.5 mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-navy text-caption font-extrabold tracking-[.06em] text-white shadow-pop">VS</div>
          <Tile rot="2deg" label={thisLabel} when="today" amount={thisAmount} fill="bg-salmon-tint" ink="text-salmon-ink" />
        </div>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ priorLabel: ctx.duplicate!.label, priorAmount: ctx.duplicate!.prior.amount, weeksAgo: ctx.duplicate!.weeksAgo, thisLabel: ctx.q.thing.length <= 18 ? ctx.q.thing : 'these', thisAmount: ctx.q.amount, count: ctx.impulse.countThisQuarter + 1, kind: ctx.q.category === 'shopping_apparel' ? 'apparel' : ctx.pace.label.toLowerCase() })

export { meta, condition } from './meta'
export default DuplicateCheck
