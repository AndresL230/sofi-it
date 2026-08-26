import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { useUser } from '@/store/profile'
import { PROFILES, profileById } from '@/data/profiles'
import { ProfileList, useSelectProfile } from './ProfileList'

const LONG_PRESS_MS = 450

/**
 * Top-right nav avatar. Click (Enter/Space) cycles to the next profile with a quiet toast;
 * hover / long-press / ArrowDown opens a popover listing every profile.
 */
export function ProfileSwitcher() {
  const { profileId } = useUser()
  const profile = profileById(profileId)
  const { select, cycle } = useSelectProfile()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<number>()
  const pressTimer = useRef<number>()
  const longPressed = useRef(false)

  const show = (delay: number) => { window.clearTimeout(hoverTimer.current); hoverTimer.current = window.setTimeout(() => setOpen(true), delay) }
  const hide = (delay: number) => { window.clearTimeout(hoverTimer.current); hoverTimer.current = window.setTimeout(() => setOpen(false), delay) }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown) }
  }, [open])
  useEffect(() => () => { window.clearTimeout(hoverTimer.current); window.clearTimeout(pressTimer.current) }, [])

  const onClick = () => {
    if (longPressed.current) { longPressed.current = false; return }
    window.clearTimeout(hoverTimer.current)
    setOpen(false)
    cycle()
  }
  const onKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true) }
  }
  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse') return
    window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => { longPressed.current = true; setOpen(true) }, LONG_PRESS_MS)
  }
  const cancelPress = () => window.clearTimeout(pressTimer.current)
  const pick = (id: string) => { setOpen(false); select(id) }
  const title = PROFILES.length > 1 ? `${profile.name} — click to switch profile` : `${profile.name} — click to switch profile (more profiles arrive with the addendum)`

  return (
    <div ref={root} className="relative shrink-0" onMouseEnter={() => show(120)} onMouseLeave={() => hide(220)}>
      <button
        type="button"
        data-demo="avatar"
        aria-label="Switch profile"
        aria-haspopup="listbox"
        aria-expanded={open}
        title={title}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onPointerLeave={cancelPress}
        onContextMenu={(e) => { if (longPressed.current) e.preventDefault() }}
        className="flex h-9 w-9 shrink-0 cursor-pointer select-none items-center justify-center rounded-full bg-navy text-[13px] font-bold text-white transition-shadow hover:shadow-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2"
      >
        {profile.initials}
      </button>
      {open ? (
        <div data-demo="profile-popover" className="pc-card absolute right-0 top-[calc(100%+10px)] z-30 w-[300px] p-2 motion-safe:[animation:popIn_.16s_ease-out_both]" style={{ transformOrigin: 'top right' }}>
          <div className="flex items-baseline justify-between px-3 pb-1 pt-[6px]">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate">Profile</span>
            <span className="text-[11px] text-slate-muted">click the avatar to cycle</span>
          </div>
          <ProfileList onSelect={pick} />
        </div>
      ) : null}
    </div>
  )
}
