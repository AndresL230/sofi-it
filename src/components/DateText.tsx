import { AnimatePresence, motion } from 'framer-motion'
import { fmtDate } from '@/engine/format'
import { Num } from './Money'
import type { RichPart } from '@/engine/types'
import { cn } from '@/lib/utils'

type Fmt = Extract<RichPart, { date: Date }>['fmt']

/**
 * Animated date: the month crossfades, the day-of-month rolls through NumberFlow
 * (goal_collision's "dates on NumberFlow", goal_impact_chip's "Apr 3 → Apr 5").
 */
export function DateText({ date, fmt = 'md', animated = true, className }: { date: Date; fmt?: Fmt; animated?: boolean; className?: string }) {
  if (fmt !== 'md') {
    const s = fmtDate(date, fmt)
    return (
      <span className={cn('inline-grid', className)}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={s} initial={animated ? { opacity: 0, y: 4 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }} className="[grid-area:1/1]">{s}</motion.span>
        </AnimatePresence>
      </span>
    )
  }
  const month = fmtDate(date, 'month')
  return (
    <span className={cn('inline-flex items-baseline gap-[0.25em] whitespace-nowrap', className)}>
      <span className="inline-grid">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={month} initial={animated ? { opacity: 0, y: 4 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }} className="[grid-area:1/1]">{month}</motion.span>
        </AnimatePresence>
      </span>
      <Num value={date.getDate()} animated={animated} />
    </span>
  )
}
