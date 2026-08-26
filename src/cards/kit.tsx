/**
 * Card kit — everything a card file may import besides engine types/format.
 * Cards receive engine-computed props only (no /src/data, no engine math).
 */
import { createContext, useContext, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
export { Money, Num, NumberFlowGroup } from '@/components/Money'
export { Rich } from '@/components/Rich'
export { DateText } from '@/components/DateText'
export { CardArt } from '@/components/CardArt'
export { Badge } from '@/components/ui/badge'
export { Button } from '@/components/ui/button'
export { Slider } from '@/components/ui/slider'
export { cn }

export type { CardActions } from '@/types'
import type { CardActions as _CA } from '@/types'
export const noopActions: _CA = { toast: () => {}, goHome: () => {}, trackGoal: () => {}, remindLater: () => {} }

/** Entrance delay of the enclosing card (ms). Signature motions add ~200ms on top. */
const DelayCtx = createContext(0)
export const DelayProvider = DelayCtx.Provider
export function useDelay() {
  const base = useContext(DelayCtx)
  return (extraMs = 200) => `${base + extraMs}ms`
}

/** White 16px-radius card with the soft shadow. */
export function CardShell({ children, className, style, as: Tag = 'div' }: { children: ReactNode; className?: string; style?: React.CSSProperties; as?: 'div' | 'section' | 'button' }) {
  return <Tag className={cn('pc-card h-full px-5 py-[18px]', className)} style={style}>{children}</Tag>
}
/**
 * Type roles — the only sanctioned way for a card to size text.
 * Every entry maps onto the named scale in tailwind.config.ts; a card that needs
 * something not listed here should be asking whether the role is really new.
 */
export const T = {
  /** 16px card headline. */
  title: 'text-title font-bold',
  /** 14px emphasis copy / row label. */
  lede: 'text-lede font-semibold',
  /** 13px supporting copy. */
  body: 'text-body',
  /** 12px secondary metadata. */
  meta: 'text-meta text-slate',
  /** 11px chart + row annotation. */
  caption: 'text-caption text-slate',
  /** 10px axis ticks and the smallest annotations. */
  micro: 'text-micro text-slate-muted',
  /** 11px letterspaced caps label. */
  caps: 'text-caption font-semibold uppercase tracking-[.1em] text-slate',
} as const

/** Vertical rhythm inside a card: block gaps come from these, not ad-hoc margins. */
export const STACK = { tight: 'space-y-1.5', base: 'space-y-2.5', loose: 'space-y-3.5' } as const

/** 11px letterspaced slate caps label. */
export function Caps({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(T.caps, className)}>{children}</div>
}
export const VERDICT_STYLE = {
  fine: { bg: 'var(--teal-tint)', ink: 'var(--teal-ink)' },
  tight: { bg: 'var(--tight-gradient)', ink: 'var(--salmon-ink)' },
  over: { bg: 'var(--red-tint)', ink: 'var(--red-ink)' },
} as const
