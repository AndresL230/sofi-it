import NumberFlow, { NumberFlowGroup } from '@number-flow/react'
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

const SIZE: Record<MoneySize, string> = {
  hero: 'text-[38px] font-extrabold leading-none tracking-[-0.02em]',
  lg: 'text-[34px] font-extrabold leading-none tracking-[-0.02em]',
  md: 'text-[24px] font-extrabold leading-none tracking-[-0.01em]',
  sm: 'text-[18px] font-extrabold leading-none',
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
}

export function Money({ value, size = 'md', cents = 'auto', signed, prefix = '', suffix = '', approx, className, animated = true, title }: MoneyProps) {
  const v = approx ? Math.round(value) : Math.round(value * 100) / 100
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
            format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0, minimumFractionDigits: 0 }}
          />
          <sup aria-hidden="false">
            <NumberFlow value={c} animated={animated} format={{ minimumIntegerDigits: 2, useGrouping: false }} />
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
        format={{ style: 'currency', currency: 'USD', maximumFractionDigits: fraction, minimumFractionDigits: fraction }}
      />
    </span>
  )
}

/** Non-currency animated number (counts, days, percentages, points). */
export function Num({ value, suffix = '', prefix = '', fraction = 0, className, animated = true, signed }: { value: number; suffix?: string; prefix?: string; fraction?: number; className?: string; animated?: boolean; signed?: boolean }) {
  return (
    <span className={cn('money', className)}>
      <NumberFlow
        value={value}
        prefix={prefix + (signed && value > 0 ? '+' : '')}
        suffix={suffix}
        animated={animated}
        format={{ maximumFractionDigits: fraction, minimumFractionDigits: fraction }}
      />
    </span>
  )
}

export { NumberFlowGroup }
