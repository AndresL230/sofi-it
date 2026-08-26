import { useMemo } from 'react'
import { useDemoStore, type InspectorRow } from '@/store/demo'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Caption } from './ui'

const KIND_TONE = { core: 'gray', interactive: 'teal', showpiece: 'purple' } as const
const FLASH_MS = 1000
/** Composer reasons are sentences ("cap: 7 cards (lower priority)"); the table shows the head and keeps the full text as a title. */
const shortReason = (r: string) => r.replace(/\s*\(.*\)$/, '').replace('condition false', 'condition')

/** Scroll the rendered card into view and outline it for a second (bare cards render `display: contents`, so outline the child). */
export function flashCard(id: string) {
  const host = document.querySelector<HTMLElement>(`[data-card="${id}"]`)
  if (!host) return
  const el = getComputedStyle(host).display === 'contents' ? (host.firstElementChild as HTMLElement | null) ?? host : host
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const prev = { outline: el.style.outline, offset: el.style.outlineOffset, radius: el.style.borderRadius }
  el.style.outline = '3px solid var(--teal)'
  el.style.outlineOffset = '4px'
  el.style.borderRadius = el.style.borderRadius || '16px'
  window.setTimeout(() => { el.style.outline = prev.outline; el.style.outlineOffset = prev.offset; el.style.borderRadius = prev.radius }, FLASH_MS)
}

/** Every candidate card for the current answer: kept rows first in stack order, then the dropped ones with why. */
export function Inspector({ onFlash }: { onFlash?: () => void }) {
  const inspector = useDemoStore((s) => s.inspector)
  const rows = useMemo(() => {
    if (!inspector) return []
    const order = new Map(inspector.stack.cards.map((c, i) => [c, i]))
    return [...inspector.rows].sort((a, b) => {
      if (a.kept !== b.kept) return a.kept ? -1 : 1
      if (a.kept) return (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99)
      if (a.condition !== b.condition) return a.condition ? -1 : 1
      return b.score - a.score
    })
  }, [inspector])

  if (!inspector) return <Caption>open an answer to inspect</Caption>

  const kept = rows.filter((r) => r.kept).length
  const effects = inspector.ctx.profileEffects
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2 text-meta text-slate">
        <span>path <b className="text-ink">{inspector.path}</b> · layout <b className="text-ink">{inspector.stack.layout}</b></span>
        <span><b className="text-ink">{kept}</b> of {rows.length} kept</span>
      </div>
      {/* profileEffects — which of the five financial-profile rules touched THIS answer. */}
      <div data-inspector="profile-effects" className="mb-2 rounded-sm2 border border-lavender-soft bg-lavender-soft/50 px-2 py-1.5">
        <div className="text-micro font-semibold uppercase tracking-[0.06em] text-slate">profileEffects</div>
        <ul className="m-0 mt-1 list-none space-y-[3px] p-0">
          {effects.map((e) => (
            <li key={e.key} className="text-caption leading-snug text-slate">
              <b className="font-mono text-ink">{e.key}</b> · {e.label} <span className="text-slate-muted">— {e.detail}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="overflow-x-auto rounded-sm2 border border-lavender-soft">
        <table className="w-full border-collapse text-meta">
          <thead>
            <tr className="bg-lavender-soft text-left text-micro uppercase tracking-[0.06em] text-slate">
              <th className="px-2 py-1.5 font-semibold">card</th>
              <th className="px-1 py-1.5 font-semibold">kind</th>
              <th className="px-1 py-1.5 text-right font-semibold" title="relevance × priority / priority">score</th>
              <th className="px-2 py-1.5 font-semibold">status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => <Row key={r.id} row={r} onFlash={onFlash} />)}
          </tbody>
        </table>
      </div>
      <Caption className="mt-2">Click a kept row to scroll to that card. Score = relevance × priority; caps: 7 cards, 1 interactive, 1–2 showpieces.</Caption>
    </div>
  )
}

function Row({ row: r, onFlash }: { row: InspectorRow; onFlash?: () => void }) {
  const kind = (r.kind in KIND_TONE ? r.kind : 'core') as keyof typeof KIND_TONE
  const dropByCap = !r.kept && r.condition
  const status = r.kept
    ? <span className="font-semibold text-green" title={r.reason}>✓ {shortReason(r.reason)}</span>
    : <span className={cn('font-medium', dropByCap ? 'text-salmon-ink' : 'text-slate-muted')} title={r.reason}>{shortReason(r.reason)}</span>
  const click = r.kept ? () => { flashCard(r.id); onFlash?.() } : undefined
  return (
    <tr
      data-inspector-row={r.id}
      onClick={click}
      onKeyDown={click ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); click() } } : undefined}
      tabIndex={click ? 0 : undefined}
      role={click ? 'button' : undefined}
      className={cn('border-t border-lavender-soft', r.kept ? 'cursor-pointer hover:bg-teal-tint focus-visible:bg-teal-tint focus-visible:outline-none' : 'text-slate-muted')}
    >
      <td className={cn('max-w-[104px] truncate px-2 py-[5px] font-mono text-caption', r.kept ? 'text-ink' : 'text-slate-muted')} title={r.id}>{r.id}</td>
      <td className="px-1 py-[5px]"><Badge tone={KIND_TONE[kind]} size="xs" className={cn('px-[7px] text-micro', !r.kept && 'opacity-60')}>{r.kind}</Badge></td>
      <td className="whitespace-nowrap px-1 py-[5px] text-right tabular-nums" title={`relevance ${r.relevance.toFixed(2)} × priority ${r.priority}`}>
        <b className={r.kept ? 'text-ink' : 'text-slate-muted'}>{r.score}</b><span className="text-slate-muted">/{r.priority}</span>
      </td>
      <td className="px-2 py-[5px] leading-tight">{status}</td>
    </tr>
  )
}
