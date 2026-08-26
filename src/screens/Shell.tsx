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
        <div className="mx-auto flex max-w-shell items-center gap-4 px-4 py-[13px] sm:gap-[22px] sm:px-6">
          <button onClick={() => nav('/')} className="shrink-0 cursor-pointer text-[20px] font-extrabold tracking-[-0.03em] text-navy" aria-label={`${BRAND.wordmark} home`}>
            {BRAND.wordmark}<span className="text-teal">.</span>
          </button>
          <div className="flex flex-1 gap-5 text-[14px]">
            <span className="whitespace-nowrap border-b-2 border-teal pb-[2px] font-bold text-navy">{BRAND.navSection}</span>
          </div>
          <div className="shrink-0 rounded-pill bg-purple px-[15px] py-[7px] text-[13px] font-semibold text-white">{BRAND.plusPill}</div>
          <ProfileSwitcher />
        </div>
      </div>
      <main className="mx-auto max-w-shell px-5 pb-[70px] pt-[26px]">
        {showInput ? (
          <>
            <h1 className="mb-[18px] text-h1 font-bold text-ink">My financial insights</h1>
            <CoachInput />
          </>
        ) : null}
        <Outlet />
      </main>
    </div>
  )
}
