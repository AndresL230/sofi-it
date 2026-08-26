import { useMemo } from 'react'
import { NOW } from '@/data'
import { CARD_METAS } from '@/cards'
import { compose } from '@/engine/composer'
import { buildContext } from '@/engine/context'
import { fallbackClassify } from '@/engine/fallbackClassifier'
import { suggestedGoal } from '@/engine/goals'
import { itemFor, layoutRows, type LayoutRow } from '@/engine/layout'
import { useGoalStore } from '@/store'
import { useUser } from '@/store/profile'
import type { CardType, UserModel } from '@/types'
import { cn } from '@/lib/utils'
import { Caption } from './ui'

/**
 * Worked bento examples for the demo panel.
 *
 * Each row is a real composition — the stack and the row breaks are computed live by the
 * composer and the Knuth–Plass layout, not hand-drawn — so the schematic can never drift
 * from what /answer actually renders. The point is to show that one engine produces several
 * distinct layout archetypes, and to make each one reachable in a click.
 */
interface Example { key: string; query: string; title: string; note: string; goal?: boolean }

const EXAMPLES: Example[] = [
  { key: 'latte', query: '$6 latte', title: 'Single column', note: 'Small spend — no grid at all, one narrow column of thin cards.' },
  { key: 'dinner', query: '$60 dinner', title: 'Single column + interactive', note: 'Same column, but a split-the-bill control earns its place.' },
  { key: 'shoes', query: '$140 running shoes', title: 'Considered bento', note: 'No card row — every card earns the same here, so the grid is all behaviour.' },
  { key: 'tickets', query: '$180 concert tickets', title: 'Considered — no duplicate', note: 'Same archetype, different cards, so the rows break elsewhere.' },
  { key: 'crunchyroll', query: '$15/mo Crunchyroll', title: 'Recurring bento', note: 'The subscription story: stack, overlap, price history.' },
  { key: 'flight', query: '$1,200 flight to Lisbon in March', title: 'Plan + showpiece', note: 'Iceberg and goal collision; a plan header spans the full width.', goal: true },
  { key: 'moving', query: '$2,800 to move apartments', title: 'Plan + payment fork', note: 'The widest stack — fork, collision and timeline in one grid.' },
]

/** Colour a block by the card family so the schematic reads as composition, not noise. */
const FAMILY: Record<string, string> = {
  'Verdict & framing': 'var(--navy)',
  'Money context': 'var(--teal)',
  'Cards & rewards': 'var(--gold-deep)',
  'Behavior lens': 'var(--slate)',
  Recurring: 'var(--salmon)',
  Goals: 'var(--purple)',
  'Large-purchase showpieces': 'var(--teal-ink)',
}
const groupOf = (id: CardType) => CARD_METAS.find((m) => m.id === id)?.group ?? ''
const colorOf = (id: CardType) => FAMILY[groupOf(id)] ?? 'var(--lavender-deep)'

function useComposition(ex: Example, user: UserModel) {
  return useMemo(() => {
    const cls = fallbackClassify(ex.query)
    if (!cls.is_purchase) return null
    const goal = ex.goal ? { ...suggestedGoal(user, NOW), createdAt: NOW } : null
    const ctx = buildContext(cls, goal, user, NOW)
    const stack = compose(ctx, CARD_METAS)
    const bento = stack.layout !== 'quick'
    return { stack, rows: bento ? layoutRows(stack.cards.map(itemFor)) : null }
  }, [ex.key, user])
}

/** 12-column schematic of the row breaks — the same spans the answer grid will use. */
function Schematic({ rows, cards }: { rows: LayoutRow[] | null; cards: CardType[] }) {
  if (!rows) {
    return (
      <div className="flex w-[86px] shrink-0 flex-col gap-[3px]" aria-hidden>
        {cards.slice(0, 7).map((id) => <div key={id} className="h-[5px] rounded-[2px] opacity-80" style={{ background: colorOf(id), width: '58%' }} />)}
      </div>
    )
  }
  return (
    <div className="flex w-[86px] shrink-0 flex-col gap-[3px]" aria-hidden>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-12 gap-[3px]">
          {row.items.map((it) => (
            <div key={it.id} className="flex flex-col gap-0.5" style={{ gridColumn: `span ${it.span} / span ${it.span}` }}>
              {(it.stack ?? [it.id]).map((id) => <div key={id} className="h-[5px] rounded-[2px] opacity-85" style={{ background: colorOf(id) }} />)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function BentoExamples({ ask }: { ask: (q: string) => void }) {
  const { user } = useUser()
  const goal = useGoalStore((s) => s.goal)
  return (
    <div>
      <div className="flex flex-col gap-1.5">
        {EXAMPLES.map((ex) => <Row key={ex.key} ex={ex} user={user} ask={ask} goalTracked={!!goal} />)}
      </div>
      <Caption className="mt-2.5">
        Schematics are computed live from the composer and the row-breaking layout — they show the real spans
        the answer grid will use, family-coloured.
      </Caption>
    </div>
  )
}

function Row({ ex, user, ask, goalTracked }: { ex: Example; user: UserModel; ask: (q: string) => void; goalTracked: boolean }) {
  const comp = useComposition(ex, user)
  if (!comp) return null
  const { stack, rows } = comp
  const shape = rows ? `${rows.length} rows` : 'single column'
  return (
    <button
      type="button"
      data-demo={`bento-${ex.key}`}
      onClick={() => ask(ex.query)}
      title={ex.query}
      className="flex w-full cursor-pointer items-start gap-2.5 rounded-sm2 border-[1.5px] border-lavender bg-white px-2.5 py-2 text-left transition-colors hover:bg-lavender-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50"
    >
      <span className="mt-[3px] shrink-0"><Schematic rows={rows} cards={stack.cards} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-meta font-bold text-ink">{ex.title}</span>
        <span className="mt-[1px] block text-caption leading-snug text-slate">{ex.note}</span>
        <span className="mt-0.5 block text-caption text-slate-muted">
          {stack.layout} · {stack.cards.length} cards · {shape}
          {ex.goal && !goalTracked ? ' · needs a goal' : ''}
        </span>
      </span>
    </button>
  )
}

/** Every card the layout engine can place, with the column range it may occupy. */
export function SpanTable() {
  const rows = useMemo(() => CARD_METAS.map((m) => itemFor(m.id)).sort((a, b) => a.min - b.min || a.id.localeCompare(b.id)), [])
  return (
    <div>
      <Caption className="mb-2">Each card declares a natural width and a range it may stretch or shrink to, in 12ths of the grid.</Caption>
      <div className="grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-[3px]">
        {rows.map((r) => (
          <div key={r.id} className="contents">
            <div className="truncate text-caption text-slate">{r.id}</div>
            <div className="flex items-center gap-1.5">
              <div className="grid w-[60px] grid-cols-12 gap-px" aria-hidden>
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className={cn('h-[6px] rounded-[1px]', i < r.min ? 'bg-teal' : i < r.max ? 'bg-teal-pale' : 'bg-lavender-soft')} />
                ))}
              </div>
              <div className="w-[34px] text-right text-micro tabular-nums text-slate-muted">{r.min}–{r.max}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
