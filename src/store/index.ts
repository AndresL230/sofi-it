import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Classification, Goal } from '@/engine/types'

interface GoalState {
  /** The goal purchases are checked against (at most one). */
  goal: Goal | null
  /** Other goals the user tracks (not used for verdicts). */
  others: Goal[]
  setGoal: (g: Goal | null) => void
  /** Make this goal the one purchases check against; the previous active one moves to `others`. */
  activate: (g: Goal) => void
  addOther: (g: Goal) => void
  remove: (id: string) => void
}
/** Goals persist to localStorage (arch spec). Dates are revived on rehydrate. */
export const useGoalStore = create<GoalState>()(
  persist((set) => ({
    goal: null, others: [],
    setGoal: (goal) => set({ goal }),
    activate: (g) => set((s) => ({ goal: g, others: [...(s.goal && s.goal.id !== g.id ? [s.goal] : []), ...s.others.filter((o) => o.id !== g.id)] })),
    addOther: (g) => set((s) => ({ others: [...s.others.filter((o) => o.id !== g.id), g] })),
    remove: (id) => set((s) => ({ goal: s.goal?.id === id ? null : s.goal, others: s.others.filter((o) => o.id !== id) })),
  }), {
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
