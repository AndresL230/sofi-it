import { useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { classify } from '@/engine/classify'
import { fallbackClassify } from '@/engine/fallbackClassifier'
import { profileById } from '@/data/profiles'
import { useUser } from '@/store/profile'
import { goalPill } from '@/engine/goals'
import { useGoalStore, useSession } from '@/store'
import { useDemoStore } from '@/store/demo'
import { BRAND } from '@/brand'
import { Rich } from '@/components/Rich'
import { Input } from '@/components/ui/input'
import { AnswerSkeleton, skeletonShape, type SkeletonShape } from '@/motion/AnswerSkeleton'
import { SofiItButton } from '@/components/SofiItButton'

/**
 * Floor on the classify state. The moment doesn't read below about half a second, so a cache hit
 * or the keyword classifier still gets the full beat. There is deliberately NO ceiling: a slow
 * call just keeps sweeping. It never becomes a spinner, a progress bar or an error state.
 */
export const SHIMMER_MS = 600

/** "About to buy something?" — the only mode selector in the product is the typed query. */
export function CoachInput() {
  const nav = useNavigate()
  const goal = useGoalStore((s) => s.goal)
  const { profileId } = useUser()
  const chips = profileById(profileId).starters
  const { query, loading, setQuery, setLoading, setResult } = useSession()
  const [pending, setPending] = useState<string | null>(null)
  /** The shape the answer is going to take, read off the local parse so the skeleton can morph
   *  on the same frame as the press instead of waiting for the classifier. Presentation only. */
  const [shape, setShape] = useState<SkeletonShape | null>(null)
  const inflight = useRef<AbortController | null>(null)
  /** Debounce. `loading` lives in a store and is read through a closure, so ten taps inside one
   *  tick could all see it false; this ref flips synchronously before the first await. */
  const locked = useRef(false)

  async function submit(text: string) {
    const q = text.trim()
    if (!q || locked.current) return
    locked.current = true
    inflight.current?.abort()
    const ctrl = new AbortController()
    inflight.current = ctrl
    setQuery(q)
    setShape(skeletonShape(fallbackClassify(q)))
    setLoading(true)
    setPending(q)
    try {
      const [c] = await Promise.all([classify(q, { signal: ctrl.signal, forceFallback: useDemoStore.getState().forceFallback }), new Promise((r) => setTimeout(r, SHIMMER_MS))])
      if (ctrl.signal.aborted) return
      setResult(q, c)
      nav(`/answer?q=${encodeURIComponent(q)}`)
    } catch {
      // classify() already degrades to the keyword classifier internally; this is the last line of
      // defence so a thrown error can never strand the shimmer. setResult also flips loading to false.
      const c = fallbackClassify(q)
      setResult(q, c)
      nav(`/answer?q=${encodeURIComponent(q)}`)
    } finally {
      setPending(null)
      locked.current = false
    }
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') void submit(query) }

  return (
    <>
      <section data-screen="coach-input" className="pc-card mb-5.5 px-6 py-5.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-metric-sm font-bold text-ink">About to buy something?</div>
            <div className="mt-[3px] text-lede text-slate">Check it before you swipe.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {goal ? (
              <button onClick={() => nav('/profile')} className="group cursor-pointer rounded-pill bg-purple px-3.5 py-[7px] text-left text-meta font-semibold text-white" aria-label="Open goals">
                <Rich text={goalPill(goal)} animated={false} />
                <span className="mt-[5px] block h-[3px] w-full overflow-hidden rounded-pill bg-white/30"><span className="block h-full rounded-pill bg-white" style={{ width: `${Math.min(100, Math.round((goal.saved / goal.target) * 100))}%` }} /></span>
              </button>
            ) : (
              <button onClick={() => nav('/profile')} className="cursor-pointer rounded-pill bg-purple-tint px-3.5 py-[7px] text-body font-semibold text-purple hover:bg-purple hover:text-white">✦ Set a goal</button>
            )}
            <button onClick={() => nav('/profile')} className="inline-flex min-h-6 cursor-pointer items-center rounded-sm2 px-1 text-lede font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60">Profile</button>
          </div>
        </div>
        {/* Continuity from input to answer is the query simply STAYING PUT: the real input keeps
            its own box, its own border and its own text for the whole classify beat — it just stops
            accepting edits. An earlier version crossfaded it to a tinted overlay carrying the same
            sweep as the skeleton; it read as the input glitching and dropping. The sweep belongs to
            the skeleton below and to nothing inside this card. */}
        <div className="mt-4 flex gap-2.5">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            maxLength={200}
            readOnly={loading}
            placeholder='Try "$60 dinner" or "$1,200 flight to Lisbon in March"'
            className="h-[52px] rounded-ctl bg-[#FDFDFC] px-4.5 text-lede"
            aria-label="What are you about to buy?"
          />
          <SofiItButton label={BRAND.checkCta} busyLabel="Reading…" busy={loading} onPress={() => void submit(query)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button key={c} onClick={() => void submit(c)} disabled={loading && pending !== c} className="cursor-pointer rounded-pill bg-teal-tint px-3.5 py-[7px] text-body font-medium text-teal transition-colors hover:bg-teal-tint2 disabled:opacity-60">{c}</button>
          ))}
        </div>
        <p role="status" aria-live="polite" className="sr-only">{loading ? `Checking ${query} against your accounts. One moment.` : ''}</p>
      </section>
      {loading && shape ? <AnswerSkeleton shape={shape} /> : null}
    </>
  )
}
