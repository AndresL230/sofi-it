/**
 * Card registry built from the filesystem — no shared file to edit when a card is added.
 * Each folder under src/cards/<id>/ exports: default Component, `select(ctx)`, and `meta` (CardMeta).
 */
import type { ComponentType } from 'react'
import type { CardMeta, CardProps, CardType, EngineContext } from '@/types'
import { CARD_TYPES } from '@/types'

interface CardModuleShape { default: ComponentType<CardProps<Record<string, unknown>>>; select: (ctx: EngineContext) => Record<string, unknown>; meta: CardMeta }
export interface CardEntry { meta: CardMeta; select: (ctx: EngineContext) => Record<string, unknown>; Component: ComponentType<CardProps<Record<string, unknown>>> }

const mods = import.meta.glob<CardModuleShape>('./*/index.tsx', { eager: true })

const byId = new Map<CardType, CardEntry>()
for (const [path, mod] of Object.entries(mods)) {
  const folder = path.split('/')[1] as CardType
  if (!mod.meta || mod.meta.id !== folder) throw new Error(`card ${path}: meta.id must equal its folder name (${folder})`)
  byId.set(folder, { meta: mod.meta, select: mod.select, Component: mod.default })
}
const missing = CARD_TYPES.filter((t) => !byId.has(t))
if (missing.length) throw new Error(`registry is missing cards: ${missing.join(', ')}`)

export const CARDS = Object.fromEntries(byId) as Record<CardType, CardEntry>
/** Ordered as numbered in the cards spec (1–34). */
export const CARD_LIST: CardEntry[] = CARD_TYPES.map((t) => byId.get(t)!)
export const CARD_METAS: CardMeta[] = CARD_LIST.map((c) => c.meta)
