/**
 * ProfileSpec — everything that varies between demo personas. One shape, three instances
 * (maya / devon / priya). The generator, card rules, baselines and adapter are all driven by it.
 */
import type { PointsProgram, RewardCategory, SpendCategory, Subscription } from '@/types'

export interface CardSpec {
  id: string; name: string; artLabel: string; last4: string; art: [string, string]
  balance: number; limit: number | null; apr: number | null
  program: PointsProgram; pointValueCents: number; base: number; bonus: Partial<Record<RewardCategory, number>>
  cap?: { category: RewardCategory; monthlyCap: number; used: number; rate: number }
  credits: { label: string; amount: number; category: RewardCategory; expiresInDays: number; perMonth?: boolean }[]
  benefits: { purchaseProtectionDays?: number; returnProtectionDays?: number; extendedWarrantyYears?: number; tripProtection?: boolean; transferPartners?: boolean }
  statementCloseDay: number
  isFlatHouseCard?: boolean
}

export interface ProfileSpec {
  id: string
  persona: { firstName: string; lastName: string; city: string; initials: string }
  blurb: string
  starters: string[]
  accounts: { checking: number; savings: number; vaults: { name: string; balance: number }[]; brokerage: number; masks: { checking: string; savings: string; brokerage: string } }
  payroll: { amount: number; daysUntilNext: number; intervalDays: number; employer: string }
  rent: { amount: number; dayOfMonth: number; landlord: string }
  cash: { bufferFloor: number; cushion: number }
  allowance: { monthly: number; spent: number }
  points: { program: PointsProgram; balance: number; label: string; transferPartner: string; transferValueCents: number }[]
  loan: { apr: number; termMonths: number }
  priorTrip: { flight: number; around: { stay: number; food: number; local: number }; label: string; monthsAgo: number; foodMerchants: string[]; localMerchants: string[] }
  /** usual + runRate per category (subscriptions are summed from the rows). */
  baselines: Record<Exclude<SpendCategory, 'subscriptions' | 'income' | 'transfer'>, { usual: number; runRate: number }>
  subscriptions: Subscription[]
  cards: CardSpec[]
  habits: {
    coffee: { merchant: string; visitsPerMonth: number; ticket: [number, number] }
    lunch: { merchant: string; visitsPerMonth: number; ticket: [number, number] }
    apparel: { merchant: string; amount: number; daysAgo: number; tags: string[] }[]
    entertainment: { merchant: string; amount: number; daysAgo: number; tags: string[] }[]
  }
  /** Where a large purchase could be accelerated from. */
  redirectPlan: { category: SpendCategory; to: number }[]
  /** The goal the app suggests (vault balance is looked up by name). */
  goalTemplate: { name: string; emoji: string; target: number; vaultName: string; weekly: number; weeksOut: number }
  /** Six-month net-worth delta for the Home chart. */
  netWorthDelta6m: number
  /** Seed for the noise generator. */
  seed: number
}
