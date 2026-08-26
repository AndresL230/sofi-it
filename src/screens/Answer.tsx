import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { USER, NOW } from '@/data'
import { buildContext } from '@/engine/context'
import { compose } from '@/engine/composer'
import { classify } from '@/engine/classify'
import { NON_PURCHASE_REPLY } from '@/engine/queries'
import type { CardType, Classification, EngineContext } from '@/engine/types'
import { useGoalStore, useSession } from '@/store'
import { CARDS } from '@/cards/registry'
import { DelayProvider, type CardActions } from '@/cards/kit'
import { toast } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

const STAGGER_MS = 80
const FULL: CardType[] = ['verdict_banner', 'plan_header', 'consequence_line', 'post_purchase_footer', 'track_goal_cta', 'goal_impact_chip']

/** The answer is a composed stack — never a fixed template. Layout adapts to the stack's size class. */
export function Answer() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const nav = useNavigate()
  const session = useSession()
  const { goal, setGoal } = useGoalStore()
  const [local, setLocal] = useState<Classification | null>(null)
  const classification = session.lastQuery === q ? session.classification : local

  useEffect(() => {
    if (!q) { nav('/', { replace: true }); return }
    if (session.lastQuery === q && session.classification) return
    let alive = true
    classify(q).then((c) => { if (alive) { setLocal(c); session.setResult(q, c) } })
    return () => { alive = false }
  }, [q])

  const ctx = useMemo<EngineContext | null>(() => (classification && classification.is_purchase ? buildContext(classification, goal, USER, NOW) : null), [classification, goal])
  const stack = useMemo(() => (ctx ? compose(ctx, (t) => CARDS[t].condition(ctx)) : null), [ctx])

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

  const isTwoCol = stack.layout !== 'quick'
  const maxW = stack.layout === 'quick' ? 'max-w-quick' : stack.layout === 'recurring' ? 'max-w-plan' : ''
  const stackKey = `${q}|${goal?.id ?? 'nogoal'}|${goal?.saved ?? 0}`
  const isFull = (type: CardType) => FULL.includes(type) || CARDS[type].span === 'full'
  const lanes = { left: stack.cards.filter((t) => !isFull(t) && CARDS[t].column === 'left'), right: stack.cards.filter((t) => !isFull(t) && CARDS[t].column !== 'left') }
  // a lone column collapses to full width; an empty lane is skipped
  const twoLanes = isTwoCol && lanes.left.length > 0 && lanes.right.length > 0

  return (
    <div data-screen="answer" data-path={stack.path} className={maxW}>
      <Link to="/" className="mb-[14px] inline-block text-[14px] font-semibold" onClick={() => session.reset()}>← Insights</Link>
      <div key={stackKey} className={cn(twoLanes ? 'grid grid-cols-1 items-start gap-4 md:grid-cols-2' : isTwoCol ? 'grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr))] items-start' : 'flex flex-col gap-[14px]')}>
        {(twoLanes ? [...stack.cards.filter(isFull).filter((t) => stack.cards.indexOf(t) < stack.cards.findIndex((x) => !isFull(x))), '__left', '__right', ...stack.cards.filter(isFull).filter((t) => stack.cards.indexOf(t) > stack.cards.findIndex((x) => !isFull(x)))] : stack.cards).map((type, i) => {
          if (type === '__left' || type === '__right') {
            const lane = type === '__left' ? lanes.left : lanes.right
            return <div key={type} className="flex flex-col gap-[14px]">{lane.map((t) => renderCard(t, stack.cards.indexOf(t)))}</div>
          }
          return renderCard(type as CardType, i)
        })}
      </div>
      {import.meta.env.DEV ? <div className="mt-3 text-[11px] text-slate-muted">path: {stack.path} · {stack.cards.length} cards · source: {classification.source}{stack.dropped.length ? ` · dropped: ${stack.dropped.join(', ')}` : ''}</div> : null}
    </div>
  )

  function renderCard(type: CardType, i: number) {
    {
          const mod = CARDS[type]
          const props = mod.select(ctx!)
          const Comp = mod.Component as React.ComponentType<Record<string, unknown> & { actions: CardActions }>
          const delay = type === 'verdict_banner' ? 300 : i * STAGGER_MS
          const full = isTwoCol && isFull(type)
          return (
            <div key={type} data-card={type} className={cn(full && 'col-span-full', mod.bare ? (full ? '' : 'contents') : 'motion-safe:[animation:riseIn_.45s_both]')} style={mod.bare ? undefined : { animationDelay: `${delay}ms` }}>
              <DelayProvider value={delay}>
                <Comp {...(props as Record<string, unknown>)} actions={actions} />
              </DelayProvider>
            </div>
          )
    }
  }
}
