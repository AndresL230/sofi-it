import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemo } from 'react'
import type { UserModel } from '@/types'
import { DEFAULT_PROFILE_ID, profileById } from '@/data/profiles'
import { NOW } from '@/data'

interface ProfileState { profileId: string; setProfile: (id: string) => void }
/** Active demo profile (persisted). Switching re-derives every screen from the new UserModel without a reload. */
export const useProfileStore = create<ProfileState>()(persist((set) => ({ profileId: DEFAULT_PROFILE_ID, setProfile: (profileId) => set({ profileId }) }), { name: 'purchase-coach-profile' }))

const cache = new Map<string, UserModel>()
/** The active profile's UserModel, built relative to NOW and memoized per profile id. */
export function useUser(): { user: UserModel; profileId: string; now: Date } {
  const profileId = useProfileStore((s) => s.profileId)
  const user = useMemo(() => {
    let u = cache.get(profileId)
    if (!u) { u = profileById(profileId).build(NOW); cache.set(profileId, u) }
    return u
  }, [profileId])
  return { user, profileId, now: NOW }
}
