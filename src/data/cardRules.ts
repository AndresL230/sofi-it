import type { CreditCardRule } from '@/engine/types'
import { addDays, nextDayOfMonth } from '@/lib/dates'
import { BRAND } from '@/brand'

/**
 * The five cards (MASTER §2 + cards spec appendix). Point valuations:
 *   MR earns at 2¢/pt (4x dining on $60 ≈ $4.80 — the spec's headline number),
 *   UR earns at 1¢/pt (3x dining on $60 ≈ $1.80; 2x travel on $1,200 ≈ $24).
 * All dates are relative to `now`.
 */
export function buildCardRules(now: Date): CreditCardRule[] {
  const statementClose = nextDayOfMonth(addDays(now, 1), 12) // "closes the 12th"
  return [
    {
      id: 'sofi2', name: BRAND.flatCard, artLabel: '2% EVERYTHING', last4: '4021', art: ['#00A2C7', '#00708A'],
      balance: 340, limit: 10000, apr: null, program: 'cash', pointValueCents: 1, base: 2, bonus: {},
      credits: [], benefits: { purchaseProtectionDays: 90 }, statementClose: nextDayOfMonth(addDays(now, 1), 20), isFlatHouseCard: true,
    },
    {
      id: 'amexgold', name: 'Amex Gold', artLabel: 'GOLD', last4: '1005', art: ['#E3BE5F', '#A7802B'],
      balance: 290, limit: null, apr: null, program: 'MR', pointValueCents: 2, base: 1, bonus: { dining: 4 },
      credits: [{ label: 'Amex dining credit', amount: 10, category: 'dining', expires: addDays(now, 6), perMonth: true }],
      benefits: { purchaseProtectionDays: 120, returnProtectionDays: 90, extendedWarrantyYears: 1 },
      statementClose: nextDayOfMonth(addDays(now, 1), 3),
    },
    {
      id: 'citicc', name: 'Citi Custom Cash', artLabel: 'CUSTOM CASH', last4: '8834', art: ['#9A9DA3', '#5E6166'],
      balance: 210, limit: 3000, apr: null, program: 'cash', pointValueCents: 1, base: 1, bonus: {},
      cap: { category: 'dining', monthlyCap: 500, used: 487, rate: 5 },
      credits: [], benefits: {}, statementClose: nextDayOfMonth(addDays(now, 1), 25),
    },
    {
      id: 'csp', name: 'Chase Sapphire Preferred', artLabel: 'SAPPHIRE', last4: '5512', art: ['#2C2F6E', '#201747'],
      balance: 620, limit: 12000, apr: null, program: 'UR', pointValueCents: 1, base: 1, bonus: { dining: 3, travel: 2 },
      credits: [{ label: 'CSP hotel credit', amount: 50, category: 'travel', expires: addDays(now, 118) }],
      benefits: { tripProtection: true, purchaseProtectionDays: 120, extendedWarrantyYears: 1, transferPartners: true },
      statementClose: nextDayOfMonth(addDays(now, 1), 8),
    },
    {
      id: 'cfu', name: 'Chase Freedom Unlimited', artLabel: 'FREEDOM', last4: '7290', art: ['#4E6E8E', '#2E4258'],
      balance: 1220, limit: 4000, apr: 0.2424, program: 'cash', pointValueCents: 1, base: 1.5, bonus: {},
      credits: [], benefits: { purchaseProtectionDays: 120, extendedWarrantyYears: 1 }, statementClose,
    },
  ]
}
