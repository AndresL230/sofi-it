import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
import { cn } from '@/lib/utils'

const STAGGER_MS = 80

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
    return () => setInspector(null)
  }, [ctx, stack, q, setInspector])

  const actions: CardActions = useMemo(() => ({
    toast: (m) => toast(m),
    goHome: () => { session.reset(); nav('/') },
    trackGoal: (g) => { setGoal(g); toast(`${g.name.split(' ')[0]} is now a tracked goal — small purchases will check against it.`); session.reset(); nav('/') },
    remindLater: (when) => toast(`I'll re-run this ${when} morning.`),
  }), [nav, setGoal, session])

  if (!classification) return <div className="anim-shimmer h-[120px] rounded-card" aria-busy />
  if (!classification.is_purchase) {
    return (
      <div data-screen="answer" className="max-w-quick">
        <Link to="/" className="mb-[14px] inline-block text-[14px] font-semibold" onClick={() => session.reset()}>← Insights</Link>
        <div className="pc-card px-5 py-[18px]" style={{ animation: 'riseIn .45s both' }}>
          <div className="text-[16px] font-bold text-ink">{NON_PURCHASE_REPLY}</div>
          <div className="mt-1 text-[14px] text-slate">I only check purchases — a thing plus a price, and I'll read your accounts.</div>
        </div>
      </div>
    )
  }
  if (!ctx || !stack) return null

  const bento = stack.layout !== 'quick'
  const maxW = stack.layout === 'quick' ? 'max-w-quick' : ''
  const stackKey = `${q}|${goal?.id ?? 'nogoal'}|${goal?.saved ?? 0}`
  const rows = bento ? layoutRows(stack.cards.map(itemFor)) : null

  return (
    <div data-screen="answer" data-path={stack.path} className={maxW}>
      <Link to="/" className="mb-[14px] inline-block text-[14px] font-semibold" onClick={() => session.reset()}>← Insights</Link>
      {rows ? (
        <div key={stackKey} className="flex flex-col gap-4">
          {rows.map((row, r) => (
            <div key={r} className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-12" data-row={row.items.map((x) => `${(x.stack ?? [x.id]).join('+')}:${x.span}`).join(' ')}>
              {row.items.map((x) => <div key={x.id} className="flex min-w-0 flex-col gap-4 md:[grid-column:span_var(--span)_/_span_var(--span)]" style={{ ['--span' as string]: x.span }}>{(x.stack ?? [x.id]).map((id) => renderCard(id, stack.cards.indexOf(id)))}</div>)}
            </div>
          ))}
        </div>
      ) : (
        <div key={stackKey} className="flex flex-col gap-[14px]">{stack.cards.map((type, i) => renderCard(type, i))}</div>
      )}
      {import.meta.env.DEV ? <div className="mt-3 text-[11px] text-slate-muted">path: {stack.path} · {stack.cards.length} cards · source: {classification.source}{stack.dropped.length ? ` · dropped: ${stack.dropped.join(', ')}` : ''}</div> : null}
    </div>
  )

  function renderCard(type: CardType, i: number) {
    {
          const mod = CARDS[type]
          const props = mod.select(ctx!)
          const Comp = mod.Component
          const bare = mod.meta.bare
          const delay = type === 'verdict_banner' ? 300 : i * STAGGER_MS
          return (
            <div key={type} data-card={type} className={cn('h-full', bare ? '' : 'motion-safe:[animation:riseIn_.45s_both]')} style={bare ? undefined : { animationDelay: `${delay}ms` }}>
              <DelayProvider value={delay}>
                <Comp {...props} actions={actions} />
              </DelayProvider>
            </div>
          )
    }
  }
}
