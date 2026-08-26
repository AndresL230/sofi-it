/**
 * Pay-cadence math. Shared by /src/data (which lays down the payroll history) and /src/engine
 * (which projects forward), so neither hardcodes an interval. `netPerCheck` + `payCadence` from
 * the persona's FinancialProfile are the only inputs — there are no cadence literals downstream.
 */
import type { PayCadence } from '@/types'
import { addDays, addMonths } from './dates'

/** Nominal days between checks. Biweekly stays exactly 14 (a real fortnight), not 365/26. */
export const CADENCE_DAYS: Record<PayCadence, number> = { biweekly: 14, semimonthly: 15, monthly: 30 }
export const CHECKS_PER_YEAR: Record<PayCadence, number> = { biweekly: 26, semimonthly: 24, monthly: 12 }
export const CADENCE_LABEL: Record<PayCadence, string> = { biweekly: 'biweekly', semimonthly: 'semimonthly', monthly: 'monthly' }

/**
 * The k-th payday relative to an anchor payday (k may be negative for history).
 * Semimonthly is a true twice-a-month series — anchor, anchor+15, anchor+1mo, anchor+1mo+15 — so it
 * lands 24 checks a year rather than drifting the way a fixed 15-day step would.
 */
export function paydayAt(anchor: Date, cadence: PayCadence, k: number): Date {
  if (cadence === 'biweekly') return addDays(anchor, CADENCE_DAYS.biweekly * k)
  if (cadence === 'monthly') return addMonths(anchor, k)
  const months = Math.floor(k / 2)
  return addDays(addMonths(anchor, months), (k - months * 2) * CADENCE_DAYS.semimonthly)
}

/** Paydays from `anchor` (inclusive) up to and including `until`. */
export function paydaysUntil(anchor: Date, cadence: PayCadence, until: Date): Date[] {
  const out: Date[] = []
  for (let k = 0; k < 400; k++) {
    const d = paydayAt(anchor, cadence, k)
    if (d.getTime() > until.getTime()) break
    out.push(d)
  }
  return out
}

/** Paydays from `anchor` walking backwards while they stay on or after `from`. */
export function paydaysSince(anchor: Date, cadence: PayCadence, from: Date): Date[] {
  const out: Date[] = []
  for (let k = 0; k > -400; k--) {
    const d = paydayAt(anchor, cadence, k)
    if (d.getTime() < from.getTime()) break
    out.push(d)
  }
  return out
}

/** Take-home per month implied by the cadence. */
export const monthlyNet = (netPerCheck: number, cadence: PayCadence) => (netPerCheck * CHECKS_PER_YEAR[cadence]) / 12
