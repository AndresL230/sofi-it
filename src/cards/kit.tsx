/**
 * Card kit — everything a card file may import besides engine types/format.
 * Cards receive engine-computed props only (no /src/data, no engine math).
 */
import { createContext, useContext, type ComponentType, type ReactNode } from 'react'
import type { CardSection, CardType, EngineContext, Goal } from '@/engine/types'
import { cn } from '@/lib/utils'
export { Money, Num, NumberFlowGroup } from '@/components/Money'
export { Rich } from '@/components/Rich'
export { DateText } from '@/components/DateText'
export { CardArt } from '@/components/CardArt'
export { Badge } from '@/components/ui/badge'
export { Button } from '@/components/ui/button'
export { Slider } from '@/components/ui/slider'
export { cn }

/** App-level actions a card may trigger (injected by the renderer; the gallery injects toast-only). */
export interface CardActions {
  toast: (msg: string) => void
  goHome: () => void
  trackGoal: (g: Goal) => void
  remindLater: (when: string) => void
}
export const noopActions: CardActions = { toast: () => {}, goHome: () => {}, trackGoal: () => {}, remindLater: () => {} }

/** Entrance delay of the enclosing card (ms). Signature motions add ~200ms on top. */
const DelayCtx = createContext(0)
export const DelayProvider = DelayCtx.Provider
export function useDelay() {
  const base = useContext(DelayCtx)
  return (extraMs = 200) => `${base + extraMs}ms`
}

export interface CardModule<P> {
  type: CardType
  section: CardSection
  label: string
  /** Data condition: false ⇒ the card silently doesn't render. */
  condition: (ctx: EngineContext) => boolean
  /** Pure projection of the context into this card's props. */
  select: (ctx: EngineContext) => P
  Component: ComponentType<P & { actions: CardActions }>
  /** Gallery samples: which matrix query (and goal state) to build props from. */
  samples: { query: string; goal?: boolean; label?: string; override?: (p: P) => P }[]
  /** Layout hint for two-column answer layouts. */
  span?: 'full' | 'auto'
  /** Chrome-free element (consequence_line, chip) — the renderer skips the card wrapper/stagger styling. */
  bare?: boolean
}
export function defineCard<P>(m: CardModule<P>): CardModule<P> { return m }

/** White 16px-radius card with the soft shadow. */
export function CardShell({ children, className, style, as: Tag = 'div' }: { children: ReactNode; className?: string; style?: React.CSSProperties; as?: 'div' | 'section' | 'button' }) {
  return <Tag className={cn('pc-card px-5 py-[18px]', className)} style={style}>{children}</Tag>
}
/** 11px letterspaced slate caps label. */
export function Caps({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('text-[11px] font-semibold uppercase tracking-[.1em] text-slate', className)}>{children}</div>
}
export const VERDICT_STYLE = {
  fine: { bg: 'var(--teal-tint)', ink: 'var(--teal-ink)' },
  tight: { bg: 'var(--tight-gradient)', ink: 'var(--salmon-ink)' },
  over: { bg: 'var(--red-tint)', ink: 'var(--red-ink)' },
} as const
