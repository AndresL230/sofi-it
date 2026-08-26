import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BRAND } from '@/brand'
import { CoachInput } from './CoachInput'
import { ProfileSwitcher } from '@/demo/ProfileSwitcher'

/** Nav + the coach input card (which stays put across Home ↔ Answer, like the export). */
export function Shell() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const showInput = pathname === '/' || pathname === '/answer'
  return (
    <div className="min-h-screen bg-page">
      <div data-screen="nav" className="sticky top-0 z-20 border-b border-lavender bg-white">
        <div className="mx-auto flex max-w-shell items-center gap-4 px-4 py-3 sm:gap-5.5 sm:px-6">
          <button onClick={() => nav('/')} className="-mx-1 inline-flex min-h-6 shrink-0 cursor-pointer items-center rounded-sm2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60" aria-label={`${BRAND.wordmark} home`}>
            <img src={BRAND.logoSrc} alt="" className="h-5.5 w-auto" />
          </button>
          <div className="flex flex-1 gap-5 text-lede">
            <span className="whitespace-nowrap border-b-2 border-teal pb-0.5 font-bold text-navy">{BRAND.navSection}</span>
          </div>
          <div className="shrink-0 rounded-pill bg-purple px-3.5 py-1.5 text-body font-semibold text-white">{BRAND.plusPill}</div>
          <ProfileSwitcher />
        </div>
      </div>
      <main className="mx-auto max-w-shell px-5 pb-17.5 pt-6.5">
        {showInput ? (
          <>
            <h1 className="mb-4.5 text-h1 font-bold text-ink">My financial insights</h1>
            <CoachInput />
          </>
        ) : null}
        <Outlet />
      </main>
    </div>
  )
}
