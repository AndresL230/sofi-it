/** Formatting + RichText builders. Cards may import this module (and types) — nothing else from the engine. */
import type { RichPart, RichText } from './types'
export { monthShort, monthDay, weekdayShort, weekdayLong, ordinal, daysBetween, addDays } from '@/lib/dates'

export const money = (v: number, o: Omit<Extract<RichPart, { money: number }>, 'money'> = {}): RichPart => ({ money: v, ...o })
export const num = (v: number, o: Omit<Extract<RichPart, { num: number }>, 'num'> = {}): RichPart => ({ num: v, ...o })
export const date = (d: Date, fmt: Extract<RichPart, { date: Date }>['fmt'] = 'md'): RichPart => ({ date: d, fmt })
export const bold = (...t: RichText): RichPart => ({ b: t })
export const tone = (tn: Extract<RichPart, { tone: string }>['tone'], ...t: RichText): RichPart => ({ tone: tn, t })

/** Plain-text rendering of RichText (for titles/aria/toasts). */
export function richToString(t: RichText): string {
  return t.map((p) => {
    if (typeof p === 'string') return p
    if ('money' in p) return (p.approx ? '≈ ' : '') + (p.prefix ?? '') + (p.signed && p.money > 0 ? '+' : '') + fmtMoney(p.money, p.cents ?? 'auto') + (p.suffix ?? '')
    if ('num' in p) return (p.prefix ?? '') + (p.signed && p.num > 0 ? '+' : '') + p.num.toLocaleString('en-US', { maximumFractionDigits: p.fraction ?? 0 }) + (p.suffix ?? '')
    if ('date' in p) return fmtDate(p.date, p.fmt)
    if ('b' in p) return richToString(p.b)
    return richToString(p.t)
  }).join('')
}

export function fmtMoney(v: number, cents: 'auto' | 'decimal' | 'never' | 'raised' = 'auto'): string {
  const showCents = cents === 'decimal' || cents === 'raised' || (cents === 'auto' && !Number.isInteger(Math.round(v * 100) / 100))
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: showCents ? 2 : 0, maximumFractionDigits: showCents ? 2 : 0 })
}

export function fmtDate(d: Date, fmt: Extract<RichPart, { date: Date }>['fmt'] = 'md'): string {
  switch (fmt) {
    case 'weekday': return d.toLocaleDateString('en-US', { weekday: 'short' })
    case 'weekdayLong': return d.toLocaleDateString('en-US', { weekday: 'long' })
    case 'ordinal': { const n = d.getDate(); const s = ['th', 'st', 'nd', 'rd']; const v = n % 100; return 'the ' + n + (s[(v - 20) % 10] || s[v] || s[0]) }
    case 'month': return d.toLocaleDateString('en-US', { month: 'short' })
    default: return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

export const ordinalWord = (n: number) => ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'][n] ?? `${n}th`
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
export const pct = (v: number) => Math.round(v * 100)
