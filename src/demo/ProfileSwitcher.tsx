/** Stub — the demo agent replaces this with the top-right avatar that cycles/picks profiles. */
import { useUser } from '@/store/profile'
import { profileById } from '@/data/profiles'
export function ProfileSwitcher() {
  const { profileId } = useUser()
  return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-[13px] font-bold text-white" aria-label="Account">{profileById(profileId).initials}</div>
}
