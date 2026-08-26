import type { CardType } from '@/types'

/**
 * Bento layout — Knuth–Plass justified row breaking over a 12-column grid.
 *
 * Each card has a natural width (columns) plus a [min, max] it may shrink/stretch to. We choose the
 * row breaks that minimise total "badness" Σ (12 − Σ natural widths)² — the same dynamic programme
 * TeX uses to break paragraphs into lines (and Flickr's justified image layout uses for rows) —
 * then distribute each row's leftover columns proportionally, so every row runs edge to edge and
 * nothing hangs off the left or right. Full-width anchors (banner, footer…) always break their own row.
 */
export interface LayoutItem { id: CardType; natural: number; min: number; max: number; /** rough height class: 1 short · 2 medium · 3 tall */ h: number }
export interface LayoutRow { items: { id: CardType; span: number; stack?: CardType[] }[] }
/** A tall card's neighbours can be stacked vertically in one cell (bento). */
interface Cell extends LayoutItem { stack?: CardType[] }

const COLS = 12
const HEIGHT: Partial<Record<CardType, number>> = { card_ranking: 3, total_cost_of_event: 3, payment_fork: 3, goal_collision: 3, subscription_stack: 3, price_creep: 2, split_check: 3, cashflow_timeline: 1, points_offset: 2, discretionary_runway: 1, carrying_cost: 2, hold_24h: 1, duplicate_check: 2, utilization_watch: 1, benefits_check: 1, guilt_free_balance: 1, cost_per_use: 2, impulse_frequency: 1, annualized: 1, overlap_check: 2, merchant_habit: 1, credit_expiry: 1, credit_sweep: 1, payday_proximity: 2, category_pulse: 1, pace_projection: 2, green_light: 1, best_card_row: 1 }
const WIDTH: Partial<Record<CardType, [natural: number, min: number, max: number]>> = {
  verdict_banner: [12, 12, 12], plan_header: [12, 12, 12], consequence_line: [12, 12, 12], post_purchase_footer: [12, 12, 12], track_goal_cta: [12, 12, 12], goal_impact_chip: [12, 12, 12],
  card_ranking: [6, 6, 12], payment_fork: [7, 6, 8], total_cost_of_event: [7, 6, 8], goal_collision: [6, 6, 12], cashflow_timeline: [6, 6, 12], price_creep: [6, 6, 8], subscription_stack: [6, 5, 8],
  discretionary_runway: [6, 5, 12], carrying_cost: [4, 4, 6], points_offset: [5, 4, 6], pace_projection: [6, 5, 12], category_pulse: [6, 5, 12],
  benefits_check: [4, 4, 6], utilization_watch: [5, 4, 6], guilt_free_balance: [6, 5, 8], cost_per_use: [5, 4, 6], hold_24h: [5, 4, 6], duplicate_check: [4, 4, 6], impulse_frequency: [6, 5, 8],
  annualized: [6, 5, 12], overlap_check: [5, 4, 12], best_card_row: [12, 8, 12], merchant_habit: [6, 5, 8], credit_expiry: [6, 5, 8], credit_sweep: [6, 5, 12], payday_proximity: [6, 5, 12], split_check: [5, 4, 6], green_light: [6, 5, 12],
}
export const itemFor = (id: CardType): LayoutItem => { const [natural, min, max] = WIDTH[id] ?? [6, 4, 12]; return { id, natural, min, max, h: HEIGHT[id] ?? 2 } }

/** Knuth–Plass over the ordered items: O(n²) DP on break points. */
/** Group two short cards that sit next to a tall one into a vertical stack cell, so the row heights balance. */
function stackShorts(items: LayoutItem[]): Cell[] {
  const out: Cell[] = []
  const used = new Set<number>()
  const short = (x?: LayoutItem) => !!x && x.h <= 2 && x.min < COLS
  const mk = (ms: LayoutItem[]): Cell => ({ id: ms[0].id, natural: Math.max(...ms.map((m) => m.natural)), min: Math.max(...ms.map((m) => m.min)), max: Math.min(COLS, ...ms.map((m) => m.max)), h: ms.reduce((a, m) => a + m.h, 0), stack: ms.map((m) => m.id) })
  for (let i = 0; i < items.length; i++) {
    if (used.has(i)) continue
    const it = items[i]
    if (it.h >= 3 && it.min < COLS) {
      // following shorts: take two, or three if their heights still balance the tall card
      const next = [items[i + 1], items[i + 2], items[i + 3]].filter((x, k) => short(x) && !used.has(i + 1 + k))
      const take = next.length >= 3 && next[0].h + next[1].h + next[2].h <= 4 ? 3 : next.length >= 2 ? 2 : 0
      if (take && [1, 2, 3].slice(0, take).every((k) => short(items[i + k]))) { out.push(it); out.push(mk(items.slice(i + 1, i + 1 + take))); for (let k = 1; k <= take; k++) used.add(i + k); continue }
      if (short(items[i - 1]) && short(items[i - 2]) && out.length >= 2 && !out[out.length - 1].stack && !out[out.length - 2].stack) { const b = out.pop()!, a = out.pop()!; out.push(mk([a, b])); out.push(it); continue }
    }
    out.push(it)
  }
  return out
}

export function layoutRows(rawItems: LayoutItem[]): LayoutRow[] {
  const items = stackShorts(rawItems)
  const n = items.length
  if (n === 0) return []
  const INF = Number.POSITIVE_INFINITY
  const best = new Array<number>(n + 1).fill(INF); best[0] = 0
  const prev = new Array<number>(n + 1).fill(-1)
  for (let j = 1; j <= n; j++) {
    for (let i = j - 1; i >= 0; i--) {
      const row = items.slice(i, j)
      const nat = row.reduce((a, r) => a + r.natural, 0), min = row.reduce((a, r) => a + r.min, 0), max = row.reduce((a, r) => a + r.max, 0)
      if (min > COLS) break                                   // can't shrink this many into one row
      const fullWidth = row.some((r) => r.min === COLS)
      if (fullWidth && row.length > 1) continue               // anchors sit alone
      if (max < COLS) {
        // a row that can't reach full width: allowed only as a single stretched card (or as the short last row)
        // width-capped graphics (iceberg, fork, sparkline) pay dearly to sit alone mid-stack — they should pair
        if (row.length === 1 && best[i] < INF) { const b = best[i] + (COLS - nat) ** 2 * (j === n ? 0.25 : 3); if (b < best[j]) { best[j] = b; prev[j] = i } }
        continue
      }
      // width badness (TeX's squared slack) + a penalty for pairing very different heights, so a tall leaderboard
      // doesn't sit beside a one-line card with a wall of white under it
      const hs = row.map((r) => r.h)
      const badness = (COLS - nat) ** 2 + (row.length > 3 ? 40 : 0) + 10 * (Math.max(...hs) - Math.min(...hs)) ** 2
      if (best[i] + badness < best[j]) { best[j] = best[i] + badness; prev[j] = i }
    }
  }
  // reconstruct
  const rows: LayoutRow[] = []
  let j = n
  while (j > 0) {
    const i = prev[j] < 0 ? j - 1 : prev[j]
    rows.unshift({ items: justify(items.slice(i, j)) })
    j = i
  }
  return rows
}

/** Distribute the leftover columns proportionally within [min, max]; largest-remainder rounding keeps the sum exactly 12. */
function justify(row: Cell[]): { id: CardType; span: number; stack?: CardType[] }[] {
  const nat = row.reduce((a, r) => a + r.natural, 0)
  const target = row.length === 1 ? COLS : Math.min(COLS, row.reduce((a, r) => a + r.max, 0))
  const scale = target / nat
  const cap = (r: LayoutItem) => (row.length === 1 ? COLS : r.max)
  const raw = row.map((r) => Math.max(r.min, Math.min(cap(r), r.natural * scale)))
  const spans = raw.map((v) => Math.floor(v))
  let left = target - spans.reduce((a, b) => a + b, 0)
  const order = raw.map((v, i) => ({ i, frac: v - Math.floor(v) })).sort((a, b) => b.frac - a.frac)
  for (const { i } of order) { if (left <= 0) break; if (spans[i] < cap(row[i])) { spans[i]++; left-- } }
  while (left > 0) { const i = spans.findIndex((s, k) => s < cap(row[k])); if (i < 0) break; spans[i]++; left-- }
  return row.map((r, i) => ({ id: r.id, span: spans[i], stack: r.stack }))
}
