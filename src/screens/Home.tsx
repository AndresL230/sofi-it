import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NOW } from '@/data'
import { useUser } from '@/store/profile'
import { Money, Num } from '@/components/Money'
import { addMonths, monthShort, sameMonth, startOfYear } from '@/lib/dates'
import { cn } from '@/lib/utils'

const RANGES = ['3M', '6M', 'YTD', '1Y', 'ALL'] as const
type Range = (typeof RANGES)[number]

/** S0 — Relay "My financial insights" clone with Maya's numbers (everything derived from the mock accounts + transactions). */
export function Home() {
  const [range, setRange] = useState<Range>('6M')
  const [open, setOpen] = useState<Set<string>>(new Set())
  const toggle = (k: string) => setOpen((prev) => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n })
  const { user } = useUser()
  const cash = user.accounts.filter((a) => a.type === 'depository')
  const credit = user.accounts.filter((a) => a.type === 'credit')
  const invest = user.accounts.filter((a) => a.type === 'investment')
  const sum = (xs: { balance: number }[]) => xs.reduce((s, a) => s + a.balance, 0)
  const netWorth = sum(cash) - sum(credit) + sum(invest)
  const groups = [
    { key: 'cash', label: 'Cash', accounts: cash, neg: false },
    { key: 'credit', label: 'Credit cards', accounts: credit, neg: true },
    { key: 'invest', label: 'Investments', accounts: invest, neg: false },
  ]
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
          <svg viewBox="0 0 300 72" preserveAspectRatio="none" className="mt-3 h-[72px] w-full" aria-hidden>
            <path d={path} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="mt-[10px] flex gap-[6px]">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} className={cn('cursor-pointer rounded-pill px-[11px] py-[5px] text-[12px] font-semibold', r === range ? 'bg-navy text-white' : 'bg-lavender-soft text-slate')}>{r}</button>
            ))}
          </div>
          <div className="mt-4 border-t border-lavender">
            {groups.map((g, i) => {
              const isOpen = open.has(g.key)
              return (
                <div key={g.key} className={cn(i < groups.length - 1 && 'border-b border-lavender')}>
                  <button onClick={() => toggle(g.key)} aria-expanded={isOpen} className="flex w-full cursor-pointer items-center justify-between py-[13px] text-left">
                    <span className="text-[14.5px]">{g.label} <span className="text-slate-muted">· {g.accounts.length}</span></span>
                    <span className={cn('text-[14.5px] font-bold', g.neg && 'text-red')}>{g.neg ? '−' : ''}<Money value={sum(g.accounts)} size="inline" cents="never" /> <span className={cn('inline-block text-slate-hair transition-transform', isOpen && 'rotate-90')}>›</span></span>
                  </button>
                  {isOpen ? (
                    <div className="mb-3 rounded-sm2 bg-lavender-soft/60 px-3 py-1" style={{ animation: 'fadeIn .2s both' }}>
                      {g.accounts.map((a) => {
                        const card = g.key === 'credit' ? user.cards.find((c) => c.last4 === a.mask) : undefined
                        const util = a.limit ? a.balance / a.limit : null
                        return (
                          <div key={a.id} className="border-b border-white/70 py-2 last:border-b-0">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0"><div className="truncate text-[13.5px] font-semibold">{a.name}</div><div className="text-[11.5px] text-slate-muted">{a.officialName} ··{a.mask}{card?.apr ? <> · APR <Num value={card.apr * 100} fraction={2} suffix="%" animated={false} /></> : null}</div></div>
                              <div className="shrink-0 text-right"><div className={cn('text-[13.5px] font-bold', g.neg && 'text-red')}>{g.neg ? '−' : ''}<Money value={a.balance} size="inline" cents="never" animated={false} /></div>{a.limit ? <div className="text-[11px] text-slate-muted">of <Money value={a.limit} size="inline" cents="never" animated={false} /> limit</div> : null}</div>
                            </div>
                            {util !== null ? <div className="mt-[6px] h-[4px] overflow-hidden rounded-pill bg-lavender"><div className="h-full rounded-pill" style={{ width: `${Math.min(100, util * 100)}%`, background: util > 0.3 ? 'var(--salmon)' : 'var(--teal)' }} /></div> : null}
                            {a.vaults?.length ? (
                              <div className="mt-[6px] flex flex-col gap-[3px]">
                                {a.vaults.map((v) => (
                                  <div key={v.name} className="flex items-center justify-between text-[12px] text-slate"><span><span className={cn('mr-[6px] inline-block h-[6px] w-[6px] rounded-full', /lisbon/i.test(v.name) ? 'bg-purple' : 'bg-teal')} />{v.name} vault</span><Money value={v.balance} size="inline" cents="never" animated={false} /></div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
          <button onClick={() => setOpen(open.size === groups.length ? new Set() : new Set(groups.map((g) => g.key)))} className="mt-2 inline-block cursor-pointer text-[14px] font-semibold text-teal hover:text-teal-ink">{open.size === groups.length ? 'View less' : 'View more'}</button>
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
      <div className="mt-[18px] flex justify-center gap-4 text-[12px]">
        <Link to="/gallery" className="text-slate-muted hover:text-slate">card gallery</Link>
        <Link to="/share" className="text-slate-muted hover:text-slate">share</Link>
      </div>
      <span className="sr-only"><Num value={0} animated={false} /></span>
    </>
  )
}
