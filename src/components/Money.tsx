import { useEffect, useState } from 'react'
import NumberFlow, { NumberFlowGroup } from '@number-flow/react'
import { useReducedMotion } from 'framer-motion'
import { COUNT_UP_START_MS } from '@/motion/tokens'
import { useCountUpReveal } from '@/motion/reveal'
import { cn } from '@/lib/utils'

/**
 * <Money> — the single currency renderer for the whole app.
 *
 * SoFi's signature hero treatment: bold digits with the cents raised at ~50% size
 * ("$2,992" + raised "92"). Every card consumes this; no card formats currency itself.
 * Backed by NumberFlow so every change rolls like an odometer (split_check share,
 * cost_per_use, footer "after" values, annualized count-up…).
 */
export type MoneySize = 'hero' | 'lg' | 'md' | 'sm' | 'inline'
export type CentsMode = 'raised' | 'decimal' | 'never' | 'auto'

/** Snapped onto the named metric scale in tailwind.config.ts — no arbitrary sizes. */
const SIZE: Record<MoneySize, string> = {
  hero: 'text-metric-hero font-extrabold tracking-[-0.02em]',
  lg: 'text-metric-lg font-extrabold tracking-[-0.02em]',
  md: 'text-metric font-extrabold tracking-[-0.01em]',
  sm: 'text-metric-sm font-extrabold',
  inline: 'font-[inherit]',
}

export interface MoneyProps {
  value: number
  size?: MoneySize
  /** raised = superscript cents (hero style) · decimal = "$4.80" · never = whole dollars · auto = decimal only when non-integer */
  cents?: CentsMode
  /** Show an explicit "+" for positive values (deltas). */
  signed?: boolean
  /** Text prefix rendered inside the flow (e.g. "≈ ", "−"). */
  prefix?: string
  suffix?: string
  /** Approximate — rounds to whole dollars and prepends "≈ ". */
  approx?: boolean
  className?: string
  /** Disable the roll (static render, e.g. inside long lists). */
  animated?: boolean
  title?: string
  /** Delay the roll (ms) — count-ups that should land after a signature motion. */
  delayMs?: number
}
/** Sizes big enough to carry a roll. A count-up on an 11px row figure is noise, not a reveal. */
const COUNTS_UP: Record<MoneySize, boolean> = { hero: true, lg: true, md: true, sm: false, inline: false }

/**
 * Start at 0 on mount and roll to the real figure — but ONLY inside an answer reveal
 * (<CountUpProvider>), only for a figure big enough to carry it, and never under
 * prefers-reduced-motion, where the value must simply be there.
 * NumberFlow animates on change, not on first paint, so the zero-then-set is what makes it roll.
 */
function useRolledValue(value: number, size: MoneySize, animated: boolean) {
  const reveal = useCountUpReveal()
  const reduced = useReducedMotion()
  const on = reveal && animated && !reduced && COUNTS_UP[size]
  const [shown, setShown] = useState(on ? 0 : value)
  useEffect(() => {
    // Deliberately no "is this the first run?" ref. React.StrictMode mounts, tears down and
    // mounts again in development, and a ref like that gets consumed by the discarded pass — the
    // roll then silently never happened in dev while still working in production. This effect is
    // idempotent instead. Delaying every change is harmless: the only figure inside a
    // <CountUpProvider> is the verdict's amount, and a new amount means a new query, which
    // remounts the whole stack via its revealKey.
    if (!on) { setShown(value); return }
    const t = setTimeout(() => setShown(value), COUNT_UP_START_MS)
    return () => clearTimeout(t)
  }, [value, on])
  return on ? shown : value
}

const timing = (delayMs?: number) => (delayMs ? { transformTiming: { duration: 750, delay: delayMs, easing: 'ease-out' }, spinTiming: { duration: 750, delay: delayMs, easing: 'ease-out' }, opacityTiming: { duration: 350, delay: delayMs, easing: 'ease-out' } } : {})

export function Money({ value, size = 'md', cents = 'auto', signed, prefix = '', suffix = '', approx, className, animated = true, title, delayMs }: MoneyProps) {
  const rolled = useRolledValue(value, size, animated)
  const v = approx ? Math.round(rolled) : Math.round(rolled * 100) / 100
  const mode: Exclude<CentsMode, 'auto'> =
    cents === 'auto' ? (size === 'inline' ? (Number.isInteger(v) ? 'never' : 'decimal') : 'raised') : cents
  const pre = (approx ? '≈ ' : '') + prefix
  const sign = signed && v > 0 ? '+' : ''
  const base = cn('money inline-flex items-baseline', SIZE[size], className)

  if (mode === 'raised') {
    const whole = Math.trunc(v)
    const c = Math.round(Math.abs(v - whole) * 100)
    return (
      <span className={base} title={title}>
        <NumberFlowGroup>
          <NumberFlow
            value={whole}
            prefix={pre + sign}
            animated={animated}
            {...timing(delayMs)}
            format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0, minimumFractionDigits: 0 }}
          />
          <sup aria-hidden="false">
            <NumberFlow value={c} animated={animated} {...timing(delayMs)} format={{ minimumIntegerDigits: 2, useGrouping: false }} />
          </sup>
          {suffix ? <span className="ml-0.5 text-[.5em] font-semibold text-slate-muted">{suffix}</span> : null}
        </NumberFlowGroup>
      </span>
    )
  }
  const fraction = mode === 'decimal' ? 2 : 0
  return (
    <span className={base} title={title}>
      <NumberFlow
        value={v}
        prefix={pre + sign}
        suffix={suffix}
        animated={animated}
        {...timing(delayMs)}
        format={{ style: 'currency', currency: 'USD', maximumFractionDigits: fraction, minimumFractionDigits: fraction }}
      />
    </span>
  )
}

/** Non-currency animated number (counts, days, percentages, points). */
export function Num({ value, suffix = '', prefix = '', fraction = 0, className, animated = true, signed, delayMs }: { value: number; suffix?: string; prefix?: string; fraction?: number; className?: string; animated?: boolean; signed?: boolean; delayMs?: number }) {
  return (
    <span className={cn('money', className)}>
      <NumberFlow
        value={value}
        prefix={prefix + (signed && value > 0 ? '+' : '')}
        suffix={suffix}
        animated={animated}
        {...timing(delayMs)}
        format={{ maximumFractionDigits: fraction, minimumFractionDigits: fraction }}
      />
    </span>
  )
}

export { NumberFlowGroup }
