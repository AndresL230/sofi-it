import { useState } from 'react'
import type { CardActions, CardKind } from '@/types'
import { CARD_TYPES } from '@/types'
import { DelayProvider } from '@/cards/kit'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EXPENSE_SORTS, sortRows, uncoveredCards, type ExpenseRow, type ExpenseSection, type ExpenseSort } from './expense'

const kindTone = (kind: CardKind) => (kind === 'interactive' ? 'purple' : kind === 'showpiece' ? 'gold' : 'gray')
const anchorId = (category: string) => `expense-${category}`
/** Sticky offset: the app nav (63px) plus this view's quick-nav row. */
const SECTION_SCROLL_MARGIN = 'scroll-mt-[118px]'

/** Every eligible card per expense type, dealt ones first, with the stack the composer would build. */
export function ByExpense({ sections, actions, firstName }: { sections: ExpenseSection[]; actions: CardActions; firstName: string }) {
  const [sort, setSort] = useState<ExpenseSort>('dealt')
  const missing = uncoveredCards(sections, [...CARD_TYPES])

  return (
    <div>
      <nav aria-label="Expense types" className="sticky top-[63px] z-10 -mx-5 bg-page px-5 py-2">
        <div className="flex gap-[6px] overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => (
            <a key={s.type.category} href={`#${anchorId(s.type.category)}`} className="shrink-0 rounded-pill bg-white px-2.5 py-1 text-meta font-semibold text-navy transition-colors hover:bg-teal-tint hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60">
              {s.type.label} <span className="font-medium text-slate-muted">· {s.rows.length}</span>
            </a>
          ))}
        </div>
      </nav>

      <div className="mb-4.5 mt-2 flex flex-wrap items-center gap-2">
        <span className="text-caption font-semibold uppercase tracking-[.1em] text-slate">Sort</span>
        <div role="group" aria-label="Sort cards" className="flex gap-1.5">
          {EXPENSE_SORTS.map((o) => (
            <button key={o.key} onClick={() => setSort(o.key)} aria-pressed={sort === o.key} className={cn('cursor-pointer rounded-pill px-2.5 py-1 text-meta font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60', sort === o.key ? 'bg-navy text-white' : 'bg-lavender-soft text-slate')}>{o.label}</button>
          ))}
        </div>
        {missing.length ? <span className="text-meta text-salmon-ink">Not triggered by any type on {firstName}'s data: {missing.join(', ')}</span> : null}
      </div>

      {sections.map((s) => <Section key={s.type.category} section={s} sort={sort} actions={actions} firstName={firstName} />)}
    </div>
  )
}

function Section({ section: s, sort, actions, firstName }: { section: ExpenseSection; sort: ExpenseSort; actions: CardActions; firstName: string }) {
  const rows = sortRows(s.rows, sort)
  const dealt = rows.filter((r) => r.dealt)
  const dropped = rows.filter((r) => !r.dealt)
  const grouped = sort === 'dealt' && dropped.length > 0 && dealt.length > 0
  return (
    <section id={anchorId(s.type.category)} data-expense={s.type.category} className={cn('mb-8', SECTION_SCROLL_MARGIN)}>
      <div className="mb-3.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <h2 className="m-0 text-title font-extrabold text-navy">{s.type.label}</h2>
          <Badge tone="teal" size="xs">{s.type.query}</Badge>
          <span className="text-meta text-slate-muted">{s.stack.path} · {s.stack.layout}</span>
        </div>
        <StackPills stack={s.stack.cards} kinds={s.rows} className="mt-2" />
        {s.stackWithGoal ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <Badge tone="purple" size="xs">with goal</Badge>
            <StackPills stack={s.stackWithGoal.cards} kinds={s.rows} />
          </div>
        ) : null}
        <div className="mt-1.5 text-meta text-slate">{s.candidates} candidates · {s.stack.cards.length} dealt · cap 7 / 1 interactive / {s.showpieceCap} showpiece</div>
      </div>

      {rows.length === 0 ? <div className="text-meta text-slate-muted">Nothing triggers for this purchase on {firstName}'s data.</div> : null}
      {grouped ? (
        <>
          <Masonry rows={dealt} actions={actions} />
          <div className="mb-2.5 mt-1 text-caption font-semibold uppercase tracking-[.1em] text-slate">eligible, dropped by cap</div>
          <Masonry rows={dropped} actions={actions} />
        </>
      ) : (
        <Masonry rows={rows} actions={actions} />
      )}
    </section>
  )
}

function StackPills({ stack, kinds, className }: { stack: readonly string[]; kinds: ExpenseRow[]; className?: string }) {
  const kindOf = (id: string) => kinds.find((r) => r.entry.meta.id === id)?.entry.meta.kind ?? 'core'
  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {stack.map((id, i) => (
        <Badge key={id} tone={kindTone(kindOf(id))} size="xs" className="font-mono text-micro font-semibold">
          <span className="mr-1 opacity-60">{i + 1}</span>{id}
        </Badge>
      ))}
    </div>
  )
}

function Masonry({ rows, actions }: { rows: ExpenseRow[]; actions: CardActions }) {
  return (
    <div className="[column-gap:18px] [columns:340px]">
      {rows.map(({ entry: { meta, select, Component: Comp }, ctx, withGoal, dealt, stackIndex, score, reason }) => (
        <div key={meta.id} data-gallery-card={meta.id} className="mb-5 break-inside-avoid">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-caption font-bold uppercase tracking-[.1em] text-slate">{meta.id}{meta.label ? ` — ${meta.label}` : ''}</span>
            {dealt ? <Badge tone="teal" size="xs">dealt · #{stackIndex + 1}</Badge> : <Badge tone="gray" size="xs">{reason}</Badge>}
            {withGoal ? <Badge tone="purple" size="xs">with goal</Badge> : null}
            {sortHint(score, meta.kind)}
          </div>
          <div className={cn(meta.bare && 'py-1')}>
            <DelayProvider value={0}><Comp {...select(ctx)} actions={actions} /></DelayProvider>
          </div>
        </div>
      ))}
    </div>
  )
}

function sortHint(score: number, kind: CardKind) {
  return <span className="text-micro text-slate-muted">score {score}{kind !== 'core' ? ` · ${kind}` : ''}</span>
}
