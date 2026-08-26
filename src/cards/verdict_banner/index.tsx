import type { EngineContext, RichText, VerdictTone, VerdictWord } from '@/engine/types'
import { Money, Rich, VERDICT_STYLE } from '../kit'

interface Props { word: VerdictWord; tone: VerdictTone; clause: RichText; amount: number }

/**
 * #1 — the only full-bleed tinted element. The verdict word and the amount it judges are a
 * locked pair on one baseline; the clause trails them on the same line in a wide slot and
 * drops beneath in a narrow column. All tones share padding and min-height.
 */
function VerdictBanner({ word, tone, clause, amount }: Props) {
  const s = VERDICT_STYLE[tone]
  return (
    <div data-tone={tone} className="flex min-h-24 flex-col justify-center rounded-banner px-5 py-4.5" style={{ background: s.bg }}>
      {/* The verdict, the amount it judges and the clause are ONE unit: the word and the
          amount are a locked pair, the clause follows on the same line when there is room and
          drops beneath it in a narrow column. Pinning the amount to the far edge would strand
          it ~1000px from the clause in the full-width (12-col) slot. */}
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5 text-ink">
        <div className="flex min-w-0 items-baseline gap-x-2.5">
          <span className="text-metric-lg font-extrabold leading-tight" style={{ color: s.ink }}>{word}</span>
          <Money value={amount} size="md" className="shrink-0" />
        </div>
        {/* capped measure — a single clause running the full 1140px is well past readable */}
        <p className="m-0 min-w-0 max-w-[52ch] text-pretty text-lede text-ink [&_.money]:font-semibold"><Rich text={clause} /></p>
      </div>
    </div>
  )
}

export const select = (ctx: EngineContext): Props => ({ word: ctx.verdict.word, tone: ctx.verdict.tone, clause: ctx.verdict.clause, amount: ctx.q.amount })

export { meta, condition } from './meta'
export default VerdictBanner
