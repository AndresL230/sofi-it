import { forwardRef, useCallback, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { buttonVariants } from '@/components/ui/button'
import { PRESS_SPRING, RIPPLE_MS, RIPPLE_OPACITY_KEYS, RIPPLE_OPACITY_TIMES, RIPPLE_SCALE_EASE } from '@/motion/tokens'
import { cn } from '@/lib/utils'

/** One short tap on press. Absent on desktop and on iOS Safari; failing is the expected case. */
function haptic() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(10)
  } catch {
    /* silent everywhere else */
  }
}

interface Props {
  label: string
  busyLabel: string
  busy: boolean
  onPress: () => void
  className?: string
}

/**
 * Beat 1 — the press.
 *
 * A dedicated component rather than a change to ui/button: this physicality belongs to the primary
 * CTA, and thirty-four cards share that primitive.
 *
 *  · scale to .96 on a spring, not an ease — a link fades, a key gives.
 *  · ONE ripple from the actual touch point, held in a single state slot so a rapid tap replaces
 *    it instead of stacking. It is CLIPPED TO THE BUTTON. An earlier version let it bloom past the
 *    edges — the argument being that a turquoise ripple is invisible on a turquoise button — but a
 *    240px disc washing over the input's border and the goal pill above it read as the input
 *    glitching, not as a press. Contained, in brand pale blue (#BFE7F2, light enough to read on
 *    the teal fill), it stays what it is: feedback about the button, on the button.
 *  · the label crossfades to the busy state with both labels in the SAME grid cell, so the button
 *    is permanently sized to the wider string and the swap cannot move a pixel of layout.
 *
 * `active:translate-y-px` comes along with buttonVariants; Framer writes an inline `transform` for
 * the tap scale, and inline beats the class, so the two never actually fight.
 */
export const SofiItButton = forwardRef<HTMLButtonElement, Props>(function SofiItButton(
  { label, busyLabel, busy, onPress, className },
  ref,
) {
  const reduced = useReducedMotion()
  const [ripple, setRipple] = useState<{ k: number; x: number; y: number } | null>(null)
  const point = useRef<{ x: number; y: number } | null>(null)

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    if (busy) return
    const r = e.currentTarget.getBoundingClientRect()
    point.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    haptic()
  }, [busy])

  const onClick = useCallback((e: ReactMouseEvent<HTMLButtonElement>) => {
    if (busy) return
    if (!reduced) {
      const r = e.currentTarget.getBoundingClientRect()
      // Keyboard activation has no pointer: fall back to the centre of the button.
      const p = point.current ?? { x: r.width / 2, y: r.height / 2 }
      setRipple({ k: performance.now(), x: p.x, y: p.y })
    }
    point.current = null
    onPress()
  }, [busy, onPress, reduced])

  return (
    <motion.button
      ref={ref}
      type="button"
      data-cta="sofi-it"
      disabled={busy}
      aria-busy={busy}
      onPointerDown={onPointerDown}
      onClick={onClick}
      whileTap={reduced || busy ? undefined : { scale: 0.96 }}
      transition={PRESS_SPRING}
      // disabled:opacity-100 — while busy the button is showing "Reading…", not greyed out.
      // overflow-hidden clips the ripple to the button's own rounded box. It does NOT clip the
      // focus ring, which is a box-shadow on this element rather than a descendant.
      className={cn(buttonVariants({ size: 'lg' }), 'relative shrink-0 overflow-hidden rounded-ctl disabled:opacity-100', className)}
    >
      <AnimatePresence>
        {ripple ? (
          <motion.span
            key={ripple.k}
            aria-hidden
            className="pointer-events-none absolute h-10 w-10 rounded-full bg-teal-pale"
            style={{ left: ripple.x, top: ripple.y, marginLeft: -20, marginTop: -20 }}
            // scale 7 so the disc still covers the far corner when the press lands at an edge.
            initial={{ scale: 0.15, opacity: 0 }}
            animate={{ scale: 7, opacity: [...RIPPLE_OPACITY_KEYS] }}
            transition={{
              scale: { duration: RIPPLE_MS / 1000, ease: RIPPLE_SCALE_EASE },
              opacity: { duration: RIPPLE_MS / 1000, times: [...RIPPLE_OPACITY_TIMES], ease: 'linear' },
            }}
            onAnimationComplete={() => setRipple(null)}
          />
        ) : null}
      </AnimatePresence>
      <span className="relative z-[1] grid place-items-center">
        <span className="col-start-1 row-start-1 transition-opacity duration-150" style={{ opacity: busy ? 0 : 1 }}>{label}</span>
        <span className="col-start-1 row-start-1 transition-opacity duration-150" style={{ opacity: busy ? 1 : 0 }}>{busyLabel}</span>
      </span>
    </motion.button>
  )
})
