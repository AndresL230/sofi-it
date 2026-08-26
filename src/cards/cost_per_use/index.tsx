import { useState } from 'react'
import type { EngineContext } from '@/engine/types'
import { CardShell, Money, Num, Slider, T, cn } from '../kit'

interface Props { amount: number; unit: string; anchor: { label: string; perUse: number } | null; defaultUses: number; min: number; max: number; good: number; ok: number }

/**
 * Fill vs ink discipline: blocks, slider range and thumb take a FILL token (teal / gold-deep /
 * salmon); the rate and the chip label take the matching INK token. --gold-ink is never a fill.
 * Every state also carries a word, so the verdict never rides on colour alone.
 */
const STATE = {
  good: { label: 'Good value', fill: 'bg-teal', ink: 'text-teal-ink', chip: 'bg-teal-tint text-teal-ink', thumb: 'border-teal' },
  ok: { label: 'Fair', fill: 'bg-gold-deep', ink: 'text-gold-ink', chip: 'bg-gold-tint text-gold-ink', thumb: 'border-gold-deep' },
  steep: { label: 'Steep', fill: 'bg-salmon', ink: 'text-salmon-ink', chip: 'bg-salmon-tint text-salmon-ink', thumb: 'border-salmon' },
} as const

/** #21 — interactive: the price cut into one block per use. Drag the expected-uses slider and the
 *  price re-slices while the rate recomputes and shifts teal → gold → salmon. */
function CostPerUse({ amount, unit, anchor, defaultUses, min, max, good, ok }: Props) {
  const [uses, setUses] = useState(defaultUses)
  const per = amount / uses
  const s = STATE[per <= good ? 'good' : per <= ok ? 'ok' : 'steep']
  const plural = `${unit}s`
  return (
    <CardShell className="flex flex-col gap-4">
      {/*
        Wide spans (the bento gives this card up to ~562px) must not stretch the comb into a
        barcode: past ~520px the row splits into value | machinery and each half is capped, so the
        extra width goes to layout instead of to the drawing. Below that it wraps back to a stack.
      */}
      <div className="flex flex-1 flex-wrap content-center items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-[180px] max-w-[360px] flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className={T.lede}>Cost per {unit}</div>
            <div className={`shrink-0 rounded-pill px-2 py-0.5 text-caption font-semibold transition-colors duration-300 ${s.chip}`}>{s.label}</div>
          </div>
          <div className={`mt-2 transition-colors duration-300 ${s.ink}`}>
            <Money value={per} size="lg" cents="raised" suffix={`/${unit}`} />
          </div>
        </div>

        <div className="min-w-[280px] max-w-[400px] flex-1">
          <div className={T.caption}>
            <Money value={amount} size="inline" cents="never" animated={false} /> split across <Num value={uses} /> {plural}
          </div>
          {/* the price itself, cut into one block per use — it thins out as the slider spreads it */}
          <div className="mt-1.5 flex h-4 w-full items-stretch" style={{ gap: uses > 40 ? 1 : 2 }} aria-hidden>
            {Array.from({ length: uses }, (_, i) => (
              <div key={i} className={`min-w-0 flex-1 rounded-sm transition-colors duration-300 ${s.fill}`} />
            ))}
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-2">
            <div className={T.caps}>Expected {plural}</div>
            <div className="text-metric-sm font-extrabold text-navy"><Num value={uses} /></div>
          </div>
          <Slider
            className="mt-1 [&>span:first-child]:h-2 [&>span:first-child]:bg-lavender"
            min={min} max={max} step={1} value={[uses]} onValueChange={([v]) => setUses(v)}
            aria-label={`Expected ${plural}`}
            rangeClassName={cn('transition-colors duration-300', s.fill)}
            thumbClassName={cn('h-6 w-6 transition-transform hover:scale-110 active:scale-95', s.thumb)}
          />
          <div className="flex items-baseline justify-between text-micro text-slate-muted" aria-hidden>
            <span><Num value={min} animated={false} /></span>
            <span><Num value={max} animated={false} /></span>
          </div>
        </div>
      </div>

      <div className={`border-t border-lavender-soft pt-3 first-letter:uppercase ${T.body} text-slate`}>
        {anchor
          ? <>{anchor.label} have run <b className="font-semibold text-navy"><Money value={anchor.perUse} size="inline" cents="never" approx animated={false} />/{unit}</b> so far.</>
          : <>Under&nbsp;<b className="font-semibold text-navy"><Money value={good} size="inline" cents="never" animated={false} />/{unit}</b>, this stops being a splurge.</>}
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({
  amount: ctx.q.amount, unit: ctx.costPerUse.unit, anchor: ctx.costPerUse.anchor, defaultUses: ctx.costPerUse.defaultUses, min: 10, max: 100, good: ctx.costPerUse.good, ok: ctx.costPerUse.ok,
})

export { meta, condition } from './meta'
export default CostPerUse
