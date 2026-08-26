import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { NOW } from '@/data'
import { DEFAULT_PROFILE_ID, profileById } from '@/data/profiles'
import { useUser } from '@/store/profile'
import { buildContext } from '@/engine/context'
import { fallbackClassify } from '@/engine/fallbackClassifier'
import { suggestedGoal } from '@/engine/goals'
import type { CardSection, EngineContext, UserModel } from '@/types'
import { CARD_LIST } from '@/cards'
import { DelayProvider, noopActions } from '@/cards/kit'
import type { CardActions } from '@/types'
import { toast } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { ByExpense } from './gallery/ByExpense'
import { EXPENSE_TYPES, buildExpenseSection } from './gallery/expense'

const SECTIONS: CardSection[] = ['Verdict & framing', 'Money context', 'Cards & rewards', 'Behavior lens', 'Recurring', 'Goals', 'Large-purchase showpieces']

type View = 'card' | 'expense'
const VIEW_KEY = 'purchase-coach-gallery-view'
const VIEWS: { key: View; label: string }[] = [
  { key: 'card', label: 'By card' },
  { key: 'expense', label: 'By expense type' },
]
const isView = (v: unknown): v is View => v === 'card' || v === 'expense'
const readStoredView = (): View | null => {
  try { const v = localStorage.getItem(VIEW_KEY); return isView(v) ? v : null } catch { return null }
}

/** Every card the composer can deal, rendered once from a single registry with engine-built sample data. */
export function CardGallery() {
  const { user, profileId } = useUser()
  const [params, setParams] = useSearchParams()
  const [view, setViewState] = useState<View>(() => (isView(params.get('by')) ? (params.get('by') as View) : readStoredView() ?? 'card'))
  const setView = (v: View) => {
    setViewState(v)
    try { localStorage.setItem(VIEW_KEY, v) } catch { /* private mode — the URL still carries the choice */ }
    setParams((p) => { const next = new URLSearchParams(p); next.set('by', v); return next }, { replace: true })
  }

  const ctxCache = useMemo(() => new Map<string, EngineContext>(), [profileId])
  const ctxWith = useCallback((u: UserModel, query: string, withGoal?: boolean) => {
    const key = `${u.persona.initials}|${query}|${withGoal ? 1 : 0}`
    let c = ctxCache.get(key)
    if (!c) {
      const cls = fallbackClassify(query)
      if (!cls.is_purchase) throw new Error(`gallery sample is not a purchase: ${query}`)
      c = buildContext(cls, withGoal ? { ...suggestedGoal(u, NOW), createdAt: NOW } : null, u, NOW)
      ctxCache.set(key, c)
    }
    return c
  }, [ctxCache])
  const reference = useMemo(() => (profileId === DEFAULT_PROFILE_ID ? null : profileById(DEFAULT_PROFILE_ID).build(NOW)), [profileId])
  /** Active profile first; if this sample's condition can't be met on their data, preview with the reference persona and say so. */
  const ctxFor = (query: string, withGoal: boolean | undefined, cond: (c: EngineContext) => boolean): { ctx: EngineContext; borrowed: boolean } => {
    const own = ctxWith(user, query, withGoal)
    if (cond(own) || !reference) return { ctx: own, borrowed: false }
    const ref = ctxWith(reference, query, withGoal)
    return cond(ref) ? { ctx: ref, borrowed: true } : { ctx: own, borrowed: false }
  }
  const actions: CardActions = { ...noopActions, toast: (m) => toast(m), remindLater: (w) => toast(`I'll re-run this ${w} morning.`), trackGoal: (g) => toast(`${g.name.split(' ')[0]} is now a tracked goal — small purchases will check against it.`), goHome: () => toast('(gallery) would return home') }

  /** One section per expense type, each from its sample query on the active profile — goal off, plus the goal-on variant. */
  const expenseSections = useMemo(() => EXPENSE_TYPES.map((t) => buildExpenseSection(t, ctxWith(user, t.query), ctxWith(user, t.query, true), CARD_LIST)), [user, ctxWith])

  return (
    <div data-screen="gallery">
      <Link to="/" className="-ml-1 mb-2.5 inline-flex min-h-6 items-center rounded-sm2 px-1 text-lede font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60">← Insights</Link>
      <h1 className="mb-1 text-h1 font-bold">Card gallery</h1>
      <div className="mb-3.5 max-w-[68ch] text-body text-slate">
        {view === 'expense' ? "Everything the coach can deal, grouped by what you're buying — with the stack it would actually compose." : 'Every card the composer can deal, with sample data straight from the engine. Interactive cards work here.'}
      </div>
      <div role="group" aria-label="Gallery view" className="mb-4.5 flex gap-1.5">
        {VIEWS.map((v) => (
          <button key={v.key} onClick={() => setView(v.key)} aria-pressed={view === v.key} data-gallery-view={v.key} className={cn('cursor-pointer rounded-pill px-3.5 py-1.5 text-body font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-page', view === v.key ? 'bg-teal text-white' : 'bg-teal-tint text-teal-ink hover:bg-teal-tint2')}>{v.label}</button>
        ))}
      </div>

      {view === 'expense' ? (
        <ByExpense sections={expenseSections} actions={actions} firstName={user.persona.firstName} />
      ) : (
        <div className="[column-gap:18px] [columns:340px]">
          {SECTIONS.map((section) => (
            <div key={section} className="contents">
              <div className="mb-3.5 mt-2 text-title font-extrabold text-navy [column-span:all]">{section}</div>
              {CARD_LIST.filter((c) => c.meta.group === section).map(({ meta: mod, select, Component: Comp }) => (
                <div key={mod.id} data-gallery-card={mod.id} className="mb-5 break-inside-avoid">
                  <div className="mb-1.5 text-caption font-bold uppercase tracking-[.1em] text-slate">{mod.id}{mod.label ? ` — ${mod.label}` : ''}</div>
                  <div className="flex flex-col gap-2">
                    {mod.samples.map((s, i) => {
                      const { ctx, borrowed } = ctxFor(s.query, s.goal, mod.condition)
                      if (!mod.condition(ctx) && !s.override) return <div key={i} className="rounded-card border border-dashed border-lavender p-3 text-meta text-salmon-ink">condition false for "{s.query}"</div>
                      let props = select(ctx)
                      if (s.override) props = s.override(props) as Record<string, unknown>
                      return (
                        <div key={i} className={cn(mod.bare && 'py-1')}>
                          <DelayProvider value={0}><Comp {...props} actions={actions} /></DelayProvider>
                          {s.label || borrowed ? <div className="mt-1 text-micro text-slate-muted">{[s.label, borrowed ? `previewed with ${profileById(DEFAULT_PROFILE_ID).name.split(' ')[0]}'s data` : ''].filter(Boolean).join(' · ')}</div> : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
