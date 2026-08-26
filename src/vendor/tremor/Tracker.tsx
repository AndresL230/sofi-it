/**
 * Tremor Tracker (copy-paste model) reduced to its skeleton: a row of N thin ticks that a card
 * decorates via renderTick. impulse_frequency's week strip.
 */
import type { ReactNode } from 'react'

export function Tracker({ count, renderTick }: { count: number; renderTick: (i: number) => ReactNode }) {
  return <div className="flex h-11 items-end justify-between">{Array.from({ length: count }, (_, i) => <div key={i}>{renderTick(i)}</div>)}</div>
}
