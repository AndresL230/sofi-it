import { useState } from 'react'
import { Link } from 'react-router-dom'
import { USER, NOW } from '@/data'
import { suggestedGoal, landingDate } from '@/engine/goals'
import { useGoalStore } from '@/store'
import { Money, Num } from '@/components/Money'
import { DateText } from '@/components/DateText'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/sonner'
import { addDays } from '@/lib/dates'

/** S4 — Goals. Empty state + one-tap suggested goal + form; goal card with progress, pace, on-track tag. */
export function Goals() {
  const { goal, setGoal } = useGoalStore()
  const suggestion = suggestedGoal(USER, NOW)
  const [form, setForm] = useState({ name: '', target: '', date: '', monthly: '' })

  function addFromForm() {
    const target = parseFloat(form.target.replace(/[^\d.]/g, '')) || suggestion.target
    const isLisbon = !form.name || /lisbon/i.test(form.name)
    const deadline = form.date ? new Date(form.date) : suggestion.deadline
    const weekly = form.monthly ? Math.round((parseFloat(form.monthly.replace(/[^\d.]/g, '')) || 0) * 12 / 52) : suggestion.weekly
    setGoal({ id: isLisbon ? 'lisbon' : `goal-${Date.now()}`, name: form.name || suggestion.name, emoji: isLisbon ? '✈' : '✦', target, saved: isLisbon ? suggestion.saved : 0, deadline: Number.isNaN(deadline.getTime()) ? suggestion.deadline : deadline, weekly: weekly || suggestion.weekly, createdAt: NOW })
    setForm({ name: '', target: '', date: '', monthly: '' })
    toast('Goal tracked.')
  }
  const lands = goal ? landingDate(goal, NOW) : null
  const onTrack = goal && lands ? lands.getTime() <= goal.deadline.getTime() : true
  const pct = goal ? Math.round((goal.saved / goal.target) * 100) : 0

  return (
    <div data-screen="goals" className="max-w-quick">
      <Link to="/" className="mb-[10px] inline-block text-[14px] font-semibold">← Insights</Link>
      <h1 className="mb-[18px] text-h1 font-bold">Goals</h1>
      {goal ? (
        <section className="pc-card border-l-4 border-purple px-[22px] py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[16px] font-bold text-purple">{goal.emoji ?? '✦'} {goal.name}</div>
            <Badge tone={onTrack ? 'green' : 'salmon'} size="xs" className="py-[3px]">{onTrack ? 'on track' : 'behind'}</Badge>
          </div>
          <div className="relative mt-[14px] h-3 overflow-hidden rounded-pill bg-lavender-soft"><div className="absolute inset-y-0 left-0 rounded-pill bg-purple transition-[width] duration-500" style={{ width: `${pct}%` }} /></div>
          <div className="mt-2 flex justify-between text-[13px] text-slate"><span><Money value={goal.saved} size="inline" cents="never" /> of <Money value={goal.target} size="inline" cents="never" /> · vault</span><span>by <DateText date={goal.deadline} /></span></div>
          <div className="mt-[6px] text-[13px] text-slate"><Money value={goal.weekly} size="inline" cents="never" />/week keeps you on pace{lands ? <> — lands <DateText date={lands} />.</> : '.'}</div>
          <button onClick={() => { setGoal(null); toast('Goal removed.') }} className="mt-3 inline-block cursor-pointer text-[13px] font-semibold text-red">Stop tracking</button>
        </section>
      ) : (
        <>
          <div className="pc-card p-[22px] text-center text-[14.5px] text-slate-muted">Nothing tracked yet.</div>
          <div className="mt-[14px] flex flex-wrap items-center justify-between gap-[14px] rounded-card bg-purple-tint px-[22px] py-5">
            <div className="text-[14px] text-purple">
              <b>✈ {suggestion.name} — <Money value={suggestion.target} size="inline" cents="never" /> by <DateText date={suggestion.deadline} animated={false} /></b><br />
              <span className="text-[13px]"><Money value={suggestion.saved} size="inline" cents="never" /> already in your vault.</span>
            </div>
            <Button variant="purple" onClick={() => { setGoal({ ...suggestion, createdAt: NOW }); toast('Lisbon is now a tracked goal.') }}>Track it</Button>
          </div>
          <section className="pc-card mt-[14px] px-[22px] py-5">
            <div className="mb-3 text-[14px] font-bold">Add a goal</div>
            <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))' }}>
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Goal name" />
              <Input placeholder="Target $" inputMode="decimal" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} aria-label="Target amount" />
              <Input placeholder="Target date" type="date" min={addDays(NOW, 1).toISOString().slice(0, 10)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} aria-label="Target date" />
              <Input placeholder="Monthly $ (optional)" inputMode="decimal" value={form.monthly} onChange={(e) => setForm({ ...form, monthly: e.target.value })} aria-label="Monthly contribution" />
            </div>
            <Button className="mt-3" onClick={addFromForm}>Track goal</Button>
          </section>
        </>
      )}
      <span className="sr-only"><Num value={pct} animated={false} /></span>
    </div>
  )
}
