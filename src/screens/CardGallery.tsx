import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { NOW } from '@/data'
import { useUser } from '@/store/profile'
import { buildContext } from '@/engine/context'
import { fallbackClassify } from '@/engine/fallbackClassifier'
import { suggestedGoal } from '@/engine/goals'
import type { CardSection, EngineContext } from '@/engine/types'
import { CARD_LIST } from '@/cards'
import { DelayProvider, noopActions } from '@/cards/kit'
import type { CardActions } from '@/types'
import { toast } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

const SECTIONS: CardSection[] = ['Verdict & framing', 'Money context', 'Cards & rewards', 'Behavior lens', 'Recurring', 'Goals', 'Large-purchase showpieces']

/** Every card the composer can deal, rendered once from a single registry with engine-built sample data. */
export function CardGallery() {
  const { user, profileId } = useUser()
  const ctxCache = useMemo(() => new Map<string, EngineContext>(), [profileId])
  const ctxFor = (query: string, withGoal?: boolean) => {
    const key = `${query}|${withGoal ? 1 : 0}`
    let c = ctxCache.get(key)
    if (!c) {
      const cls = fallbackClassify(query)
      if (!cls.is_purchase) throw new Error(`gallery sample is not a purchase: ${query}`)
      c = buildContext(cls, withGoal ? { ...suggestedGoal(user, NOW), createdAt: NOW } : null, user, NOW)
      ctxCache.set(key, c)
    }
    return c
  }
  const actions: CardActions = { ...noopActions, toast: (m) => toast(m), remindLater: (w) => toast(`I'll re-run this ${w} morning.`), trackGoal: (g) => toast(`${g.name.split(' ')[0]} is now a tracked goal — small purchases will check against it.`), goHome: () => toast('(gallery) would return home') }

  return (
    <div data-screen="gallery">
      <Link to="/" className="mb-[10px] inline-block text-[14px] font-semibold">← Insights</Link>
      <h1 className="mb-1 text-h1 font-bold">Card gallery</h1>
      <div className="mb-[22px] text-[13.5px] text-slate">Every card the composer can deal, with sample data straight from the engine. Interactive cards work here.</div>
      <div className="[column-gap:18px] [columns:340px]">
        {SECTIONS.map((section) => (
          <div key={section} className="contents">
            <div className="mb-[14px] mt-2 text-[16px] font-extrabold text-navy [column-span:all]">{section}</div>
            {CARD_LIST.filter((c) => c.meta.group === section).map(({ meta: mod, select, Component: Comp }) => (
              <div key={mod.id} data-gallery-card={mod.id} className="mb-5 break-inside-avoid">
                <div className="mb-[6px] text-[11px] font-bold uppercase tracking-[.1em] text-slate">{mod.id}{mod.label ? ` — ${mod.label}` : ''}</div>
                <div className="flex flex-col gap-2">
                  {mod.samples.map((s, i) => {
                    const ctx = ctxFor(s.query, s.goal)
                    if (!mod.condition(ctx) && !s.override) return <div key={i} className="rounded-card border border-dashed border-lavender p-3 text-[12px] text-salmon-ink">condition false for "{s.query}"</div>
                    let props = select(ctx)
                    if (s.override) props = s.override(props) as Record<string, unknown>
                    return (
                      <div key={i} className={cn(mod.bare && 'py-1')}>
                        <DelayProvider value={0}><Comp {...props} actions={actions} /></DelayProvider>
                        {s.label ? <div className="mt-1 text-[10.5px] text-slate-muted">{s.label}</div> : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
