/**
 * The financial-profile layer: five deterministic effects that change what the mechanics *mean*.
 *
 * The profile is engine input, never classifier input — the Worker still emits classification only.
 * Everything here is pure TypeScript over the persona's FinancialProfile; nothing reaches a model.
 *
 *   1. paymentHabit 'revolves'   → the card ranking optimises net cost, not rewards   (cardMath.ts)
 *   2. creditEvent ≤ 6 months    → utilization threshold 30% → 20%, ×1.75 promotion   (cardMath.ts + meta)
 *   3. priority                  → breaks near-ties only, never a material difference (cardMath.ts)
 *   4. employmentType 'variable' → 1.5× buffer before a verdict can land on `fine`    (runway.ts + context.ts)
 *   5. payCadence + netPerCheck  → every payday / runway figure                        (lib/payroll.ts)
 */
import type { FinancialProfile, MoneyPriority } from './types'
import { CREDIT_EVENT_HORIZON_MONTHS, UTILIZATION_LINE, VARIABLE_BUFFER_MULTIPLIER } from './types'

// The rule constants live in the type contract so card metas (which may import @/types only) can quote them.
export { CREDIT_EVENT_HORIZON_MONTHS, CREDIT_EVENT_BOOST, UTILIZATION_LINE, VARIABLE_BUFFER_MULTIPLIER, TIE_BAND } from './types'

/** The credit event, if it is close enough to change the answer. */
export const nearCreditEvent = (fp: FinancialProfile) =>
  fp.creditEvent && fp.creditEvent.monthsAway <= CREDIT_EVENT_HORIZON_MONTHS ? fp.creditEvent : null

/** Utilization line for this profile: tighter while a credit application is in sight. */
export const utilizationLine = (fp: FinancialProfile) =>
  nearCreditEvent(fp) ? UTILIZATION_LINE.creditEvent : UTILIZATION_LINE.normal

/** Cushion/allowance multiplier — wider when income is variable. */
export const bufferMultiplier = (fp: FinancialProfile) =>
  fp.employmentType === 'variable' ? VARIABLE_BUFFER_MULTIPLIER : 1

export const revolves = (fp: FinancialProfile) => fp.paymentHabit === 'revolves'

export const PRIORITY_LABEL: Record<MoneyPriority, string> = {
  points: 'Points and transfer partners',
  cash_back: 'Cash back',
  simplicity: 'One simple card',
  lowest_cost: 'The lowest total cost',
}

/** How a near-tie is broken, per priority. Higher wins; every arm is a pure function of the card. */
export const PRIORITY_RANK: Record<MoneyPriority, (c: { program: string; apr: number | null; isFlatHouseCard?: boolean; benefits: { transferPartners?: boolean } }) => number> = {
  points: (c) => (c.program !== 'cash' ? 2 : 0) + (c.benefits.transferPartners ? 1 : 0),
  cash_back: (c) => (c.program === 'cash' ? 1 : 0),
  simplicity: (c) => (c.isFlatHouseCard ? 1 : 0),
  lowest_cost: (c) => -(c.apr ?? 0),
}
