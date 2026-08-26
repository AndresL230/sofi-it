import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@/store/profile'
import { useSession } from '@/store'
import type { PaymentHabit } from '@/types'
import { PRIORITY_LABEL, utilizationLine } from '@/engine/profile'
import { CADENCE_LABEL } from '@/lib/payroll'
import { Money, Num } from '@/components/Money'
import { UtilizationBar } from '@/components/UtilizationBar'
import { toast } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { GoalsPanel } from './goals/GoalsPanel'

const EMPLOYMENT: Record<'w2' | 'variable', string> = { w2: 'W2, steady', variable: 'Variable' }
const HABITS: { value: PaymentHabit; label: string }[] = [
  { value: 'pays_in_full', label: 'I pay in full each month' },
  { value: 'revolves', label: 'I carry a balance' },
]

/**
 * S5 — "Your financial picture". Two columns, side by side, with different edit permissions:
 * zone A is context the product already has (read-only but for one toggle), zone B is the thing the
 * user authors. Zone B renders the same GoalsPanel as /goals — same save flow, unchanged. They sit
 * next to each other rather than stacked so there is nothing to switch between: both are the page.
 */
export function Profile() {
  const { user, habit, setHabit } = useUser()
  const fp = user.financialProfile
  const lastQuery = useSession((s) => s.lastQuery)

  const lines = user.cards.filter((c) => c.limit !== null)
  const owed = lines.reduce((a, c) => a + c.balance, 0)
  const limit = lines.reduce((a, c) => a + (c.limit ?? 0), 0)
  const used = limit > 0 ? owed / limit : 0
  const line = utilizationLine(fp)

  function choose(next: PaymentHabit) {
    if (next === habit) return
    setHabit(next)
    toast(next === 'revolves' ? 'Ranking by what a purchase costs, not what it earns.' : 'Ranking by rewards again.')
  }

  return (
    <div data-screen="profile">
      <Link to="/" className="-ml-1 mb-2.5 inline-flex min-h-6 items-center rounded-sm2 px-1 text-lede font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60">← Insights</Link>
      <h1 className="mb-6.5 text-h1 font-bold">Your financial picture</h1>

      {/* The same auto-fit grid Home uses, so the product's two two-column screens share a measure. */}
      <div className="grid items-start gap-5.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))' }}>

      {/* ---------- Zone A — what SoFi it already knows ---------- */}
      <section data-zone="profile">
        <ZoneHead
          title="Financial profile"
          dot="var(--teal)"
          lede="What SoFi it already reads on every answer — the context that turns a card multiplier or a utilization percentage into advice that is right for you."
        />
        <div className="pc-card px-6 py-5.5">
          <dl>
            <Row label="Income">
              <Money value={fp.annualIncome} size="lg" cents="never" />
              <Sub>
                {CADENCE_LABEL[fp.payCadence]} · <Money value={fp.netPerCheck} size="inline" cents="never" animated={false} /> per check
              </Sub>
            </Row>

            <Row label="Employment">
              <span className="text-title font-bold text-ink">{EMPLOYMENT[fp.employmentType]}</span>
            </Row>

            <Row label="Credit posture">
              <span className="text-title font-bold text-ink"><Num value={Math.round(used * 100)} suffix="%" /> used</span>
              <Sub>
                <Money value={owed} size="inline" cents="never" animated={false} /> of <Money value={limit} size="inline" cents="never" animated={false} /> in limits
              </Sub>
              <UtilizationBar used={used} threshold={line} height={6} className="mt-2 w-full" />
              {fp.creditEvent ? (
                /* Informational, not a verdict and not a goal — navy on lavender, deliberately purple-free. */
                <div className="mt-2.5 inline-flex max-w-full items-center gap-2 rounded-pill bg-lavender-soft px-3 py-1.5 text-meta font-semibold text-navy">
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                  <span className="min-w-0">
                    {fp.creditEvent.label} · <Num value={fp.creditEvent.monthsAway} animated={false} /> {fp.creditEvent.monthsAway === 1 ? 'month' : 'months'} out
                  </span>
                </div>
              ) : null}
            </Row>

            <Row label="What you optimize for">
              <span className="text-title font-bold text-ink">{PRIORITY_LABEL[fp.priority]}</span>
              <Sub>breaks a close call, never a real gap</Sub>
            </Row>

            <Row label="SoFi member since" last>
              <span className="text-title font-bold text-ink">{fp.memberSince}</span>
            </Row>
          </dl>

          {/* The one editable control. */}
          <div className="mt-5">
            <div className="text-caption font-semibold uppercase tracking-[.1em] text-slate-muted">How you pay your cards</div>
            <div role="radiogroup" aria-label="How you pay your cards" className="mt-2 flex gap-1.5 rounded-ctl bg-lavender-soft p-1">
              {HABITS.map((h) => {
                const on = habit === h.value
                return (
                  <button
                    key={h.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => choose(h.value)}
                    className={cn(
                      'min-h-9 flex-1 cursor-pointer rounded-sm2 px-3 py-2 text-body font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-1',
                      on ? 'bg-teal text-white' : 'text-slate hover:text-teal-ink',
                    )}
                  >
                    {h.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2.5 text-body leading-relaxed text-slate">
              {habit === 'revolves'
                ? 'Carrying a balance makes interest cost outweigh rewards, so SoFi it ranks cards by what a purchase actually costs rather than what it earns.'
                : 'Paying in full means rewards are the whole story. Switch this and SoFi it ranks cards by what a purchase actually costs instead — interest first, points second.'}
            </p>
            {lastQuery ? (
              <Link to={`/answer?q=${encodeURIComponent(lastQuery)}`} className="mt-2 inline-flex min-h-6 items-center rounded-sm2 text-lede font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60">
                Re-run “{lastQuery}” <span aria-hidden>→</span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* ---------- Zone B — what you author ---------- */}
      <section data-zone="goals">
        <ZoneHead
          title="Goals"
          dot="var(--purple)"
          lede="Yours to write. Add one and small purchases start checking against it — this is the half of the picture SoFi it can’t read for you."
        />
        <GoalsPanel />
      </section>

      </div>
    </div>
  )
}

/**
 * Column header. Deliberately a caps label rather than an h2: two h2s under the page headline read as
 * two separate mini-pages, and at this size they fight the h1 for the same job. The dot carries the
 * zone's colour — teal for what the product knows, purple for what the user writes.
 */
function ZoneHead({ title, dot, lede }: { title: string; dot: string; lede: string }) {
  return (
    <div className="mb-3">
      <h2 className="flex items-center gap-2 text-caption font-semibold uppercase tracking-[.1em] text-slate">
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
        {title}
      </h2>
      <p className="mt-1.5 max-w-[46ch] text-body leading-relaxed text-slate">{lede}</p>
    </div>
  )
}

/** Label left in slate, value right in near-black. */
function Row({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-x-6 gap-y-1 py-3.5', !last && 'border-b border-lavender')}>
      <dt className="text-lede text-slate">{label}</dt>
      <dd className="m-0 flex min-w-0 flex-col items-end text-right">{children}</dd>
    </div>
  )
}
const Sub = ({ children }: { children: ReactNode }) => <span className="mt-1 text-meta text-slate">{children}</span>

export default Profile
