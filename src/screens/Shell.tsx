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
            <div className="mb-[18px] flex flex-wrap items-end justify-between gap-4">
              <h1 className="m-0 text-h1 font-bold text-ink">My financial insights</h1>
              <div className="flex gap-[22px]">
                {[['+', 'Add'], ['⌕', 'Search'], ['⚙', 'Manage']].map(([g, l]) => (
                  <button key={l} className="cursor-pointer text-center" aria-label={l}>
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-teal text-white" style={{ fontSize: g === '+' ? 20 : 16, fontWeight: 500 }}>{g}</div>
                    <div className="mt-[5px] text-[11.5px] text-slate">{l}</div>
                  </button>
                ))}
              </div>
            </div>
            <CoachInput />
          </>
        ) : null}
        <Outlet />
      </main>
    </div>
  )
}
