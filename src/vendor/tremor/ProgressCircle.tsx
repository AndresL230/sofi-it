/**
 * Tremor ProgressCircle (copy-paste model) restyled: supports partial arcs (e.g. a 270° dial),
 * rounded caps, and a delayed draw-in. Children render at the center.
 */
import type { ReactNode } from 'react'

export function ProgressCircle({ value, size = 76, strokeWidth = 6, arc = 360, color = 'var(--teal)', track = 'var(--lavender)', delay = '0ms', gradientId, children, settle }: { value: number; size?: number; strokeWidth?: number; arc?: number; color?: string; track?: string; delay?: string; gradientId?: string; children?: ReactNode; settle?: boolean }) {
  const r = (size - strokeWidth) / 2
  const frac = Math.max(0, Math.min(1, value)) * (arc / 360)
  const rot = arc === 360 ? -90 : 90 + (360 - arc) / 2
  return (
    <div className="relative" style={{ width: size, height: size, animation: settle ? `settle .5s ${delay} both` : undefined }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, transform: `rotate(${rot}deg)` }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={strokeWidth} pathLength={100} strokeDasharray={`${(arc / 360) * 100} 100`} strokeLinecap="round" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={gradientId ? `url(#${gradientId})` : color} strokeWidth={strokeWidth} pathLength={100} strokeDasharray={`${frac * 100} 100`} strokeDashoffset={frac * 100} strokeLinecap="round" style={{ animation: `draw .5s ${delay} both`, transition: 'stroke-dasharray .4s' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
