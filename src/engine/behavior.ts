import type { CreditItem, DuplicateFind, ImpulseHistory, MerchantHabit, QueryFacts, RankedCard, SubscriptionView, Txn, UserModel } from './types'
import { daysBetween, sameMonth, startOfYear } from '@/lib/dates'

const MERCHANT_HINT: Record<string, string> = { coffee: 'Blue Bottle Coffee', latte: 'Blue Bottle Coffee', espresso: 'Blue Bottle Coffee', lunch: 'Sweetgreen', salad: 'Sweetgreen' }

export function merchantHabit(user: UserModel, q: QueryFacts, now: Date): MerchantHabit | null {
  const hint = q.merchant ?? Object.entries(MERCHANT_HINT).find(([k]) => q.normalized.toLowerCase().includes(k))?.[1] ?? (q.category === 'coffee' ? 'Blue Bottle Coffee' : null)
  if (!hint) return null
  const key = hint.toLowerCase()
  const visits = user.txns.filter((t) => t.amount > 0 && t.merchant.toLowerCase().startsWith(key.split(' ').slice(0, 2).join(' ')))
  if (!visits.length) return null
  const thisMonth = visits.filter((t) => sameMonth(t.date, now))
  const ytd = visits.filter((t) => t.date >= startOfYear(now))
  const ytdSpend = Math.round(ytd.reduce((a, t) => a + t.amount, 0))
  return { merchant: visits[0].merchant.replace(' Coffee', ''), visitsThisMonth: thisMonth.length, ytdSpend, ytdVisits: ytd.length, avgTicket: ytd.length ? ytdSpend / ytd.length : 0 }
}

/** Quarter dot-strip: discretionary buys ≥ $40 in this spend category over the trailing 13 weeks. */
export function impulseHistory(user: UserModel, q: QueryFacts, now: Date): ImpulseHistory {
  const weeks = 13
  const threshold = q.spendCategory === 'shopping' ? 75 : q.spendCategory === 'entertainment' ? 40 : 50
  const past = user.txns
    .filter((t) => t.amount >= threshold && t.category === q.spendCategory && !t.tags?.includes('trip') && daysBetween(t.date, now) >= 0 && daysBetween(t.date, now) < weeks * 7)
    .map((t) => ({ txn: t, weekIndex: weeks - 1 - Math.floor(daysBetween(t.date, now) / 7) }))
  return { weeks, past, todayWeekIndex: weeks - 1, countThisQuarter: past.length }
}

/** A similar-category buy in the last 90 days (prefers a tagged twin, e.g. sneakers vs running shoes). */
export function duplicateFind(user: UserModel, q: QueryFacts, now: Date): DuplicateFind | null {
  const cands = user.txns.filter((t) => t.category === q.spendCategory && t.amount >= 50 && daysBetween(t.date, now) >= 1 && daysBetween(t.date, now) <= 90 && !t.tags?.includes('trip'))
  if (!cands.length) return null
  const words = q.thing.toLowerCase().split(/\s+/)
  const twin = cands.find((t) => t.tags?.some((tag) => words.some((w) => tag.includes(w) || w.includes(tag)) || (q.category === 'shopping_apparel' && tag === 'apparel'))) ?? cands.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
  const label = twin.tags?.includes('sneakers') ? 'running sneakers' : twin.tags?.includes('boots') ? 'boots' : twin.merchant
  return { prior: twin, weeksAgo: Math.max(1, Math.round(daysBetween(twin.date, now) / 7)), label, thisLabel: q.thing || 'these' }
}

export function subscriptionView(user: UserModel, q: QueryFacts): SubscriptionView {
  const rows = user.subscriptions
  const total = Math.round(rows.reduce((a, s) => a + s.price, 0) * 100) / 100
  const totalYearAgo = Math.round(rows.reduce((a, s) => a + s.priceYearAgo, 0) * 100) / 100
  const raises = rows.filter((s) => s.raisedAtMonth !== null && s.price !== s.priceYearAgo).map((s) => ({ name: s.name, delta: Math.round((s.price - s.priceYearAgo) * 100) / 100, monthIndex: s.raisedAtMonth! }))
  const monthly = Array.from({ length: 12 }, (_, i) => Math.round(rows.reduce((a, s) => a + (s.raisedAtMonth !== null && i >= s.raisedAtMonth ? s.price : s.priceYearAgo), 0) * 100) / 100)
  const isRecurring = q.frequency === 'recurring'
  const newTotal = Math.round((total + (isRecurring ? q.amount : 0)) * 100) / 100
  let overlap: SubscriptionView['overlap'] = null
  if (isRecurring && q.serviceName) {
    const covers = user.serviceCatalog[q.serviceName.toLowerCase()] ?? []
    const mine = rows.filter((s) => s.covers.some((c) => covers.includes(c) && c !== 'streaming' && c !== 'tv'))
    const shared = Array.from(new Set(mine.flatMap((s) => s.covers.filter((c) => covers.includes(c) && c !== 'streaming' && c !== 'tv'))))
    if (mine.length && shared.length) overlap = { mine: mine.map((s) => s.name), candidate: q.serviceName, shared }
  }
  return { rows, total, totalYearAgo, raises, monthly, newTotal, overlap }
}

export function unusedCredits(user: UserModel, now: Date): CreditItem[] {
  return user.cards.flatMap((c) => c.credits.map((cr) => ({ label: cr.label, amount: cr.amount, expires: cr.expires, daysLeft: daysBetween(now, cr.expires), cardName: c.name, category: cr.category })))
}

/** Three shields, chosen by category; inapplicable ones render ghosted. */
export function benefitsFor(ranking: RankedCard[], q: QueryFacts) {
  const withDays = (key: keyof RankedCard['card']['benefits']) => ranking.filter((r) => !r.disqualified).map((r) => ({ r, v: r.card.benefits[key] })).filter((x) => x.v).sort((a, b) => Number(b.v) - Number(a.v))[0]
  const pp = withDays('purchaseProtectionDays'), rp = withDays('returnProtectionDays'), ew = withDays('extendedWarrantyYears'), tp = withDays('tripProtection')
  const electronics = q.category === 'shopping_electronics'
  const travel = q.category === 'travel'
  const shields = [
    { key: 'purchase', label: `Purchase protection · ${pp ? pp.r.card.name.replace('Chase ', '') : 'n/a'}`, days: pp ? Number(pp.v) : null, active: !!pp, cardName: pp?.r.card.name ?? '' },
    electronics
      ? { key: 'warranty', label: `Extended warranty · ${ew ? ew.r.card.name.replace('Chase ', '') : 'n/a'}`, days: ew ? Number(ew.v) * 365 : null, active: !!ew, cardName: ew?.r.card.name ?? '' }
      : { key: 'return', label: `Return protection · ${rp ? rp.r.card.name.replace('Chase ', '') : 'n/a'}`, days: rp ? Number(rp.v) : null, active: !!rp, cardName: rp?.r.card.name ?? '' },
    travel
      ? { key: 'trip', label: `Trip protection · ${tp ? tp.r.card.name.replace('Chase ', '') : 'n/a'}`, days: null, active: !!tp, cardName: tp?.r.card.name ?? '' }
      : electronics
        ? { key: 'return', label: `Return protection · ${rp ? rp.r.card.name.replace('Chase ', '') : 'n/a'}`, days: rp ? Number(rp.v) : null, active: !!rp, cardName: rp?.r.card.name ?? '' }
        : { key: 'warranty', label: 'Extended warranty · n/a', days: null, active: false, cardName: '' },
  ]
  return shields
}

export const txnsThisMonthBy = (txns: Txn[], now: Date) => txns.filter((t) => sameMonth(t.date, now))
