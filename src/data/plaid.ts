/**
 * Plaid-shaped types plus the two stable mappings shared by the runtime generator (mockUser.ts)
 * and the CSV loader (csv.ts): profile → Plaid account ids, and engine SpendCategory → Plaid PFC.
 * Shapes follow Plaid's /accounts/get + /transactions/sync closely enough that plaidAdapter.ts is
 * the only thing that would change with a live Item.
 */
import type { ProfileSpec } from './spec'
import type { SpendCategory } from '@/types'

export interface PlaidBalances { available: number | null; current: number; limit: number | null; iso_currency_code: 'USD' }
export interface PlaidAccount {
  account_id: string; name: string; official_name: string; mask: string
  type: 'depository' | 'credit' | 'investment'; subtype: 'checking' | 'savings' | 'credit card' | 'brokerage'
  balances: PlaidBalances
  /** SoFi-specific extension: savings vaults. */
  vaults?: { name: string; balance: number }[]
}
export interface PlaidTransaction {
  transaction_id: string; account_id: string; amount: number; iso_currency_code: 'USD'
  date: string; authorized_date: string; merchant_name: string | null; name: string; pending: boolean
  personal_finance_category: { primary: string; detailed: string; confidence_level: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' }
  /** Demo-only hint so the adapter can keep anchor semantics (e.g. prior-trip cluster). */
  _tags?: string[]
}
export interface PlaidResponse { accounts: PlaidAccount[]; transactions: PlaidTransaction[]; request_id: string }

export const accountIds = (spec: ProfileSpec) => ({
  checking: `acc_chk_${spec.accounts.masks.checking}`, savings: `acc_sav_${spec.accounts.masks.savings}`, brokerage: `acc_inv_${spec.accounts.masks.brokerage}`,
  card: (id: string) => `acc_cc_${id}`,
})

/** Plaid PFC mapping per engine spend category (mirrored in scripts/gen-data.mjs). */
export const PFC: Record<SpendCategory, { primary: string; detailed: string }> = {
  dining: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_RESTAURANT' },
  groceries: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
  transport: { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_TAXIS_AND_RIDE_SHARES' },
  shopping: { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES' },
  entertainment: { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_MUSIC_AND_AUDIO' },
  subscriptions: { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_TV_AND_MOVIES' },
  housing: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
  travel: { primary: 'TRAVEL', detailed: 'TRAVEL_FLIGHTS' },
  other: { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE' },
  income: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
  transfer: { primary: 'TRANSFER_OUT', detailed: 'TRANSFER_OUT_SAVINGS' },
}
