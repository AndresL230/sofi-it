import type { EngineContext } from '@/engine/types'
import { CardShell } from '../kit'

interface Props { mine: string[]; candidate: string; shared: string[] }

/** #27 — a small Venn: two circles holding service chips; the intersection shaded salmon with the overlapping pair inside. */
function OverlapCheck({ mine, candidate, shared }: Props) {
  return (
    <CardShell>
      <div className="relative">
        <svg viewBox="0 0 320 140" className="block w-full" aria-hidden>
          <defs><clipPath id="ovA"><circle cx="120" cy="70" r="58" /></clipPath></defs>
          <circle cx="200" cy="70" r="58" fill="rgba(221,121,117,.18)" clipPath="url(#ovA)" />
          <circle cx="120" cy="70" r="58" fill="none" stroke="var(--teal)" strokeWidth="1.6" />
          <circle cx="200" cy="70" r="58" fill="none" stroke="var(--purple)" strokeWidth="1.6" />
        </svg>
        <div className="absolute left-[8%] top-[44%] flex flex-col gap-[3px]">{mine.map((m) => <span key={m} className="rounded-pill bg-teal-tint px-2 py-[1px] text-[11px] font-bold text-teal-ink">{m}</span>)}</div>
        <div className="absolute right-[7%] top-[44%] rounded-pill bg-purple-tint px-2 py-[1px] text-[11px] font-bold text-purple">{candidate}</div>
        <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 text-center text-[10px] font-bold leading-tight text-salmon-ink">{shared.map((s) => <div key={s}>{s}</div>)}<div>catalogs</div></div>
      </div>
      <div className="mt-2 text-center text-[12.5px] text-slate">{mine.join(' and ')} already cover most of what {candidate} carries.</div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ mine: ctx.subs.overlap!.mine, candidate: ctx.subs.overlap!.candidate, shared: ctx.subs.overlap!.shared })

export { meta, condition } from './meta'
export default OverlapCheck
