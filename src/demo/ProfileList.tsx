import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PROFILES, profileById } from '@/data/profiles'
import { useProfileStore } from '@/store/profile'
import { useSession } from '@/store'
import { toast } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

/** Ghosted placeholders while only one profile exists (Devon and Priya arrive with the addendum). */
const COMING = [{ name: 'Devon', initials: 'D' }, { name: 'Priya', initials: 'P' }]

/** Select (or cycle) the active profile: swap the store, drop the session, go Home so the numbers visibly change. */
export function useSelectProfile() {
  const nav = useNavigate()
  const setProfile = useProfileStore((s) => s.setProfile)
  const select = useCallback((id: string) => {
    const p = profileById(id)
    setProfile(p.id)
    useSession.getState().reset()
    nav('/')
    toast(`Now viewing ${p.name}`)
  }, [nav, setProfile])
  const cycle = useCallback(() => {
    const i = PROFILES.findIndex((p) => p.id === useProfileStore.getState().profileId)
    select(PROFILES[(i + 1) % PROFILES.length].id)
  }, [select])
  return { select, cycle }
}

/** Every profile with initials, name and blurb; the active one ticked. Shared by the nav popover and the panel. */
export function ProfileList({ onSelect }: { onSelect: (id: string) => void }) {
  const active = useProfileStore((s) => s.profileId)
  return (
    <ul role="listbox" aria-label="Profiles" className="m-0 list-none p-0">
      {PROFILES.map((p) => {
        const on = p.id === active
        return (
          <li key={p.id} role="option" aria-selected={on}>
            <button
              type="button"
              data-profile={p.id}
              onClick={() => onSelect(p.id)}
              className={cn('flex w-full cursor-pointer items-center gap-3 rounded-ctl px-3 py-2 text-left transition-colors hover:bg-lavender-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50', on && 'bg-teal-tint hover:bg-teal-tint')}
            >
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold', on ? 'bg-navy text-white' : 'bg-lavender text-slate')}>{p.initials}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold leading-tight text-ink">{p.name}</span>
                <span className="mt-[2px] block text-[12px] leading-snug text-slate">{p.blurb}</span>
              </span>
              <span aria-hidden className={cn('w-4 shrink-0 text-center text-[14px] font-bold text-teal', !on && 'invisible')}>✓</span>
            </button>
          </li>
        )
      })}
      {PROFILES.length === 1 ? (
        <>
          {COMING.map((c) => (
            <li key={c.name} aria-disabled className="flex items-center gap-3 px-3 py-2 opacity-50">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-lavender-deep text-[12px] font-bold text-slate-muted">{c.initials}</span>
              <span className="text-[14px] font-semibold text-slate">{c.name}</span>
            </li>
          ))}
          <li className="px-3 pb-1 pt-[2px] text-[11px] text-slate-muted">profiles arrive with the addendum</li>
        </>
      ) : null}
    </ul>
  )
}
