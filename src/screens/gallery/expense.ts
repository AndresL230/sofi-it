/**
 * "By expense type" gallery model: one section per purchase category, each built from a fixed sample
 * query so the page shows what the composer would actually deal for that kind of purchase.
 * Pure — (contexts, registry) → rows; the screen only renders.
 */
import type { Category, CardStack, CardType, EngineContext } from '@/types'
import type { CardEntry } from '@/cards'
import { CARD_METAS } from '@/cards'
import { explain } from '@/engine/composer'

export interface ExpenseType { category: Category; label: string; query: string }

/** Display order for the sections; the query is the sample each section is built from. */
export const EXPENSE_TYPES: ExpenseType[] = [
  { category: 'coffee', label: 'Coffee', query: '$6 latte' },
  { category: 'dining', label: 'Dining', query: '$60 dinner' },
  { category: 'groceries', label: 'Groceries', query: '$54 groceries' },
  { category: 'transport', label: 'Transport', query: '$28 Uber' },
  { category: 'shopping_apparel', label: 'Apparel', query: '$140 running shoes' },
  { category: 'shopping_electronics', label: 'Electronics', query: '$450 monitor' },
  { category: 'entertainment', label: 'Entertainment', query: '$180 concert tickets' },
  { category: 'travel', label: 'Travel', query: '$1,200 flight to Lisbon in March' },
  { category: 'subscription', label: 'Subscription', query: '$15/mo Crunchyroll' },
  { category: 'housing_moving', label: 'Moving / housing', query: '$2,800 to move apartments' },
  { category: 'other', label: 'Other', query: '$35 gift' },
]

export interface ExpenseRow {
  entry: CardEntry
  /** Context the card's props are selected from (goal-on when the card only triggers with a goal). */
  ctx: EngineContext
  /** True when the condition is false without a goal but true with one. */
  withGoal: boolean
  dealt: boolean
  /** 0-based position in the composed stack, -1 when dropped. */
  stackIndex: number
  score: number
  /** Composer's reason (kept / anchor / cap …), or "outside the … pool" for eligible cards the path never draws from. */
  reason: string
}

export interface ExpenseSection {
  type: ExpenseType
  stack: CardStack
  /** Stack with a goal present — shown only when it differs from `stack`. */
  stackWithGoal: CardStack | null
  candidates: number
  showpieceCap: number
  rows: ExpenseRow[]
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

export function buildExpenseSection(type: ExpenseType, ctxOff: EngineContext, ctxOn: EngineContext, entries: CardEntry[]): ExpenseSection {
  const exOff = explain(ctxOff, CARD_METAS)
  const exOn = explain(ctxOn, CARD_METAS)
  const rows: ExpenseRow[] = []
  for (const entry of entries) {
    const { meta } = entry
    const offOk = meta.condition(ctxOff)
    const withGoal = !offOk && meta.condition(ctxOn)
    if (!offOk && !withGoal) continue
    const ctx = withGoal ? ctxOn : ctxOff
    const ex = withGoal ? exOn : exOff
    const row = ex.rows.find((r) => r.id === meta.id)
    const stackIndex = ex.stack.cards.indexOf(meta.id)
    rows.push({
      entry, ctx, withGoal, dealt: stackIndex >= 0, stackIndex,
      score: row ? row.score : Math.round(clamp01(meta.relevance(ctx)) * meta.priority),
      reason: row ? row.reason : `outside the ${ex.path} pool`,
    })
  }
  const sameStack = exOff.stack.cards.length === exOn.stack.cards.length && exOff.stack.cards.every((c, i) => c === exOn.stack.cards[i])
  return { type, stack: exOff.stack, stackWithGoal: sameStack ? null : exOn.stack, candidates: exOff.rows.length, showpieceCap: ctxOff.q.size === 'large' ? 2 : 1, rows }
}

export type ExpenseSort = 'dealt' | 'score' | 'az'
export const EXPENSE_SORTS: { key: ExpenseSort; label: string }[] = [
  { key: 'dealt', label: 'Dealt first' },
  { key: 'score', label: 'By score' },
  { key: 'az', label: 'A–Z' },
]

const byId = (a: ExpenseRow, b: ExpenseRow) => a.entry.meta.id.localeCompare(b.entry.meta.id)
const byScore = (a: ExpenseRow, b: ExpenseRow) => b.score - a.score || byId(a, b)

export function sortRows(rows: ExpenseRow[], sort: ExpenseSort): ExpenseRow[] {
  const out = [...rows]
  if (sort === 'az') return out.sort(byId)
  if (sort === 'score') return out.sort(byScore)
  return out.sort((a, b) => (a.dealt !== b.dealt ? (a.dealt ? -1 : 1) : a.dealt ? a.stackIndex - b.stackIndex : byScore(a, b)))
}

/** Card ids that show up in no section — surfaced in the UI so a gap in coverage is visible, not silent. */
export function uncoveredCards(sections: ExpenseSection[], all: CardType[]): CardType[] {
  const seen = new Set(sections.flatMap((s) => s.rows.map((r) => r.entry.meta.id)))
  return all.filter((id) => !seen.has(id))
}
