import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NOW } from '@/data'
import { useUser } from '@/store/profile'
import { fmtDate } from '@/engine/format'
import { addMonths, endOfMonth, iso, startOfMonth } from '@/lib/dates'
import { Badge } from '@/components/ui/badge'
import { Caption, Mini } from './ui'

/** `?now=` is read once at module load (src/data/index.ts), so every jump is a full page load on the current route. */
export function TimeTravel() {
  const { user } = useUser()
  const { search } = useLocation()
  const override = new URLSearchParams(search).get('now')
  const [date, setDate] = useState(iso(NOW))

  const travel = (d: string | null) => {
    const u = new URL(window.location.href)
    if (d) u.searchParams.set('now', d)
    else u.searchParams.delete('now')
    window.location.assign(u.toString())
  }
  const quick: [string, string | null][] = [
    ['Today (real)', null],
    ['Next payday', iso(user.payroll.nextPayday)],
    ['The 1st', iso(startOfMonth(addMonths(NOW, 1)))],
    ['Month end', iso(endOfMonth(NOW))],
    ['+6 months', iso(addMonths(NOW, 6))],
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] text-slate-muted">The app thinks today is</div>
          <div data-demo="now" className="text-[15px] font-bold text-ink">{fmtDate(NOW, 'weekdayLong')}, {fmtDate(NOW)}, {NOW.getFullYear()}</div>
        </div>
        <Badge tone={override ? 'gold' : 'gray'} size="xs">{override ? 'overridden' : 'real clock'}</Badge>
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (date) travel(date) }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Travel to date"
          className="h-8 min-w-0 flex-1 rounded-sm2 border-[1.5px] border-lavender bg-white px-2 text-[13px] text-ink outline-none focus:border-teal"
        />
        <Mini tone="teal" type="submit" disabled={!date}>Go</Mini>
      </form>
      <div className="flex flex-wrap gap-[6px]">
        {quick.map(([label, d]) => (
          <Mini key={label} onClick={() => travel(d)} className="h-7 px-[10px] text-[12px]" title={d ?? 'remove ?now'} disabled={!d && !override}>{label}</Mini>
        ))}
      </div>
      <Caption>Time travel reloads the page — paydays, paces and every date re-derive from the new clock.</Caption>
    </div>
  )
}
