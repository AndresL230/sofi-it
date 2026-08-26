import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BRAND } from '@/brand'
import { NOW } from '@/data'
import { CHOREOGRAPHY, MATRIX_QUERIES } from '@/engine/queries'
import { CARD_METAS } from '@/cards'
import { suggestedGoal } from '@/engine/goals'
import { fmtDate } from '@/engine/format'
import { useDemoStore } from '@/store/demo'
import { useGoalStore, useSession } from '@/store'
import { useProfileStore, useUser } from '@/store/profile'
import { PROFILES } from '@/data/profiles'
import { Money } from '@/components/Money'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { ProfileList, useSelectProfile } from './ProfileList'
import { TimeTravel } from './TimeTravel'
import { Classifier } from './Classifier'
import { Inspector } from './Inspector'
import { BentoExamples, SpanTable } from './BentoExamples'
import { Caption, Mini, Section } from './ui'

const STORAGE_KEYS = ['purchase-coach-goals', 'purchase-coach-profile', 'purchase-coach-demo']
/** Expected beat under each choreography step (index-aligned with CHOREOGRAPHY). */
const BEATS: ReactNode[] = [
  <>Fine — merchant punch card</>,
  <>Fine — split the check, credit expiring</>,
  <>Plan — iceberg; tap <b>Track Lisbon as a goal</b> on the page</>,
  <><b>Flips to Tight</b> — goal chip, Lisbon −2 days</>,
  <><b>Goal collision</b> slider</>,
]
const TRACK_STEP = 2 // step 3 (0-based) is where the goal gets tracked
const PANEL_W = 360
const answerUrl = (q: string) => `/answer?q=${encodeURIComponent(q)}`

/** Navigate to an answer and mirror the query into the coach input. */
function useAsk() {
  const nav = useNavigate()
  return useCallback((q: string) => { useSession.getState().setQuery(q); nav(answerUrl(q)) }, [nav])
}
/** One-click "Track Lisbon" — the active profile's suggested goal (Lisbon for Maya), stamped with the app clock. */
function useSuggestedGoal() {
  const { user } = useUser()
  const setGoal = useGoalStore((s) => s.setGoal)
  const suggestion = useMemo(() => suggestedGoal(user, NOW), [user])
  const short = suggestion.name.split(' ')[0]
  const track = useCallback(() => { setGoal({ ...suggestion, createdAt: NOW }); toast(`${short} is now a tracked goal.`) }, [suggestion, setGoal, short])
  return { track, short }
}
const isSheet = () => window.innerWidth < 640

/** Floating "✦ Demo" pill + the right-side control panel (the clicker for the live demo). */
export default function DemoPanel() {
  const open = useDemoStore((s) => s.open)
  const setOpen = useDemoStore((s) => s.setOpen)
  const forceFallback = useDemoStore((s) => s.forceFallback)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, setOpen])
  // Desktop: push the app left by the panel width so the nav (avatar, Plus pill) and the right column stay reachable.
  useEffect(() => {
    if (!open) return
    const apply = () => { document.body.style.paddingRight = isSheet() ? '' : `${PANEL_W}px` }
    apply()
    window.addEventListener('resize', apply)
    return () => { window.removeEventListener('resize', apply); document.body.style.paddingRight = '' }
  }, [open])

  return (
    <>
      <button
        type="button"
        data-demo="pill"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="demo-panel"
        aria-label={open ? 'Close demo controls' : 'Open demo controls'}
        className={cn('fixed bottom-4 right-4 z-[60] flex h-11 cursor-pointer items-center gap-[7px] rounded-pill bg-navy px-4.5 text-lede font-semibold text-white shadow-pop transition-[filter,transform,right] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 active:scale-[.98]', open && 'sm:right-[376px]')}
      >
        <span aria-hidden className="text-body">✦</span>
        <span>Demo</span>
        {forceFallback ? <span data-demo="pill-dot" title="keyword fallback forced" className="ml-0.5 h-2 w-2 rounded-full bg-gold" /> : null}
      </button>
      {open ? <Panel forceFallback={forceFallback} close={() => setOpen(false)} /> : null}
    </>
  )
}

function Panel({ close, forceFallback }: { close: () => void; forceFallback: boolean }) {
  const { select } = useSelectProfile()
  const { user } = useUser()
  const inspector = useDemoStore((s) => s.inspector)
  const goal = useGoalStore((s) => s.goal)
  const ask = useAsk()
  const onFlash = () => { if (isSheet()) close() }
  const keptCount = inspector ? inspector.stack.cards.length : 0

  return (
    <aside
      id="demo-panel"
      data-demo="panel"
      role="dialog"
      aria-label="Demo controls"
      className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-[-8px_0_32px_rgba(32,23,71,.12)] motion-safe:animate-in motion-safe:slide-in-from-right motion-safe:duration-300 sm:w-[var(--demo-w)] sm:border-l sm:border-lavender"
      style={{ '--demo-w': `${PANEL_W}px` } as CSSProperties}
    >
      <header className="flex shrink-0 items-center justify-between border-b border-lavender px-5 py-3">
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-lede text-teal">✦</span>
          <span className="text-lede font-bold text-navy">Demo controls</span>
          {forceFallback ? <Badge tone="gold" size="xs">fallback forced</Badge> : null}
        </div>
        <button type="button" data-demo="close" onClick={close} aria-label="Close demo controls" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-metric-sm leading-none text-slate transition-colors hover:bg-lavender-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50">×</button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-20">
        <Section id="profile" title="Profile" aside={`${user.persona.firstName} · ${user.persona.city}`}>
          <div className="-mx-3"><ProfileList onSelect={(id) => { select(id); if (isSheet()) close() }} /></div>
        </Section>

        <Section id="walkthrough" title="Walkthrough" aside="5 steps">
          <Walkthrough ask={ask} />
        </Section>

        <Section id="matrix" title="Nine matrix queries" aside={inspector ? `showing ${inspector.path}` : undefined}>
          <div className="grid grid-cols-3 gap-1.5">
            {MATRIX_QUERIES.map((m) => {
              const on = inspector?.query === m.q
              return (
                <button
                  key={m.path}
                  type="button"
                  data-demo={`matrix-${m.path}`}
                  aria-pressed={on}
                  onClick={() => { ask(m.q); if (isSheet()) close() }}
                  title={m.q}
                  className={cn('min-h-[44px] cursor-pointer rounded-sm2 px-2 py-1.5 text-center text-meta font-medium leading-[1.25] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50', on ? 'bg-teal text-white' : 'bg-teal-tint text-teal hover:bg-teal-tint2')}
                >
                  {m.q}
                </button>
              )
            })}
          </div>
        </Section>

        <Section id="bento" title="Bento layouts" aside="7 examples">
          <BentoExamples ask={(q) => { ask(q); if (isSheet()) close() }} />
        </Section>

        <Section id="spans" title="Card span ranges" collapsible defaultOpen={false} aside={`${CARD_METAS.length} cards`}>
          <SpanTable />
        </Section>

        <Section id="goal" title="Goal" aside={goal ? undefined : 'none'}>
          <GoalRow />
        </Section>

        <Section id="time" title="Time travel">
          <TimeTravel />
        </Section>

        <Section id="classifier" title="Classifier">
          <Classifier open />
        </Section>

        <Section id="inspector" title="Card inspector" collapsible defaultOpen={false} aside={inspector ? `${keptCount} cards · ${inspector.path}` : 'no answer'}>
          <Inspector onFlash={onFlash} />
        </Section>

        <Section id="pages" title="Pages">
          <Pages onNavigate={() => { if (isSheet()) close() }} />
        </Section>

        <Section id="reset" title="Reset">
          <ResetRow />
        </Section>
        <p className="px-5 pt-3 text-caption text-slate-muted">Esc closes · the pill toggles this panel on every page.</p>
      </div>
    </aside>
  )
}

function Walkthrough({ ask }: { ask: (q: string) => void }) {
  const step = useDemoStore((s) => s.choreoStep)
  const setStep = useDemoStore((s) => s.setChoreoStep)
  const goal = useGoalStore((s) => s.goal)
  const { track, short } = useSuggestedGoal()
  const profileId = useProfileStore((s) => s.profileId)
  const scriptedFor = PROFILES[0]
  const [blocked, setBlocked] = useState(false)
  useEffect(() => { if (goal) setBlocked(false) }, [goal])

  const last = CHOREOGRAPHY.length - 1
  const go = (i: number) => { setBlocked(false); setStep(i); ask(CHOREOGRAPHY[i]) }
  const next = () => {
    if (step === null) return go(0)
    if (step === TRACK_STEP && !goal) { setBlocked(true); return }
    if (step < last) go(step + 1)
  }
  const prev = () => { if (step !== null && step > 0) go(step - 1) }
  const stop = () => { setStep(null); setBlocked(false) }

  return (
    <div>
      {profileId !== scriptedFor.id ? <Caption className="mb-2 rounded-sm2 bg-lavender-soft px-2 py-1.5 text-slate">Scripted for {scriptedFor.name} — the beats assume her accounts; switch profile above to follow along exactly.</Caption> : null}
      <ol className="m-0 list-none space-y-0.5 p-0">
        {CHOREOGRAPHY.map((q, i) => {
          const on = step === i
          const done = step !== null && i < step
          return (
            <li key={i}>
              <button
                type="button"
                data-demo={`step-${i + 1}`}
                aria-current={on ? 'step' : undefined}
                onClick={() => go(i)}
                className={cn('flex w-full cursor-pointer items-start gap-3 rounded-ctl px-2 py-[7px] text-left transition-colors hover:bg-lavender-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50', on && 'bg-teal-tint hover:bg-teal-tint')}
              >
                <span className={cn('mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-caption font-bold', on ? 'bg-teal text-white' : done ? 'bg-teal-tint2 text-teal-ink' : 'bg-lavender-soft text-slate')}>{done ? '✓' : i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-body font-semibold leading-tight', on ? 'text-teal-ink' : 'text-ink')}>{q}</span>
                  <span className="mt-0.5 block text-meta leading-snug text-slate">{BEATS[i]}</span>
                </span>
              </button>
              {i === TRACK_STEP ? (
                <div className={cn('ml-[44px] mr-2 mt-0.5 flex items-center justify-between gap-2 rounded-sm2 px-2 py-1.5 text-meta', blocked ? 'bg-salmon-tint text-salmon-ink' : 'text-slate')}>
                  {goal ? <span className="font-medium text-purple">✓ {goal.name} is tracked</span> : <span>{blocked ? 'track the goal on step 3 first' : 'or track it from here'}</span>}
                  {goal ? null : <Mini tone="purple" data-demo="track-lisbon" onClick={track} className="h-7 px-2.5 text-meta">Track {short}</Mini>}
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>
      <div className="mt-3 flex flex-wrap gap-2">
        {step === null ? (
          <Mini tone="teal" data-demo="start" onClick={() => go(0)}>▶ Start</Mini>
        ) : (
          <>
            <Mini tone="ghost" data-demo="prev" onClick={prev} disabled={step === 0} aria-label="Previous step">‹ Prev</Mini>
            <Mini tone="teal" data-demo="next" onClick={next} disabled={step >= last} aria-label="Next step">Next ›</Mini>
            <Mini tone="ghost" data-demo="stop" onClick={stop} className="ml-auto">Stop</Mini>
          </>
        )}
      </div>
    </div>
  )
}

function GoalRow() {
  const goal = useGoalStore((s) => s.goal)
  const setGoal = useGoalStore((s) => s.setGoal)
  const { track, short } = useSuggestedGoal()
  return (
    <div className="flex items-center justify-between gap-3">
      {goal ? (
        <div className="min-w-0 rounded-sm2 bg-purple-tint px-3 py-2">
          <div className="truncate text-lede font-bold text-purple">{goal.emoji ?? '✦'} {goal.name}</div>
          <div className="text-meta text-slate"><Money value={goal.saved} size="inline" cents="never" animated={false} /> of <Money value={goal.target} size="inline" cents="never" animated={false} /> · by {fmtDate(goal.deadline)}</div>
        </div>
      ) : (
        <div className="text-body text-slate-muted">No goal tracked — small purchases won't check against anything.</div>
      )}
      <div className="flex shrink-0 gap-2">
        {goal ? (
          <Mini tone="ghost" data-demo="clear-goal" onClick={() => { setGoal(null); toast('Goal removed.') }}>Clear goal</Mini>
        ) : (
          <Mini tone="purple" data-demo="goal-track" onClick={track}>Track {short}</Mini>
        )}
      </div>
    </div>
  )
}

function Pages({ onNavigate }: { onNavigate: () => void }) {
  const host = (() => { try { return new URL(BRAND.publicUrl).host } catch { return BRAND.publicUrl } })()
  const copy = async () => {
    try { await navigator.clipboard.writeText(BRAND.publicUrl); toast('Copied the production URL.') } catch { toast('Copy failed — the URL is ' + BRAND.publicUrl) }
  }
  const link = 'flex h-9 items-center justify-between rounded-sm2 px-3 text-body font-semibold text-teal transition-colors hover:bg-teal-tint hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50'
  return (
    <div className="-mx-3">
      <Link to="/" className={link} onClick={onNavigate}>Home <span className="text-caption font-normal text-slate-muted">/</span></Link>
      <Link to="/gallery" className={link} onClick={onNavigate}>Card gallery <span className="text-caption font-normal text-slate-muted">/gallery</span></Link>
      <Link to="/goals" className={link} onClick={onNavigate}>Goals <span className="text-caption font-normal text-slate-muted">/goals</span></Link>
      <a href="/share" target="_blank" rel="noreferrer" className={link}>Share / QR <span className="text-caption font-normal text-slate-muted">/share · new tab ↗</span></a>
      <div className="mt-2 flex items-center justify-between gap-2 rounded-sm2 bg-lavender-soft px-3 py-2">
        <a href={BRAND.publicUrl} target="_blank" rel="noreferrer" className="min-w-0 truncate text-body font-semibold text-navy hover:text-teal-ink" title={BRAND.publicUrl}>{host}</a>
        <Mini tone="outline" onClick={copy} className="h-7 px-2.5 text-meta">Copy</Mini>
      </div>
    </div>
  )
}

function ResetRow() {
  const [armed, setArmed] = useState(false)
  const doReset = () => {
    STORAGE_KEYS.forEach((k) => localStorage.removeItem(k))
    useSession.getState().reset()
    window.location.assign('/')
  }
  return (
    <div className="space-y-2">
      {armed ? (
        <div className="flex items-center justify-between gap-2 rounded-sm2 bg-red-tint px-3 py-2">
          <span className="text-meta font-medium text-red-ink">Clear goal, profile and demo state?</span>
          <div className="flex shrink-0 gap-2">
            <Mini tone="ghost" onClick={() => setArmed(false)} className="h-7 px-2.5 text-meta">Cancel</Mini>
            <Mini tone="danger" data-demo="reset-confirm" onClick={doReset} className="h-7 px-2.5 text-meta">Yes, reset</Mini>
          </div>
        </div>
      ) : (
        <Mini tone="ghost" data-demo="reset" onClick={() => setArmed(true)}>Reset demo data…</Mini>
      )}
      <Caption>Clears the tracked goal, the active profile and this panel's settings, then reloads Home on the real clock.</Caption>
    </div>
  )
}
