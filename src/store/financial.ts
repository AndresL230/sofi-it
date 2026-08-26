import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PaymentHabit } from '@/types'

interface FinancialState {
  /** paymentHabit override per profile id — the one user-editable field on /profile. */
  habits: Record<string, PaymentHabit>
  setHabit: (profileId: string, habit: PaymentHabit) => void
  clear: (profileId: string) => void
}

/**
 * Live edits to the financial profile. Keyed by profile id so a toggle survives a profile switch
 * as well as a reload, and persisted alongside the profile selection.
 */
export const useFinancialStore = create<FinancialState>()(
  persist(
    (set) => ({
      habits: {},
      setHabit: (profileId, habit) => set((s) => ({ habits: { ...s.habits, [profileId]: habit } })),
      clear: (profileId) => set((s) => { const habits = { ...s.habits }; delete habits[profileId]; return { habits } }),
    }),
    { name: 'purchase-coach-financial' },
  ),
)
