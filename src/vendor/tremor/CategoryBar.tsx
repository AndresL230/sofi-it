/**
 * Tremor CategoryBar (copy-paste model), restyled to SoFi tokens and extended with a hatched
 * segment + a marker tick. Segments are fractions of the full width.
 */
import { cn } from '@/lib/utils'

export interface Segment { value: number; fill: string | 'hatch' }
export function CategoryBar({ segments, marker, className, height = 14 }: { segments: Segment[]; marker?: { at: number }; className?: string; height?: number }) {
  let acc = 0
  return (
    <div className={cn('relative overflow-hidden rounded-pill bg-lavender-soft', className)} style={{ height }} role="img" aria-label="category pulse">
      {segments.map((s, i) => {
        const left = acc; acc += s.value
        const w = Math.max(0, Math.min(1 - left, s.value))
        return (
          <div key={i} className="absolute inset-y-0" style={{ left: `${left * 100}%`, width: `${w * 100}%`, borderRadius: i === 0 ? '999px 0 0 999px' : 0, background: s.fill === 'hatch' ? 'repeating-linear-gradient(-55deg, var(--teal) 0 4px, var(--teal-soft) 4px 8px)' : s.fill, opacity: s.fill === 'hatch' ? 0.85 : 1, transition: 'width .4s ease' }} />
        )
      })}
      {marker ? <div className="absolute -inset-y-[2px] w-[2px] bg-navy" style={{ left: `${Math.min(99, marker.at * 100)}%` }} /> : null}
    </div>
  )
}
