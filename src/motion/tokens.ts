import type { Transition } from 'framer-motion'

/**
 * Motion tokens for the "SoFi It" press → classify → reveal sequence.
 *
 * Everything here animates `transform` / `opacity` only. The sequence is decoration over an
 * answer that is already committed: nothing in this file may gate, delay or block a render.
 */

/** Beat 1 — press. Fast and physical, no visible overshoot: a key, not a link. */
export const PRESS_SPRING: Transition = { type: 'spring', stiffness: 700, damping: 34, mass: 0.5 }

/**
 * Beat 1 — the ripple crossing the button from the touch point.
 * Scale and opacity are timed SEPARATELY on purpose. On one shared ease-out curve the disc reached
 * the far edge and faded inside ~40ms, which is below the threshold where a press reads as a press.
 * The scale now decelerates over the full half-second and the opacity fades in fast, holds, then
 * goes — so there is actually a wash to see.
 */
export const RIPPLE_MS = 500
export const RIPPLE_SCALE_EASE = [0.4, 0, 0.2, 1] as const
export const RIPPLE_OPACITY_KEYS = [0, 0.45, 0.4, 0] as const
export const RIPPLE_OPACITY_TIMES = [0, 0.14, 0.5, 1] as const

/**
 * Beat 2 — the skeleton sizing itself to the decision. ζ ≈ 0.97 (essentially critically damped):
 * a width that overshoots and springs back reads as a mistake, not as weight.
 */
export const MORPH_SPRING: Transition = { type: 'spring', stiffness: 180, damping: 26, mass: 1 }
/** Where the skeleton starts before it knows the shape; only used when there is room to differ. */
export const MORPH_START = 0.8
/** Rows of the skeleton unfolding — the only expression of "size" on a phone, where width can't vary. */
export const MORPH_ROW_STAGGER_S = 0.055

/**
 * Beat 3 — the verdict banner landing. ζ ≈ 0.57, so it settles ~11% past and comes back.
 * This is the ONE element that gets an overshoot; the cards below it just arrive.
 */
export const LAND_SPRING: Transition = { type: 'spring', stiffness: 420, damping: 22, mass: 0.9 }

/** Beat 3 — cards staggering in beneath the banner. */
export const LEAD_HOLD_MS = 90        // the banner has the stage to itself first
export const CARD_STAGGER_MS = 40
export const CARD_STAGGER_CAP_MS = 320 // last card lands within ~350ms of the first
/** One pass of light across each card as it lands, then the whole sheen layer is removed. */
export const CARD_SHEEN_MS = 620
export const CARD_SHEEN_LEAD_MS = 90

/**
 * When the hero numeral starts rolling. NumberFlow's roll is masked, and a mask recomposites on
 * the main thread every frame — run it against the card stagger and it eats the reveal's budget.
 * Starting it after the last card has landed also reads better: the stack arrives, then the
 * number it is all about counts up.
 */
export const COUNT_UP_START_MS = LEAD_HOLD_MS + CARD_STAGGER_CAP_MS + 60

/** prefers-reduced-motion replacement: a plain crossfade, final values immediately. */
export const CROSSFADE: Transition = { duration: 0.14, ease: 'linear' }

/**
 * The celebration. Brand only — turquoise, gold, pale blue. Counts are deliberately low:
 * this is confirmation that the answer is "fine", not a payout.
 */
export const CONFETTI = {
  colors: ['#00A2C7', '#FED880', '#BFE7F2'],
  desktopCount: 40,
  mobileCount: 25,
  /** Hard ceiling on the canvas's lifetime. Under 1.2s, then it unmounts. */
  durationMs: 1100,
  /** Fires after the banner has settled, not while it is still moving. */
  delayMs: 260,
} as const
