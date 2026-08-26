import { useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { classify } from '@/engine/classify'
import { fallbackClassify } from '@/engine/fallbackClassifier'
import { CHIPS } from '@/engine/queries'
import { goalPill } from '@/engine/goals'
import { useGoalStore, useSession } from '@/store'
import { Rich } from '@/components/Rich'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const SHIMMER_MS = 600

/** "About to buy something?" — the only mode selector in the product is the typed query. */
export function CoachInput() {
  const nav = useNavigate()
  const goal = useGoalStore((s) => s.goal)
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
      const [c] = await Promise.all([classify(q, { signal: ctrl.signal }), new Promise((r) => setTimeout(r, SHIMMER_MS))])
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
    <section data-screen="coach-input" className="pc-card mb-[22px] px-6 py-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[19px] font-bold text-ink">About to buy something?</div>
          <div className="mt-[3px] text-[14px] text-slate">Check it before you swipe.</div>
        </div>
        <div className="flex flex-wrap items-center gap-[10px]">
          {goal ? (
            <button onClick={() => nav('/goals')} className="cursor-pointer rounded-pill bg-purple px-[13px] py-[6px] text-[12.5px] font-semibold text-white"><Rich text={goalPill(goal)} animated={false} /></button>
          ) : null}
          <button onClick={() => nav('/goals')} className="cursor-pointer text-[14px] font-semibold text-teal hover:text-teal-ink">Goals</button>
        </div>
      </div>
      <div className="relative mt-4">
        <AnimatePresence initial={false} mode="wait">
          {loading ? (
            <motion.div key="shimmer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="anim-shimmer flex h-[52px] items-center rounded-ctl px-[18px] text-[14.5px] text-slate" aria-live="polite">
              Reading your accounts…
            </motion.div>
          ) : (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex gap-[10px]">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKey} maxLength={200} placeholder='Try "$60 dinner" or "$1,200 flight to Lisbon in March"' className="h-[52px] rounded-ctl bg-[#FDFDFC] px-[18px] text-[15px]" aria-label="What are you about to buy?" />
              <Button size="lg" onClick={() => submit(query)} className="rounded-ctl">Check</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button key={c} onClick={() => submit(c)} disabled={loading && pending !== c} className="cursor-pointer rounded-pill bg-teal-tint px-[14px] py-[7px] text-[13px] font-medium text-teal transition-colors hover:bg-teal-tint2 disabled:opacity-60">{c}</button>
        ))}
      </div>
    </section>
  )
}
