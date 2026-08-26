import type { EngineContext, RichText, VerdictTone, VerdictWord } from '@/engine/types'
import { defineCard, Money, Rich, VERDICT_STYLE } from './kit'

interface Props { word: VerdictWord; tone: VerdictTone; clause: RichText; amount: number }

/** #1 — the only full-bleed tinted element: verdict word bold, one clause, amount in hero numerals. */
function VerdictBanner({ word, tone, clause, amount }: Props) {
  const s = VERDICT_STYLE[tone]
  return (
    <div data-tone={tone} className="flex flex-wrap items-center justify-between gap-4 rounded-banner px-[22px] py-[18px]" style={{ background: s.bg }}>
      <div className="min-w-[200px] flex-1 text-[16.5px] text-ink"><b style={{ color: s.ink }}>{word}</b> <Rich text={clause} /></div>
      <Money value={amount} size="lg" className="shrink-0 text-[32px]" />
    </div>
  )
}

export const condition = (ctx: EngineContext) => ctx.q.size !== 'large'
export const select = (ctx: EngineContext): Props => ({ word: ctx.verdict.word, tone: ctx.verdict.tone, clause: ctx.verdict.clause, amount: ctx.q.amount })

export default defineCard<Props>({
  type: 'verdict_banner', section: 'Verdict & framing', label: '', condition, select, Component: VerdictBanner, span: 'full',
  samples: [
    { query: '$60 dinner', label: 'fine' },
    { query: '$60 dinner', goal: true, label: 'tight — goal exists' },
    { query: '$60 dinner', label: 'over', override: (p) => ({ ...p, word: 'Over.', tone: 'over', clause: ["This clears out the month's room."], amount: p.amount * 8 }) },
  ],
})
