/** Date helpers shared by /src/data and /src/engine. Everything is relative to a `now` argument. */
export const DAY = 864e5
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), daysInMonth(new Date(d.getFullYear(), d.getMonth() + n, 1))))
export const daysBetween = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY)
export const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), daysInMonth(d))
export const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1)
export const sameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
/** Next occurrence of a day-of-month on or after `d` (clamped to month length). */
export function nextDayOfMonth(d: Date, day: number): Date {
  const thisMonth = new Date(d.getFullYear(), d.getMonth(), Math.min(day, daysInMonth(d)))
  if (thisMonth.getTime() >= startOfDay(d).getTime()) return thisMonth
  const nm = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  return new Date(nm.getFullYear(), nm.getMonth(), Math.min(day, daysInMonth(nm)))
}
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const fromIso = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const weekdayShort = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short' })
export const weekdayLong = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long' })
export const monthShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' })
export const monthDay = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
export const ordinal = (n: number) => { const s = ['th', 'st', 'nd', 'rd']; const v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]) }
