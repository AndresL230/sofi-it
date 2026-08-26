import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '@/store/profile'
import { Money, Num } from '@/components/Money'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { fmtDate } from '@/engine/format'
import { addMonths, daysBetween, iso, monthShort, sameMonth } from '@/lib/dates'
import { cn } from '@/lib/utils'
import type { Account, SpendCategory, Txn, UserModel } from '@/types'

const PAGE = 60
const MONTHS_BACK = 6

const CAT_LABEL: Record<SpendCategory, string> = {
  dining: 'Dining', groceries: 'Groceries', transport: 'Transport', shopping: 'Shopping', entertainment: 'Entertainment',
  subscriptions: 'Subscriptions', housing: 'Housing', travel: 'Travel', other: 'Other', income: 'Income', transfer: 'Transfers',
}

const initials = (m: string) => m.split(/[\s']/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`
const ordSuffix = (n: number) => { const s = ['th', 'st', 'nd', 'rd']; const v = n % 100; return s[(v - 20) % 10] || s[v] || s[0] }
const isSpend = (t: Txn) => t.amount > 0 && t.category !== 'transfer' && t.category !== 'income'
/** Full date for the detail view: "Wednesday, August 20, 2026". */
const fmtFull = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

function dayLabel(d: Date, now: Date): string {
  const ago = daysBetween(d, now)
  if (ago === 0) return 'Today'
  if (ago === 1) return 'Yesterday'
  return `${fmtDate(d, 'weekday')}, ${fmtDate(d, 'md')}`
}

const selectCls = 'h-11 w-full min-w-0 cursor-pointer appearance-none rounded-sm2 border-[1.5px] border-lavender bg-white pl-[14px] pr-9 text-[14px] text-ink outline-none transition-colors focus:border-teal'
function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">{label}</span>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>{children}</select>
      <span aria-hidden className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] text-slate-muted">▼</span>
    </label>
  )
}

/** Transaction row — mirrors Home's recent-transactions rows exactly (avatar, merchant, account subline, category, amount, chevron). */
function Row({ t, account, onClick }: { t: Txn; account: Account | undefined; onClick: () => void }) {
  const inflow = t.amount < 0
  return (
    <button onClick={onClick} className="flex w-full cursor-pointer items-center gap-3 border-b border-lavender-soft py-[11px] text-left transition-colors last:border-b-0 hover:bg-lavender-soft/50 focus-visible:outline-none focus-visible:bg-lavender-soft/70">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lavender text-[13px] font-bold text-slate">{initials(t.merchant)}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-bold">{t.merchant}</div>
        <div className="truncate text-[12px] text-slate-muted">{account?.name ?? 'Checking'} ··{account?.mask}<span className="sm:hidden"> · {CAT_LABEL[t.category]}</span></div>
      </div>
      <div className="hidden shrink-0 text-[12.5px] text-slate sm:block">{CAT_LABEL[t.category]}</div>
      <div className={cn('shrink-0 text-[14px] font-bold', inflow && 'text-green')}>{inflow ? '+' : '−'}<Money value={Math.abs(t.amount)} size="inline" cents="decimal" animated={false} /></div>
      <div className="shrink-0 text-slate-hair">›</div>
    </button>
  )
}

/** Detail dialog: hero, facts, two computed context lines, hand-off to the coach. */
function TxnDetail({ txn, user, now, onClose }: { txn: Txn | null; user: UserModel; now: Date; onClose: () => void }) {
  const nav = useNavigate()
  const t = txn
  const account = t ? user.accounts.find((a) => a.id === t.accountId) : undefined
  const inflow = !!t && t.amount < 0
  const spendLike = !!t && isSpend(t)

  const visitN = useMemo(() => {
    if (!t) return 0
    const y = t.date.getFullYear()
    return user.txns.filter((x) => x.merchant === t.merchant && x.date.getFullYear() === y && x.date.getTime() <= t.date.getTime()).length
  }, [t, user.txns])
  const monthCat = useMemo(() => {
    if (!t) return 0
    return user.txns.filter((x) => x.category === t.category && x.amount > 0 && sameMonth(x.date, t.date)).reduce((s, x) => s + x.amount, 0)
  }, [t, user.txns])
  const baseline = t ? user.baselines[t.category] : undefined
  const sameYear = !!t && t.date.getFullYear() === now.getFullYear()
  const thisMonth = !!t && sameMonth(t.date, now)

  return (
    <Dialog open={!!t} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent data-screen="txn-detail" className="max-h-[calc(100vh-32px)] overflow-y-auto p-0 shadow-[0_16px_48px_rgba(32,23,71,.22)]">
        {t ? (
          <>
            <div className="px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lavender text-[15px] font-bold text-slate">{initials(t.merchant)}</div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="m-0 truncate text-[17px] font-bold leading-tight text-ink">{t.merchant}</DialogTitle>
                  <DialogDescription className="m-0 mt-[2px] text-[12.5px] text-slate-muted">{fmtFull(t.date)}</DialogDescription>
                </div>
              </div>
              <div className={cn('mt-4', inflow && 'text-green')}>
                <Money value={Math.abs(t.amount)} size="lg" prefix={inflow ? '+' : '−'} />
              </div>
            </div>

            <div className="border-t border-lavender-soft px-6">
              <div className="flex items-start justify-between gap-4 border-b border-lavender-soft py-3">
                <div className="text-[12.5px] text-slate-muted">Account</div>
                <div className="min-w-0 text-right">
                  <div className="truncate text-[14px] font-semibold text-ink">{account?.name ?? 'Checking'} ··{account?.mask}</div>
                  {account ? <div className="text-[12px] capitalize text-slate-muted">{account.subtype} · {account.type}</div> : null}
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-lavender-soft py-3">
                <div className="text-[12.5px] text-slate-muted">Category</div>
                <div className="min-w-0 text-right">
                  <div className="text-[14px] font-semibold text-ink">{CAT_LABEL[t.category]}</div>
                  <div className="truncate font-mono text-[11px] text-slate-muted">{t.detailed}</div>
                </div>
              </div>
              {t.tags?.length ? (
                <div className="flex items-center justify-between gap-4 border-b border-lavender-soft py-3">
                  <div className="text-[12.5px] text-slate-muted">Tags</div>
                  <div className="flex flex-wrap justify-end gap-[6px]">{t.tags.map((tag) => <Badge key={tag} tone="gray" size="xs">{tag}</Badge>)}</div>
                </div>
              ) : null}
            </div>

            <div className="px-6 pt-4">
              <div className="rounded-sm2 bg-lavender-soft/70 px-4 py-3 text-[13px] leading-[1.5] text-slate">
                <div className="flex gap-2"><span className="mt-[7px] h-[6px] w-[6px] shrink-0 rounded-full bg-teal" /><span>Your <Num value={visitN} suffix={ordSuffix(visitN)} animated={false} /> {inflow ? 'deposit from' : 'visit to'} <b className="text-ink">{t.merchant}</b> {sameYear ? 'this year' : <>in <Num value={t.date.getFullYear()} animated={false} className="tabular-nums" /></>}.</span></div>
                {spendLike ? (
                  <div className="mt-[6px] flex gap-2"><span className="mt-[7px] h-[6px] w-[6px] shrink-0 rounded-full bg-purple" /><span><b className="text-ink">{CAT_LABEL[t.category]}</b> {thisMonth ? 'this month' : <>in {fmtDate(t.date, 'month')}</>}: <Money value={monthCat} size="inline" cents="never" animated={false} className="font-bold text-ink" />{baseline ? <> of <Money value={baseline.usual} size="inline" cents="never" animated={false} /> usual</> : null}.</span></div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-6 pt-4">
              <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
              {spendLike ? (
                <Button size="sm" onClick={() => nav(`/answer?q=${encodeURIComponent(`$${Number.isInteger(t.amount) ? t.amount : t.amount.toFixed(2)} ${t.merchant}`)}`)}>Check a similar purchase</Button>
              ) : null}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

/** S5 — every transaction, grouped by day, filterable; row → detail dialog (deep link `?tx=<id>`). */
export default function Transactions() {
  const { user, now } = useUser()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<SpendCategory | 'all'>('all')
  const [month, setMonth] = useState<string>(monthKey(now))
  const [acct, setAcct] = useState<string>('all')
  const [limit, setLimit] = useState(PAGE)

  const acctById = useMemo(() => new Map(user.accounts.map((a) => [a.id, a])), [user.accounts])
  const sorted = useMemo(() => [...user.txns].sort((a, b) => b.date.getTime() - a.date.getTime() || a.id.localeCompare(b.id)), [user.txns])
  const months = useMemo(() => Array.from({ length: MONTHS_BACK }, (_, k) => { const m = addMonths(now, -k); return { key: monthKey(m), date: m } }), [now])

  // Everything except the category filter — so the chip counts reflect what each chip would show.
  const preCat = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return sorted.filter((t) =>
      (month === 'all' || monthKey(t.date) === month) &&
      (acct === 'all' || t.accountId === acct) &&
      (!needle || t.merchant.toLowerCase().includes(needle)))
  }, [sorted, q, month, acct])
  const catCounts = useMemo(() => {
    const m = new Map<SpendCategory, number>()
    for (const t of preCat) m.set(t.category, (m.get(t.category) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [preCat])
  const filtered = useMemo(() => (cat === 'all' ? preCat : preCat.filter((t) => t.category === cat)), [preCat, cat])

  const summary = useMemo(() => {
    const byCat = new Map<SpendCategory, number>()
    let spend = 0
    for (const t of filtered) if (isSpend(t)) { spend += t.amount; byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount) }
    const top = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0]
    return { spend, count: filtered.length, top: top ? { category: top[0], total: top[1] } : null }
  }, [filtered])

  useEffect(() => { setLimit(PAGE) }, [q, cat, month, acct])
  const shown = filtered.slice(0, limit)
  const groups = useMemo(() => {
    const out: { key: string; date: Date; rows: Txn[]; total: number }[] = []
    for (const t of shown) {
      const key = iso(t.date)
      let g = out[out.length - 1]
      if (!g || g.key !== key) { g = { key, date: t.date, rows: [], total: 0 }; out.push(g) }
      g.rows.push(t)
      if (isSpend(t)) g.total += t.amount
    }
    return out
  }, [shown])

  const txId = params.get('tx')
  const selected = useMemo(() => (txId ? user.txns.find((t) => t.id === txId) ?? null : null), [txId, user.txns])
  const open = (id: string) => { const p = new URLSearchParams(params); p.set('tx', id); setParams(p) }
  const close = () => { const p = new URLSearchParams(params); p.delete('tx'); setParams(p, { replace: true }) }
  const clear = () => { setQ(''); setCat('all'); setMonth(monthKey(now)); setAcct('all') }
  const scopeLabel = month === 'all' ? 'All time' : (() => { const m = months.find((x) => x.key === month)?.date ?? now; return sameMonth(m, now) ? 'This month' : `${monthShort(m)} ${m.getFullYear()}` })()

  return (
    <div data-screen="transactions" className="mx-auto max-w-fork">
      <Link to="/" className="mb-[10px] inline-block text-[14px] font-semibold">← Insights</Link>
      <h1 className="mb-[18px] text-h1 font-bold">Transactions</h1>

      <section className="pc-card grid grid-cols-2 gap-x-3 gap-y-4 px-5 py-4 sm:grid-cols-3 sm:py-5 sm:px-6" aria-label="Summary">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-muted">Spent</div>
          <div className="mt-1"><Money value={summary.spend} size="md" cents="never" className="text-[20px] sm:text-[24px]" /></div>
          <div className="mt-[3px] truncate text-[12px] text-slate-muted">{scopeLabel}</div>
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-muted">Transactions</div>
          <div className="mt-1 text-[20px] font-extrabold leading-none tracking-[-0.01em] text-ink sm:text-[24px]"><Num value={summary.count} /></div>
          <div className="mt-[3px] truncate text-[12px] text-slate-muted">{cat === 'all' ? 'all categories' : CAT_LABEL[cat]}</div>
        </div>
        <div className="col-span-2 min-w-0 border-t border-lavender-soft pt-3 sm:col-span-1 sm:border-0 sm:pt-0">
          <div className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-muted">Top category</div>
          {summary.top ? (
            <>
              <div className="mt-1 truncate text-[20px] font-extrabold leading-none tracking-[-0.01em] text-ink sm:text-[24px]">{CAT_LABEL[summary.top.category]}</div>
              <div className="mt-[3px] text-[12px] text-slate-muted"><Money value={summary.top.total} size="inline" cents="never" /></div>
            </>
          ) : <div className="mt-1 text-[20px] font-extrabold leading-none text-slate-muted sm:text-[24px]">—</div>}
        </div>
      </section>

      <section className="pc-card mt-[14px] px-5 py-4 sm:px-6 sm:py-5" aria-label="Filters">
        <div className="grid gap-[10px] sm:grid-cols-[1fr_170px_200px]">
          <Input type="search" placeholder="Search merchants" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search merchants" />
          <Select label="Month" value={month} onChange={setMonth}>
            {months.map((m) => <option key={m.key} value={m.key}>{sameMonth(m.date, now) ? 'This month' : `${monthShort(m.date)} ${m.date.getFullYear()}`}</option>)}
            <option value="all">All months</option>
          </Select>
          <Select label="Account" value={acct} onChange={setAcct}>
            <option value="all">All accounts</option>
            {user.accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ··{a.mask}</option>)}
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-[6px]" role="group" aria-label="Category">
          <button onClick={() => setCat('all')} aria-pressed={cat === 'all'} className={cn('cursor-pointer rounded-pill px-[11px] py-[5px] text-[12px] font-semibold', cat === 'all' ? 'bg-navy text-white' : 'bg-lavender-soft text-slate hover:bg-lavender')}>All <span className={cn('font-medium', cat === 'all' ? 'text-white/70' : 'text-slate-muted')}><Num value={preCat.length} animated={false} /></span></button>
          {catCounts.map(([c, n]) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={cn('cursor-pointer rounded-pill px-[11px] py-[5px] text-[12px] font-semibold', cat === c ? 'bg-navy text-white' : 'bg-lavender-soft text-slate hover:bg-lavender')}>{CAT_LABEL[c]} <span className={cn('font-medium', cat === c ? 'text-white/70' : 'text-slate-muted')}><Num value={n} animated={false} /></span></button>
          ))}
        </div>
      </section>

      <section className="pc-card mt-[14px] px-5 pb-3 sm:px-6" aria-label="Transactions">
        {groups.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-[14.5px] font-semibold text-ink">Nothing matches.</div>
            <div className="mt-1 text-[13px] text-slate-muted">Try a different search, month or category.</div>
            <button onClick={clear} className="mt-3 cursor-pointer text-[14px] font-semibold text-teal hover:text-teal-ink">Clear filters</button>
          </div>
        ) : groups.map((g) => (
          <div key={g.key}>
            <div className="sticky top-[63px] z-10 -mx-5 flex items-center justify-between bg-white px-5 pb-[6px] pt-[14px] sm:-mx-6 sm:px-6">
              <div className="text-[12px] font-semibold uppercase tracking-[.08em] text-slate-muted">{dayLabel(g.date, now)}</div>
              {g.total > 0 ? <div className="text-[12px] text-slate-muted">−<Money value={g.total} size="inline" cents="decimal" animated={false} /></div> : null}
            </div>
            <div className="border-t border-lavender">
              {g.rows.map((t) => <Row key={t.id} t={t} account={acctById.get(t.accountId)} onClick={() => open(t.id)} />)}
            </div>
          </div>
        ))}
        {filtered.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-lavender pb-2 pt-3 text-[12.5px] text-slate-muted">
            <span>Showing <Num value={shown.length} animated={false} /> of <Num value={filtered.length} animated={false} /></span>
            {shown.length < filtered.length ? <Button variant="ghost" size="sm" onClick={() => setLimit((l) => l + PAGE)}>Show more</Button> : null}
          </div>
        ) : null}
      </section>

      <TxnDetail txn={selected} user={user} now={now} onClose={close} />
    </div>
  )
}
