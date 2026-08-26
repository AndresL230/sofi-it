import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useUser } from '@/store/profile'
import { buildContext } from '@/engine/context'
import { compose, explain } from '@/engine/composer'
import { layoutRows, itemFor } from '@/engine/layout'
import { useDemoStore } from '@/store/demo'
import { classify } from '@/engine/classify'
import { fallbackClassify } from '@/engine/fallbackClassifier'
import { NON_PURCHASE_REPLY } from '@/engine/queries'
import type { CardType, Classification, EngineContext } from '@/engine/types'
import { useGoalStore, useSession } from '@/store'
import { CARDS, CARD_METAS } from '@/cards'
import { DelayProvider } from '@/cards/kit'
import type { CardActions } from '@/types'
import { toast } from '@/components/ui/sonner'
import { AnswerSkeleton, skeletonShape } from '@/motion/AnswerSkeleton'
import { VerdictCelebration, shouldCelebrate } from '@/motion/celebration'
import { CardSheen } from '@/motion/CardSheen'
import { CountUpProvider } from '@/motion/reveal'
import { CARD_STAGGER_CAP_MS, CARD_STAGGER_MS, CROSSFADE, LAND_SPRING, LEAD_HOLD_MS } from '@/motion/tokens'
import { cn } from '@/lib/utils'

/** The answer is a composed stack — never a fixed template. Layout adapts to the stack's size class. */
export function Answer() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const nav = useNavigate()
  const session = useSession()
  const { goal, setGoal } = useGoalStore()
  const [local, setLocal] = useState<Classification | null>(null)
  const { user, now } = useUser()
  const classification = session.lastQuery === q ? session.classification : local

  useEffect(() => {
    if (!q) { nav('/', { replace: true }); return }
    if (session.lastQuery === q && session.classification) return
    let alive = true
    classify(q, { forceFallback: useDemoStore.getState().forceFallback })
      .then((c) => { if (alive) { setLocal(c); session.setResult(q, c) } })
      .catch(() => { if (alive) { const c = fallbackClassify(q); setLocal(c); session.setResult(q, c) } })
    return () => { alive = false }
  }, [q])

  const ctx = useMemo<EngineContext | null>(() => (classification && classification.is_purchase ? buildContext(classification, goal, user, now) : null), [classification, goal, user, now])
  const stack = useMemo(() => (ctx ? compose(ctx, CARD_METAS) : null), [ctx])
  const setInspector = useDemoStore((s) => s.setInspector)
  useEffect(() => {
    if (!ctx || !stack) { setInspector(null); return }
    const ex = explain(ctx, CARD_METAS)
    setInspector({ query: q, path: ex.path, rows: ex.rows, stack, ctx })
    // Demo mode mirrors the score table to the console, with the profile effects (including any
    // priority tie-break) alongside it, so the selection is inspectable without the panel open.
    if (useDemoStore.getState().open) {
      console.groupCollapsed(`SoFi it · ${q} · ${ex.path}`)
      console.table(ex.rows.map((r) => ({ card: r.id, kind: r.kind, score: r.score, kept: r.kept, why: r.reason })))
      console.table(ctx.profileEffects.map((e) => ({ profileEffects: e.key, applied: e.label, detail: e.detail })))
      if (ctx.ranking.tieBreak) console.log('priority tie-break:', ctx.ranking.tieBreak)
      console.groupEnd()
    }
    return () => setInspector(null)
  }, [ctx, stack, q, setInspector])

  const actions: CardActions = useMemo(() => ({
    toast: (m) => toast(m),
    goHome: () => { session.reset(); nav('/') },
    trackGoal: (g) => { setGoal(g); toast(`${g.name.split(' ')[0]} is now a tracked goal — small purchases will check against it.`); session.reset(); nav('/') },
    remindLater: (when) => toast(`I'll re-run this ${when} morning.`),
  }), [nav, setGoal, session])

  // ---------- Beat 3: the reveal ----------
  // Nothing about the reveal is held as state up here. Both the sheen and the celebration own
  // their own timers inside their own components: a flag on this screen would re-render all seven
  // cards partway through their entrance, which measurably cost the reveal its frame budget on a
  // throttled phone. This screen just says whether the celebration is armed, and where.
  const reduced = useReducedMotion()
  const leadRef = useRef<HTMLDivElement>(null)
  const revealKey = `${q}|${goal?.id ?? 'nogoal'}|${goal?.saved ?? 0}`

  // A deep link straight to /answer classifies here; it gets the same skeleton the press does.
  if (!classification) return <AnswerSkeleton shape={skeletonShape(fallbackClassify(q))} />
  if (!classification.is_purchase) {
    return (
      <div data-screen="answer" className="max-w-quick">
        <Link to="/" className="-ml-1 mb-3.5 inline-flex min-h-6 items-center rounded-sm2 px-1 text-lede font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60" onClick={() => session.reset()}>← Insights</Link>
        <div className="pc-card px-5 py-4.5" style={{ animation: 'riseIn .45s both' }}>
          <div className="text-title font-bold text-ink">{NON_PURCHASE_REPLY}</div>
          <div className="mt-1 text-lede text-slate">I only check purchases — a thing plus a price, and I'll read your accounts.</div>
        </div>
      </div>
    )
  }
  if (!ctx || !stack) return null

  // Every layout goes through the bento. `quick` used to bypass it for a single 640px column,
  // which left small-purchase answers as one tall stack of full-width cards with the rest of the
  // shell empty beside them. It keeps its narrower measure — the row engine pairs cards inside it.
  const bento = true
  const maxW = stack.layout === 'quick' ? 'max-w-plan' : ''
  const rows = bento ? layoutRows(stack.cards.map(itemFor)) : null

  return (
    <div data-screen="answer" data-path={stack.path} className={maxW}>
      <Link to="/" className="-ml-1 mb-3.5 inline-flex min-h-6 items-center rounded-sm2 px-1 text-lede font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60" onClick={() => session.reset()}>← Insights</Link>
      {rows ? (
        <div key={revealKey} className="flex flex-col gap-4">
          {rows.map((row, r) => {
            // A row whose cards cap out below 12 columns is centred, so a lone width-capped card
            // (payment_fork, total_cost_of_event…) sits in the middle rather than hugging the left.
            const used = row.items.reduce((a, x) => a + x.span, 0)
            const offset = Math.max(0, Math.floor((12 - used) / 2))
            return (
              <div key={r} className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-12" data-row={row.items.map((x) => `${(x.stack ?? [x.id]).join('+')}:${x.span}`).join(' ')}>
                {row.items.map((x, i) => (
                  <div
                    key={x.id}
                    className="flex min-w-0 flex-col gap-4 md:[grid-column:var(--start)_/_span_var(--span)] [&>*]:flex-[1_1_auto] [&>*]:min-h-fit"
                    style={{ ['--span' as string]: x.span, ['--start' as string]: i === 0 ? offset + 1 : 'auto' }}
                  >
                    {(x.stack ?? [x.id]).map((id) => renderCard(id, stack.cards.indexOf(id)))}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        <div key={revealKey} className="flex flex-col gap-3.5">{stack.cards.map((type, i) => renderCard(type, i))}</div>
      )}
      {/* Not a card: one slate line naming the three inputs, with the new one linked. No layout change, no cap effect. */}
      <p className="mt-4 text-body text-slate">
        Based on your accounts, spending, and <Link to="/profile" className="rounded-sm2 font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60">financial profile</Link>.
      </p>
      {import.meta.env.DEV ? <div className="mt-3 text-caption text-slate-muted">path: {stack.path} · {stack.cards.length} cards · source: {classification.source}{stack.dropped.length ? ` · dropped: ${stack.dropped.join(', ')}` : ''}</div> : null}
      <VerdictCelebration
        // Prefixed: the card stack below already keys off revealKey, and two siblings sharing a
        // key is undefined behaviour in React — it may drop one of them.
        key={`celebrate:${revealKey}`}
        armed={!reduced && shouldCelebrate(ctx.verdict, { cards: stack.cards, goalDaysPushed: ctx.goalImpact?.daysPushed ?? 0 })}
        targetRef={leadRef}
      />
    </div>
  )

  function renderCard(type: CardType, i: number) {
    const mod = CARDS[type]
    const props = mod.select(ctx!)
    const Comp = mod.Component
    const bare = mod.meta.bare
    // The anchor — verdict_banner on every layout that has one, plan_header on a large purchase.
    // It lands first, on its own, with weight; everything else arrives underneath it.
    const lead = type === 'verdict_banner' || type === 'plan_header'
    const delay = lead ? 0 : LEAD_HOLD_MS + Math.min(Math.max(0, i - 1) * CARD_STAGGER_MS, CARD_STAGGER_CAP_MS)
    const body = (
      <DelayProvider value={delay}>
        <Comp {...props} actions={actions} />
      </DelayProvider>
    )
    if (lead) {
      return (
        <motion.div
          key={type}
          ref={leadRef}
          data-card={type}
          className="h-full"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={reduced ? CROSSFADE : LAND_SPRING}
        >
          {/* The hero numeral — the amount the verdict is judging — is the one figure that rolls.
              Switching every md/lg figure in the stack to a count-up looked fine on a laptop and
              cost ~10 of the reveal's 16 frames on a 6x-throttled phone: N simultaneous NumberFlow
              value changes are N React re-renders plus N sets of measured WAAPI animations.
              One number counting is also the better read; a stack of odometers is a slot machine. */}
          <CountUpProvider value={!reduced}>{body}</CountUpProvider>
        </motion.div>
      )
    }
    return (
      <div key={type} data-card={type} className={cn('relative h-full', bare ? '' : 'anim-card-in')} style={bare ? undefined : { animationDelay: `${delay}ms` }}>
        {body}
        {!bare && !reduced ? <CardSheen delay={delay} /> : null}
      </div>
    )
  }
}
