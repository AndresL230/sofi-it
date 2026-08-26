import type { Affordability, CarryingCost, CreditCardRule, EventCost, PaymentOption, PointsOffset, QueryFacts, Runway, UserModel } from './types'
import { addDays, addMonths, startOfDay } from '@/lib/dates'
import { money, num } from './format'
import { BRAND } from '@/brand'

/** The card a purchase would realistically ride: highest known APR among real credit lines that can (nearly) hold it. Charge cards can't carry a balance. */
export function rideCard(amount: number, user: UserModel): CreditCardRule {
  const known = user.cards.filter((c) => c.apr !== null && c.limit !== null)
  const fits = known.filter((c) => (c.limit as number) - c.balance >= amount * 0.95)
  return [...(fits.length ? fits : known)].sort((a, b) => (b.apr ?? 0) - (a.apr ?? 0))[0] ?? user.cards[0]
}

/** Standard amortized payment. */
export function amortizedPayment(principal: number, apr: number, months: number): number {
  const r = apr / 12
  if (r === 0) return principal / months
  return (principal * r) / (1 - Math.pow(1 + r, -months))
}

/** Three ways to pay: cash / personal loan / ride the highest-APR card that can hold it. Bar heights are proportional to total. */
export function paymentOptions(amount: number, user: UserModel): PaymentOption[] {
  const loanMonthly = amortizedPayment(amount, user.loan.apr, user.loan.termMonths)
  const loanTotal = Math.round(loanMonthly * user.loan.termMonths)
  const card = rideCard(amount, user)
  const cardMonthly = amortizedPayment(amount, card.apr ?? 0, 12)
  const cardTotal = Math.round(cardMonthly * 12)
  const opts: PaymentOption[] = [
    { key: 'cash', label: 'Cash now', total: amount, monthly: null, note: ['gone today, ', money(0), ' extra'], apr: null, months: null, winner: false },
    { key: 'loan', label: BRAND.loan, total: loanTotal, monthly: Math.round(loanMonthly), note: [num(user.loan.termMonths), ' mo · ', num(user.loan.apr * 100, { fraction: 2, suffix: '%' }), ' · ', money(Math.round(loanMonthly)), '/mo'], apr: user.loan.apr, months: user.loan.termMonths, winner: false },
    { key: 'card', label: 'Ride the card', total: cardTotal, monthly: Math.round(cardMonthly), note: [card.name.replace('Chase ', '').replace(' Unlimited', ''), ' ', num((card.apr ?? 0) * 100, { fraction: 2, suffix: '%' }), ' · a year to clear'], apr: card.apr, months: 12, winner: false, cardName: card.name },
  ]
  const min = Math.min(...opts.map((o) => o.total))
  return opts.map((o) => ({ ...o, winner: o.total === min }))
}

/** Interest stacking month by month if it rides the card and only minimums get paid. */
export function carryingCost(amount: number, user: UserModel, now: Date, months = 3, cardOverride?: CreditCardRule): CarryingCost {
  const card = cardOverride ?? rideCard(amount, user)
  let bal = amount
  const rows = []
  let total = 0
  for (let i = 1; i <= months; i++) {
    const interest = bal * ((card.apr ?? 0) / 12)
    const minPay = Math.max(25, bal * 0.02)
    total += interest
    rows.push({ label: addMonths(now, i).toLocaleDateString('en-US', { month: 'short' }), date: addMonths(now, i), balance: Math.round(bal), interest: Math.round(interest * 100) / 100 })
    bal = bal + interest - minPay
  }
  return { card, months: rows, totalInterest: Math.round(total) }
}

/** Points & credits that can shrink a big purchase (travel only for transfer partners). */
export function pointsOffset(user: UserModel, q: QueryFacts): PointsOffset {
  const rows: PointsOffset['rows'] = []
  if (q.category === 'travel') {
    const ur = user.points.find((p) => p.program === 'UR')
    if (ur) rows.push({ label: `${ur.balance.toLocaleString('en-US')} ${ur.label} → ${ur.transferPartner}`, value: Math.min(q.amount, Math.round((ur.balance * ur.transferValueCents) / 100 / 10) * 10) })
    const diningCredits = user.cards.flatMap((c) => c.credits.filter((cr) => cr.perMonth))
    const remainingThisQuarter = 2
    diningCredits.forEach((cr) => rows.push({ label: `${cr.label.replace('credit', 'credits')} ×${remainingThisQuarter} this quarter`, value: cr.amount * remainingThisQuarter }))
    const hotel = user.cards.flatMap((c) => c.credits.filter((cr) => cr.category === 'travel'))
    hotel.forEach((cr) => rows.push({ label: cr.label, value: cr.amount }))
  }
  const off = rows.reduce((a, r) => a + r.value, 0)
  return { rows, outOfPocket: Math.max(0, q.amount - off), amount: q.amount }
}

/** The iceberg: the flight is the tip; the trip runs `ratio`× the flight based on the prior trip. */
export function eventCost(user: UserModel, amount: number): EventCost {
  const t = user.priorTrip
  const around = t.around.stay + t.around.food + t.around.local
  const ratio = Math.round(((t.flight + around) / t.flight) * 10) / 10
  const rest = amount * (ratio - 1)
  const stay = Math.round((rest * t.around.stay) / around / 10) * 10
  const food = Math.round((rest * t.around.food) / around / 10) * 10
  const local = Math.round((rest * t.around.local) / around / 10) * 10
  return { flight: amount, ratio, stay, food, local, allIn: Math.round((amount + stay + food + local) / 50) * 50 }
}

/** When a large purchase becomes affordable in full, at pace and with a redirect. */
export function affordability(user: UserModel, q: QueryFacts, rw: Runway, points: PointsOffset, now: Date, weeklyPace = 125): Affordability {
  const availableNow = Math.max(0, rw.room - rw.cushion)
  const shortfall = Math.max(0, q.amount - availableNow)
  const weeksAtPace = shortfall / weeklyPace
  const affordableInFull = addDays(startOfDay(now), Math.ceil(weeksAtPace * 7))
  const redirectSources = user.redirectPlan.map((r) => ({ label: user.baselines[r.category].label.toLowerCase(), from: user.baselines[r.category].usual, to: r.to }))
  const redirectMonthly = redirectSources.reduce((a, r) => a + Math.max(0, r.from - r.to), 0)
  const accelerated = addDays(startOfDay(now), Math.ceil((shortfall / (weeklyPace + (redirectMonthly * 12) / 52)) * 7))
  const paydays: Date[] = []
  for (let d = user.payroll.nextPayday; d <= affordableInFull; d = addDays(d, user.payroll.intervalDays)) paydays.push(d)
  const outOfPocket = points.outOfPocket
  const affordableWithPoints = addDays(startOfDay(now), Math.ceil((Math.max(0, outOfPocket - availableNow) / weeklyPace) * 7))
  return { availableNow, shortfall, weeklyPace, affordableInFull, redirectMonthly, redirectSources, accelerated, paydays, outOfPocket, affordableWithPoints }
}
