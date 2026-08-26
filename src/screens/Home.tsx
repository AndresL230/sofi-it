import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { USER, NOW } from '@/data'
import { Money, Num } from '@/components/Money'
import { addMonths, monthShort, sameMonth, startOfYear } from '@/lib/dates'
import { cn } from '@/lib/utils'

const RANGES = ['3M', '6M', 'YTD', '1Y', 'ALL'] as const
type Range = (typeof RANGES)[number]

/** S0 — Relay "My financial insights" clone with Maya's numbers (everything derived from the mock accounts + transactions). */
export function Home() {
  const [range, setRange] = useState<Range>('6M')
  const user = USER
  const cash = user.accounts.filter((a) => a.type === 'depository')
  const credit = user.accounts.filter((a) => a.type === 'credit')
  const invest = user.accounts.filter((a) => a.type === 'investment')
  const sum = (xs: { balance: number }[]) => xs.reduce((s, a) => s + a.balance, 0)
  const netWorth = sum(cash) - sum(credit) + sum(invest)
  const history = user.netWorthHistory
  const sixMonthDelta = netWorth - (history[history.length - 7]?.value ?? netWorth)

  const points = useMemo(() => {
    const n = range === '3M' ? 4 : range === '6M' ? 7 : range === '1Y' ? 13 : range === 'YTD' ? Math.max(2, NOW.getMonth() + 2) : 13
    const slice = history.slice(-n)
    const vals = slice.map((p) => p.value)
    const min = Math.min(...vals), max = Math.max(...vals)
    const W = 300, H = 72, pad = 6
    return vals.map((v, i) => [ (i / (vals.length - 1)) * W, pad + (1 - (v - min) / Math.max(1, max - min)) * (H - pad * 2) ] as const)
  }, [range, history])
  const path = useMemo(() => {
    if (points.length < 2) return ''
    let d = `M${points[0][0]},${points[0][1]}`
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1], [x1, y1] = points[i]
      const cx = (x0 + x1) / 2
      d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`
    }
    return d
  }, [points])

  const spendTx = user.txns.filter((t) => t.amount > 0 && t.category !== 'transfer' && t.category !== 'income')
  const mtd = spendTx.filter((t) => sameMonth(t.date, NOW)).reduce((s, t) => s + t.amount, 0)
  const months = [3, 2, 1, 0].map((k) => { const m = addMonths(NOW, -k); return { label: monthShort(m), total: spendTx.filter((t) => sameMonth(t.date, m)).reduce((s, t) => s + t.amount, 0), current: k === 0 } })
  const maxMonth = Math.max(...months.map((m) => m.total))
  const recent = spendTx.slice(0, 4)
  const initials = (m: string) => m.split(/[\s']/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const CAT_LABEL: Record<string, string> = { dining: 'Dining', groceries: 'Groceries', transport: 'Transport', shopping: 'Shopping', entertainment: 'Entertainment', subscriptions: 'Subscriptions', housing: 'Housing', travel: 'Travel', other: 'Other' }
  void startOfYear

  return (
    <>
      <div data-screen="home" className="grid gap-[22px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))' }}>
        <section className="pc-card p-6">
          <div className="text-[15px] font-semibold text-slate">Net worth</div>
          <div className="mt-[6px]"><Money value={netWorth + 0.06} size="hero" /></div>
          <div className="mt-[2px] text-[13px] font-semibold text-green">▲ <Money value={sixMonthDelta} size="inline" cents="never" /> past 6 months</div>
          <svg viewBox="0 0 300 72" className="mt-3 h-[72px] w-full" aria-hidden>
            <path d={path} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="mt-[10px] flex gap-[6px]">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} className={cn('cursor-pointer rounded-pill px-[11px] py-[5px] text-[12px] font-semibold', r === range ? 'bg-navy text-white' : 'bg-lavender-soft text-slate')}>{r}</button>
            ))}
          </div>
          <div className="mt-4 border-t border-lavender">
            {[
              { label: 'Cash', n: cash.length, v: sum(cash), neg: false },
              { label: 'Credit cards', n: credit.length, v: sum(credit), neg: true },
              { label: 'Investments', n: invest.length, v: sum(invest), neg: false },
            ].map((row, i, arr) => (
              <div key={row.label} className={cn('flex items-center justify-between py-[13px]', i < arr.length - 1 && 'border-b border-lavender')}>
                <span className="text-[14.5px]">{row.label} <span className="text-slate-muted">· {row.n}</span></span>
                <span className={cn('text-[14.5px] font-bold', row.neg && 'text-red')}>{row.neg ? '−' : ''}<Money value={row.v} size="inline" cents="never" /> <span className="text-hair text-slate-hair">›</span></span>
              </div>
            ))}
          </div>
          <a className="mt-2 inline-block cursor-pointer text-[14px] font-semibold">View more</a>
        </section>
        <section className="pc-card p-6">
          <div className="text-[15px] font-semibold text-slate">Spending</div>
          <div className="mt-[6px]"><Money value={mtd} size="hero" /></div>
          <div className="mt-[2px] text-[13px] text-slate">this month so far</div>
          <div className="mt-[14px] flex h-[88px] items-end gap-[14px]">
            {months.map((m) => (
              <div key={m.label} className="flex-1 text-center">
                <div className="rounded-[8px]" style={{ height: `${Math.max(8, (m.total / maxMonth) * 74)}px`, background: m.current ? 'var(--teal)' : 'var(--teal-pale)' }} />
                <div className={cn('mt-[5px] text-[11.5px]', m.current ? 'font-semibold text-navy' : 'text-slate-muted')}>{m.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-[14px] border-t border-lavender">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center gap-3 border-b border-lavender-soft py-[11px]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lavender text-[13px] font-bold text-slate">{initials(t.merchant)}</div>
                <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-bold">{t.merchant}</div><div className="text-[12px] text-slate-muted">{user.accounts.find((a) => a.id === t.accountId)?.name ?? 'Checking'} ··{user.accounts.find((a) => a.id === t.accountId)?.mask}</div></div>
                <div className="shrink-0 text-[12.5px] text-slate">{CAT_LABEL[t.category]}</div>
                <div className="shrink-0 text-[14px] font-bold">−<Money value={t.amount} size="inline" cents="decimal" animated={false} /></div>
                <div className="shrink-0 text-slate-hair">›</div>
              </div>
            ))}
          </div>
          <a className="mt-[10px] inline-block cursor-pointer text-[14px] font-semibold">View all transactions</a>
        </section>
      </div>
      <div className="mt-[18px] text-center"><Link to="/gallery" className="text-[12px] text-slate-muted hover:text-slate">card gallery</Link></div>
      <span className="sr-only"><Num value={0} animated={false} /></span>
    </>
  )
}
