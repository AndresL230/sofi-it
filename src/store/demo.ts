import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CardStack, CardType, EngineContext } from '@/types'

export interface InspectorRow { id: CardType; kind: string; condition: boolean; relevance: number; priority: number; score: number; kept: boolean; reason: string }
export interface Inspector { query: string; path: string; rows: InspectorRow[]; stack: CardStack; ctx: EngineContext }

interface DemoState {
  open: boolean
  /** Force the keyword classifier even when the Worker/API is available. */
  forceFallback: boolean
  /** Choreography step index (null = not running). */
  choreoStep: number | null
  inspector: Inspector | null
  setOpen: (v: boolean) => void
  setForceFallback: (v: boolean) => void
  setChoreoStep: (i: number | null) => void
  setInspector: (i: Inspector | null) => void
}
/** Demo control panel state (orchestrator-owned). `inspector` is not persisted. */
export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      open: false, forceFallback: false, choreoStep: null, inspector: null,
      setOpen: (open) => set({ open }), setForceFallback: (forceFallback) => set({ forceFallback }),
      setChoreoStep: (choreoStep) => set({ choreoStep }), setInspector: (inspector) => set({ inspector }),
    }),
    { name: 'purchase-coach-demo', partialize: (s) => ({ open: s.open, forceFallback: s.forceFallback, choreoStep: s.choreoStep }) },
  ),
)
