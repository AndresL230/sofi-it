import { useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { classify } from '@/engine/classify'
import { fallbackClassify } from '@/engine/fallbackClassifier'
import { profileById } from '@/data/profiles'
import { useUser } from '@/store/profile'
import { goalPill } from '@/engine/goals'
import { useGoalStore, useSession } from '@/store'
import { useDemoStore } from '@/store/demo'
import { Rich } from '@/components/Rich'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const SHIMMER_MS = 600

/** "About to buy something?" — the only mode selector in the product is the typed query. */
export function CoachInput() {
  const nav = useNavigate()
  const goal = useGoalStore((s) => s.goal)
  const { profileId } = useUser()
  const chips = profileById(profileId).starters
  const { query, loading, setQuery, setLoading, setResult } = useSession()
  const [pending, setPending] = useState<string | null>(null)
  const inflight = useRef<AbortController | null>(null)

  async function submit(text: string) {
    const q = text.trim()
    if (!q || loading) return
    inflight.current?.abort()
    const ctrl = new AbortController()
    inflight.current = ctrl
    setQuery(q)
    setLoading(true)
    setPending(q)
    const started = Date.now()
    try {
      const [c] = await Promise.all([classify(q, { signal: ctrl.signal, forceFallback: useDemoStore.getState().forceFallback }), new Promise((r) => setTimeout(r, SHIMMER_MS))])
      if (ctrl.signal.aborted) return
      void started
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
    }
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') submit(query) }

  return (
    <section data-screen="coach-input" className="pc-card mb-5.5 px-6 py-5.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-metric-sm font-bold text-ink">About to buy something?</div>
          <div className="mt-[3px] text-lede text-slate">Check it before you swipe.</div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {goal ? (
            <button onClick={() => nav('/goals')} className="group cursor-pointer rounded-pill bg-purple px-3.5 py-[7px] text-left text-meta font-semibold text-white" aria-label="Open goals">
              <Rich text={goalPill(goal)} animated={false} />
              <span className="mt-[5px] block h-[3px] w-full overflow-hidden rounded-pill bg-white/30"><span className="block h-full rounded-pill bg-white" style={{ width: `${Math.min(100, Math.round((goal.saved / goal.target) * 100))}%` }} /></span>
            </button>
          ) : (
            <button onClick={() => nav('/goals')} className="cursor-pointer rounded-pill bg-purple-tint px-3.5 py-[7px] text-body font-semibold text-purple hover:bg-purple hover:text-white">✦ Set a goal</button>
          )}
          <button onClick={() => nav('/goals')} className="inline-flex min-h-6 cursor-pointer items-center rounded-sm2 px-1 text-lede font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60">Goals</button>
        </div>
      </div>
      <div className="relative mt-4">
        <AnimatePresence initial={false} mode="wait">
          {loading ? (
            <motion.div key="shimmer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="anim-shimmer flex h-[52px] items-center rounded-ctl px-4.5 text-lede text-slate" aria-live="polite">
              Reading your accounts…
            </motion.div>
          ) : (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex gap-2.5">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKey} maxLength={200} placeholder='Try "$60 dinner" or "$1,200 flight to Lisbon in March"' className="h-[52px] rounded-ctl bg-[#FDFDFC] px-4.5 text-lede" aria-label="What are you about to buy?" />
              <Button size="lg" onClick={() => submit(query)} className="rounded-ctl">Check</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button key={c} onClick={() => submit(c)} disabled={loading && pending !== c} className="cursor-pointer rounded-pill bg-teal-tint px-3.5 py-[7px] text-body font-medium text-teal transition-colors hover:bg-teal-tint2 disabled:opacity-60">{c}</button>
        ))}
      </div>
    </section>
  )
}
