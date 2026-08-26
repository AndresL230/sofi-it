import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemo } from 'react'
import type { PaymentHabit, UserModel } from '@/types'
import { DEFAULT_PROFILE_ID, profileById } from '@/data/profiles'
import { NOW } from '@/data'
import { useFinancialStore } from './financial'

interface ProfileState { profileId: string; setProfile: (id: string) => void }
/** Active demo profile (persisted). Switching re-derives every screen from the new UserModel without a reload. */
export const useProfileStore = create<ProfileState>()(persist((set) => ({ profileId: DEFAULT_PROFILE_ID, setProfile: (profileId) => set({ profileId }) }), { name: 'purchase-coach-profile' }))

const cache = new Map<string, UserModel>()
/**
 * The active profile's UserModel, built relative to NOW and memoized per profile id.
 * The one user-editable financial-profile field (paymentHabit) is layered on top, so flipping the
 * toggle produces a new UserModel identity and every open answer recomposes from it.
 */
export function useUser(): { user: UserModel; profileId: string; now: Date; habit: PaymentHabit; setHabit: (h: PaymentHabit) => void } {
  const profileId = useProfileStore((s) => s.profileId)
  const override = useFinancialStore((s) => s.habits[profileId])
  const setHabitFor = useFinancialStore((s) => s.setHabit)
  const base = useMemo(() => {
    let u = cache.get(profileId)
    if (!u) { u = profileById(profileId).build(NOW); cache.set(profileId, u) }
    return u
  }, [profileId])
  const user = useMemo(
    () => (override && override !== base.financialProfile.paymentHabit ? { ...base, financialProfile: { ...base.financialProfile, paymentHabit: override } } : base),
    [base, override],
  )
  return { user, profileId, now: NOW, habit: user.financialProfile.paymentHabit, setHabit: (h) => setHabitFor(profileId, h) }
}
