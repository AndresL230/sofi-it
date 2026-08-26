import type { EngineContext } from '@/engine/types'
import { CardShell, Caps, T, cn } from '../kit'

interface Props { mine: string[]; candidate: string; shared: string[] }

const list = (a: string[]) => (a.length < 2 ? (a[0] ?? '') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`)

/**
 * #27 — a real Venn, drawn in one viewBox so nothing can drift out of its lobe: your services
 * on the left, the candidate on the right, the shared catalog in a hatched lens between them
 * (hatch, not tint alone, carries the overlap).
 * The diagram has a natural maximum (360px). Past that the card recomposes — verdict beside the
 * Venn rather than a balloon under a small headline — so it reads at 340px and at 1140px alike.
 */
function OverlapCheck({ mine, candidate, shared }: Props) {
  const names = mine.slice(0, 3)
  const tags = shared.slice(0, 2)
  const capsY = tags.length > 1 ? 68 : 75
  return (
    <CardShell className="flex flex-col justify-center">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <div className="min-w-0 max-w-[520px] flex-1 basis-[240px]">
          <Caps className="text-salmon-ink">Already covered</Caps>
          <p className={cn(T.title, 'm-0 mt-1')}>{list(mine)} already cover most of what {candidate} carries.</p>
        </div>
        <div className="w-full max-w-[360px] flex-1 basis-[280px]">
          <svg viewBox="0 0 320 154" className="block w-full" role="img" aria-label={`${list(mine)} and ${candidate} both carry ${list(shared)}`}>
            <defs>
              <clipPath id="ovLens"><ellipse cx="112" cy="82" rx="88" ry="58" /></clipPath>
              <pattern id="ovHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="7" stroke="var(--salmon)" strokeWidth="1.5" strokeOpacity=".45" />
              </pattern>
            </defs>
            <ellipse cx="112" cy="82" rx="88" ry="58" fill="var(--teal-tint)" fillOpacity=".8" />
            <ellipse cx="208" cy="82" rx="88" ry="58" fill="var(--purple-tint)" fillOpacity=".6" />
            <g clipPath="url(#ovLens)">
              <ellipse cx="208" cy="82" rx="88" ry="58" fill="var(--salmon-tint)" />
              <ellipse cx="208" cy="82" rx="88" ry="58" fill="url(#ovHatch)" />
            </g>
            <ellipse cx="112" cy="82" rx="88" ry="58" fill="none" stroke="var(--teal)" strokeWidth="1.6" />
            <ellipse cx="208" cy="82" rx="88" ry="58" fill="none" stroke="var(--purple)" strokeWidth="1.6" />

            <text x="72" y="14" textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="1" fill="var(--teal-ink)">YOURS</text>
            <text x="248" y="14" textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="1" fill="var(--purple)">ADDING</text>

            {names.map((m, i) => (
              <text key={m} x="72" y={86 - (names.length - 1) * 10 + i * 20} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--teal-ink)">{m}</text>
            ))}
            <text x="248" y="87" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--purple)">{candidate}</text>

            <text x="160" y={capsY} textAnchor="middle" fontSize="9.5" fontWeight="700" letterSpacing=".8" fill="var(--salmon-ink)">BOTH</text>
            {tags.map((s, i) => (
              <text key={s} x="160" y={capsY + 17 + i * 15} textAnchor="middle" fontSize="12.5" fontWeight="800" fill="var(--salmon-ink)">{s}</text>
            ))}
          </svg>
        </div>
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ mine: ctx.subs.overlap!.mine, candidate: ctx.subs.overlap!.candidate, shared: ctx.subs.overlap!.shared })

export { meta, condition } from './meta'
export default OverlapCheck
