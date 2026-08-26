import { useState } from 'react'
import type { EngineContext } from '@/engine/types'
import { defineCard, CardShell, Money, Num, Slider, cn } from './kit'

interface Props { amount: number; unit: string; anchor: { label: string; perUse: number } | null; defaultUses: number; min: number; max: number; good: number; ok: number }

/** #21 — interactive: price tag splitting into per-use tokens; expected-uses slider; $/use recomputes live and shifts teal→gold→salmon. */
function CostPerUse({ amount, unit, anchor, defaultUses, min, max, good, ok }: Props) {
  const [uses, setUses] = useState(defaultUses)
  const per = amount / uses
  const color = per <= good ? 'var(--teal)' : per <= ok ? 'var(--gold-ink)' : 'var(--salmon-ink)'
  const tokens = Math.max(3, Math.min(12, Math.round(uses / 8)))
  return (
    <CardShell>
      <div className="flex items-baseline justify-between">
        <div className="text-[14px] font-bold">Cost per {unit}</div>
        <div className="text-[22px] font-extrabold transition-colors duration-300" style={{ color }}><Money value={per} size="inline" cents={per < 10 ? 'decimal' : 'never'} /><span className="text-[12px] font-semibold text-slate-muted">/{unit}</span></div>
      </div>
      <div className="mt-3 flex items-center gap-2" aria-hidden>
        <svg viewBox="0 0 44 28" className="h-7 w-11 shrink-0"><path d="M2 14 L12 3 H40 a2 2 0 0 1 2 2 V23 a2 2 0 0 1 -2 2 H12 Z" fill="var(--navy)" /><circle cx="11" cy="14" r="2.5" fill="#fff" /></svg>
        <div className="text-slate-hair">›</div>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: tokens }, (_, i) => <div key={i} className={cn('h-4 w-4 rounded-[4px] transition-colors duration-300')} style={{ background: color, opacity: 0.35 + (0.65 * (i + 1)) / tokens }} />)}
        </div>
      </div>
      <Slider className="mt-3" min={min} max={max} step={1} value={[uses]} onValueChange={([v]) => setUses(v)} aria-label={`Expected ${unit}s`} rangeClassName="transition-colors" />
      <div className="flex justify-between text-[11px] text-slate-muted"><span><Num value={min} animated={false} /> {unit}s</span><span className="font-bold text-slate"><Num value={uses} /> expected {unit}s</span><span><Num value={max} animated={false} /></span></div>
      {anchor ? <div className="mt-[10px] border-t border-lavender-soft pt-[10px] text-[12.5px] text-slate">Anchor: {anchor.label} have run ≈ <b><Money value={anchor.perUse} size="inline" cents="never" animated={false} />/{unit}</b> so far.</div> : null}
    </CardShell>
  )
}

export const condition = (ctx: EngineContext) => ctx.q.size === 'medium' && ctx.q.isDiscretionary && ctx.q.frequency !== 'recurring' && (ctx.q.category === 'shopping_apparel' || ctx.q.category === 'shopping_electronics' || ctx.q.category === 'other')
export const select = (ctx: EngineContext): Props => ({
  amount: ctx.q.amount, unit: ctx.costPerUse.unit, anchor: ctx.costPerUse.anchor, defaultUses: ctx.costPerUse.defaultUses, min: 10, max: 100, good: ctx.costPerUse.good, ok: ctx.costPerUse.ok,
})

export default defineCard<Props>({ type: 'cost_per_use', section: 'Behavior lens', label: 'interactive', condition, select, Component: CostPerUse, samples: [{ query: '$140 running shoes' }, { query: '$450 monitor' }] })
