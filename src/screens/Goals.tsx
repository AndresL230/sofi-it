import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NOW } from '@/data'
import { useUser } from '@/store/profile'
import { suggestedGoal, landingDate } from '@/engine/goals'
import { useGoalStore } from '@/store'
import { Money, Num } from '@/components/Money'
import { DateText } from '@/components/DateText'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/sonner'
import { addDays, daysBetween } from '@/lib/dates'

/** S4 — Goals. Empty state + one-tap suggested goal + form; goal card with progress, pace, on-track tag. */
export function Goals() {
  const { goal, setGoal, others, activate, addOther, remove } = useGoalStore()
  const { user } = useUser()
  const suggestion = suggestedGoal(user, NOW)
  const [form, setForm] = useState({ name: '', target: '', date: '', monthly: '' })

  function addFromForm() {
    const target = parseFloat(form.target.replace(/[^\d.]/g, '')) || suggestion.target
    const isLisbon = !form.name || /lisbon/i.test(form.name)
    const deadline = form.date ? new Date(form.date) : suggestion.deadline
    const weekly = form.monthly ? Math.round((parseFloat(form.monthly.replace(/[^\d.]/g, '')) || 0) * 12 / 52) : suggestion.weekly
    const created = { id: isLisbon ? 'lisbon' : `goal-${Date.now()}`, name: form.name || suggestion.name, emoji: isLisbon ? '✈' : '✦', target, saved: isLisbon ? suggestion.saved : 0, deadline: Number.isNaN(deadline.getTime()) ? suggestion.deadline : deadline, weekly: weekly || suggestion.weekly, createdAt: NOW }
    if (goal) addOther(created); else setGoal(created)
    setForm({ name: '', target: '', date: '', monthly: '' })
    toast(goal ? 'Goal added.' : 'Goal tracked.')
  }
  const lands = goal ? landingDate(goal, NOW) : null
  const onTrack = goal && lands ? lands.getTime() <= goal.deadline.getTime() : true
  const pct = goal ? Math.round((goal.saved / goal.target) * 100) : 0
  const otherGoals = [...user.seededGoals, ...others].filter((g) => g.id !== goal?.id)
  const weeksLeft = goal ? Math.max(0, Math.round(daysBetween(NOW, goal.deadline) / 7)) : 0

  return (
    <div data-screen="goals" className="max-w-quick">
      <Link to="/" className="-ml-1 mb-2.5 inline-flex min-h-6 items-center rounded-sm2 px-1 text-lede font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60">← Insights</Link>
      <h1 className="mb-4.5 text-h1 font-bold">Goals</h1>
      {goal ? (
        <section className="pc-card overflow-hidden">
          <div className="bg-purple-tint px-6.5 pb-6 pt-5.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-lede font-bold text-purple">{goal.emoji ?? '✦'} {goal.name}</div>
              <Badge tone={onTrack ? 'green' : 'salmon'} size="sm">{onTrack ? 'on track' : 'behind'}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Money value={goal.saved} size="hero" className="text-purple" />
              <span className="text-lede text-slate">of <Money value={goal.target} size="inline" cents="never" /> · <Num value={pct} suffix="%" /></span>
            </div>
            <div className="relative mt-4 h-4 overflow-hidden rounded-pill bg-white/70"><div className="absolute inset-y-0 left-0 rounded-pill bg-purple transition-[width] duration-700" style={{ width: `${pct}%` }} /></div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6.5 py-5 sm:grid-cols-4">
            <div><div className="text-caption font-semibold uppercase tracking-[.08em] text-slate-muted">Deadline</div><div className="mt-1 text-title font-bold text-ink"><DateText date={goal.deadline} /></div></div>
            <div><div className="text-caption font-semibold uppercase tracking-[.08em] text-slate-muted">Weeks left</div><div className="mt-1 text-title font-bold text-ink"><Num value={weeksLeft} /></div></div>
            <div><div className="text-caption font-semibold uppercase tracking-[.08em] text-slate-muted">Weekly pace</div><div className="mt-1 text-title font-bold text-ink"><Money value={goal.weekly} size="inline" cents="never" /></div></div>
            <div><div className="text-caption font-semibold uppercase tracking-[.08em] text-slate-muted">Lands</div><div className="mt-1 text-title font-bold text-ink">{lands ? <DateText date={lands} /> : '—'}</div></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-6.5 pb-5 text-body text-slate">
            <span><Money value={goal.target - goal.saved} size="inline" cents="never" /> to go — small purchases now check against this.</span>
            <button onClick={() => { setGoal(null); toast('Goal removed.') }} className="cursor-pointer font-semibold text-red">Stop tracking</button>
          </div>
        </section>
      ) : (
        <>
          <div className="pc-card p-5.5 text-center text-lede text-slate-muted">Nothing tracked yet.</div>
          <div className="mt-3.5 rounded-card bg-purple-tint px-6.5 py-6">
            <div className="text-caption font-semibold uppercase tracking-[.08em] text-purple">Suggested from your vault</div>
            <div className="mt-2 text-metric-sm font-bold text-purple">{suggestion.emoji ?? '✦'} {suggestion.name}</div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3"><Money value={suggestion.saved} size="lg" className="text-purple" /><span className="text-lede text-slate">already saved of <Money value={suggestion.target} size="inline" cents="never" /> by <DateText date={suggestion.deadline} animated={false} /></span></div>
            <div className="relative mt-4 h-3 overflow-hidden rounded-pill bg-white/70"><div className="absolute inset-y-0 left-0 rounded-pill bg-purple" style={{ width: `${Math.round((suggestion.saved / suggestion.target) * 100)}%` }} /></div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <span className="text-body text-slate"><Money value={suggestion.weekly} size="inline" cents="never" />/week gets you there on time.</span>
              <Button variant="purple" size="lg" onClick={() => { setGoal({ ...suggestion, createdAt: NOW }); toast(`${suggestion.name.split(' ')[0]} is now a tracked goal.`) }}>Track it</Button>
            </div>
          </div>
          <section className="pc-card mt-3.5 px-5.5 py-5">
            <div className="mb-3 text-lede font-bold">Add a goal</div>
            <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))' }}>
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Goal name" />
              <Input placeholder="Target $" inputMode="decimal" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} aria-label="Target amount" />
              <Input placeholder="Target date" type="date" min={addDays(NOW, 1).toISOString().slice(0, 10)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} aria-label="Target date" />
              <Input placeholder="Monthly $ (optional)" inputMode="decimal" value={form.monthly} onChange={(e) => setForm({ ...form, monthly: e.target.value })} aria-label="Monthly contribution" />
            </div>
            <Button className="mt-3" onClick={addFromForm}>Track goal</Button>
          </section>
        </>
      )}
      {otherGoals.length ? (
        <section className="mt-5">
          <div className="mb-2 flex items-baseline justify-between"><h2 className="text-title font-bold">Your other goals</h2><span className="text-meta text-slate-muted">only one goal checks purchases at a time</span></div>
          <div className="flex flex-col gap-3">
            {otherGoals.map((g) => {
              const p = Math.min(100, Math.round((g.saved / g.target) * 100))
              const l = landingDate(g, NOW)
              const ok = l.getTime() <= g.deadline.getTime()
              return (
                <div key={g.id} className="pc-card px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-lede font-bold text-ink">{g.emoji ?? '✦'} {g.name}</div>
                    <div className="flex items-center gap-2"><Badge tone={ok ? 'green' : 'salmon'} size="xs">{ok ? 'on track' : 'behind'}</Badge>{!g.id.startsWith('seed-') ? <button onClick={() => { remove(g.id); toast('Goal removed.') }} className="text-meta font-semibold text-red">Remove</button> : null}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-2 text-body text-slate"><Money value={g.saved} size="sm" className="text-ink" /> <span>of <Money value={g.target} size="inline" cents="never" /> · <Num value={p} suffix="%" /> · by <DateText date={g.deadline} animated={false} /> · <Money value={g.weekly} size="inline" cents="never" />/wk</span></div>
                  <div className="relative mt-3 h-2 overflow-hidden rounded-pill bg-lavender-soft"><div className="absolute inset-y-0 left-0 rounded-pill bg-purple/70" style={{ width: `${p}%` }} /></div>
                  <button onClick={() => { activate(g); toast(`Purchases now check against ${g.name.split(' ')[0]}.`) }} className="mt-3 cursor-pointer rounded-pill bg-purple-tint px-3 py-1.5 text-meta font-semibold text-purple hover:bg-purple hover:text-white">✦ Check purchases against this</button>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}
      <span className="sr-only"><Num value={pct} animated={false} /></span>
    </div>
  )
}
