import type { CreditCardRule } from '@/types'
import type { CardSpec } from './spec'
import { addDays, nextDayOfMonth } from '@/lib/dates'

/** Cards from a ProfileSpec. All dates relative to `now` (credit expiry = now + N days; statement close = next occurrence of the day). */
export function buildCardRules(now: Date, cards: CardSpec[]): CreditCardRule[] {
  return cards.map((c) => ({
    id: c.id, name: c.name, artLabel: c.artLabel, last4: c.last4, art: c.art, balance: c.balance, limit: c.limit, apr: c.apr,
    program: c.program, pointValueCents: c.pointValueCents, base: c.base, bonus: c.bonus, cap: c.cap,
    credits: c.credits.map((cr) => ({ label: cr.label, amount: cr.amount, category: cr.category, expires: addDays(now, cr.expiresInDays), perMonth: cr.perMonth })),
    benefits: c.benefits, statementClose: nextDayOfMonth(addDays(now, 1), c.statementCloseDay), isFlatHouseCard: c.isFlatHouseCard,
  }))
}
