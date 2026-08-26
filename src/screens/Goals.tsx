import { Link } from 'react-router-dom'
import { GoalsPanel } from './goals/GoalsPanel'

/**
 * S4 — Goals. The surface itself lives in ./goals/GoalsPanel, which /profile renders beside the
 * financial profile; this route keeps its own chrome and stays reachable by URL.
 */
export function Goals() {
  return (
    <div className="max-w-quick">
      <Link to="/" className="-ml-1 mb-2.5 inline-flex min-h-6 items-center rounded-sm2 px-1 text-lede font-semibold text-teal hover:text-teal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60">← Insights</Link>
      <h1 className="mb-4.5 text-h1 font-bold">Goals</h1>
      <GoalsPanel />
    </div>
  )
}
