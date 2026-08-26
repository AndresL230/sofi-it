import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Classification, Goal } from '@/engine/types'

interface GoalState {
  goal: Goal | null
  setGoal: (g: Goal | null) => void
}
/** Goals persist to localStorage (arch spec). Dates are revived on rehydrate. */
export const useGoalStore = create<GoalState>()(
  persist((set) => ({ goal: null, setGoal: (goal) => set({ goal }) }), {
    name: 'purchase-coach-goals',
    storage: createJSONStorage(() => localStorage, {
      reviver: (k, v) => (k === 'deadline' || k === 'createdAt') && typeof v === 'string' ? new Date(v) : v,
    }),
  }),
)

interface SessionState {
  query: string
  loading: boolean
  classification: Classification | null
  lastQuery: string | null
  setQuery: (q: string) => void
  setLoading: (v: boolean) => void
  setResult: (q: string, c: Classification) => void
  reset: () => void
}
export const useSession = create<SessionState>()((set) => ({
  query: '', loading: false, classification: null, lastQuery: null,
  setQuery: (query) => set({ query }),
  setLoading: (loading) => set({ loading }),
  setResult: (lastQuery, classification) => set({ lastQuery, classification, loading: false }),
  reset: () => set({ query: '', classification: null, lastQuery: null, loading: false }),
}))
