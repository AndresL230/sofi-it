import { useEffect, useRef, useState } from 'react'
import type { CardType, Verdict } from '@/types'
import { CONFETTI } from './tokens'

/**
 * A `fine` verdict alone is not enough to celebrate — the stack also has to contain a card that
 * is actively good news. These three are the only positive signals in the deck.
 *
 * (points_offset can only be dealt on a `large` purchase, and `large` never returns tone `fine`,
 * so in practice green_light and credit_sweep are the two that can fire. It stays listed because
 * the rule is "a genuinely positive card", not "these two card ids".)
 */
export const POSITIVE_SIGNALS: readonly CardType[] = ['green_light', 'credit_sweep', 'points_offset']

export interface CelebrationGate {
  /** The composed stack, as dealt. */
  cards: readonly CardType[]
  /** ctx.goalImpact?.daysPushed ?? 0 — anything above zero is a goal collision. */
  goalDaysPushed: number
}

/**
 * The ONE place that decides whether the reveal celebrates. Deliberately a named function taking
 * the verdict as its argument rather than an inline condition at the call site: the negative
 * cases below are the point of the feature, and an inline `&&` chain is one careless edit away
 * from congratulating someone for overspending.
 *
 *   tone 'tight'  → never. The user is being warned.
 *   tone 'over'   → never. The user is being told they can't afford it.
 *   goal collision → never, at any tone. Spending the Lisbon fund is not a win.
 *   'fine' with no positive card → the spring settle, and nothing more.
 */
export function shouldCelebrate(verdict: Verdict, gate: CelebrationGate): boolean {
  if (verdict.tone !== 'fine') return false
  if (gate.goalDaysPushed > 0) return false
  if (gate.cards.includes('goal_collision')) return false
  return gate.cards.some((c) => POSITIVE_SIGNALS.includes(c))
}

interface Particle { x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number; color: string }

/**
 * Brand confetti, hand-rolled on a single <canvas>.
 *
 * Canvas rather than 40 animated DOM nodes: one composited layer and one rAF loop beats 40
 * elements each with their own transform on a mid-range Android. The loop stops itself at
 * CONFETTI.durationMs and the caller unmounts the canvas — nothing idles in the DOM.
 *
 * Mount this ONLY behind shouldCelebrate(). It has no opinion about verdicts.
 */
export function Celebration({ origin, onDone }: { origin: { x: number; y: number }; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    const cv = ref.current
    const g = cv?.getContext('2d', { alpha: true, desynchronized: true })
    if (!cv || !g) { done.current(); return }

    // The canvas covers only the band the particles can reach in ~1.1s, not the whole viewport:
    // every frame costs a clear plus a composite of exactly this many pixels, and a full-screen
    // layer at device resolution pins the burst to 30fps on a phone. Backing store is capped at
    // 1.25x for the same reason — these are solid-colour rectangles nobody is inspecting.
    const vw = window.innerWidth, vh = window.innerHeight
    const top = Math.max(0, origin.y - 220)
    const H = Math.min(vh - top, 780)
    const dpr = Math.min(1.25, window.devicePixelRatio || 1)
    cv.style.top = `${top}px`
    cv.style.height = `${H}px`
    cv.width = Math.round(vw * dpr)
    cv.height = Math.round(H * dpr)
    g.scale(dpr, dpr)
    g.translate(0, -top)   // particles keep viewport coordinates; the band does the offsetting
    const W = vw

    const n = W < 640 ? CONFETTI.mobileCount : CONFETTI.desktopCount
    const ps: Particle[] = []
    for (let i = 0; i < n; i++) {
      // Two fans, left and right of the banner, thrown up and out. Gravity does the arc down.
      const side = i % 2 ? 1 : -1
      const angle = -Math.PI / 2 + side * (0.22 + Math.random() * 0.62)
      const speed = 250 + Math.random() * 210
      ps.push({
        x: origin.x, y: origin.y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 11,
        w: 5 + Math.random() * 4, h: 8 + Math.random() * 5,
        color: CONFETTI.colors[i % CONFETTI.colors.length],
      })
    }

    const GRAVITY = 900
    let raf = 0
    let last = performance.now()
    let t = 0
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000)   // clamped so a dropped frame doesn't teleport
      last = now
      t += dt * 1000
      g.clearRect(0, top, W, H)
      const k = Math.min(1, t / CONFETTI.durationMs)
      g.globalAlpha = k < 0.65 ? 1 : 1 - (k - 0.65) / 0.35
      for (const p of ps) {
        p.vy += GRAVITY * dt
        p.vx *= 0.995
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.vr * dt
        g.save()
        g.translate(p.x, p.y)
        g.rotate(p.rot)
        g.fillStyle = p.color
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        g.restore()
      }
      if (t < CONFETTI.durationMs) { raf = requestAnimationFrame(step); return }
      g.clearRect(0, top, W, H)
      done.current()
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // `onDone` is held in a ref so re-rendering the parent never restarts the burst.
  }, [origin.x, origin.y])

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed left-0 right-0 z-[60] w-full" />
}

/**
 * Self-contained trigger for the burst. It owns its own timer and origin state so that firing the
 * celebration re-renders THIS component and nothing else — holding that state on the answer screen
 * re-rendered all seven cards in the middle of their own entrance, which is exactly the frame
 * budget the reveal cannot spare.
 *
 * `armed` is the result of shouldCelebrate(); this component never second-guesses it.
 */
export function VerdictCelebration({ armed, targetRef }: { armed: boolean; targetRef: React.RefObject<HTMLElement> }) {
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null)
  useEffect(() => {
    if (!armed) { setOrigin(null); return }
    // Fires after the banner has settled, never while it is still moving.
    const t = setTimeout(() => {
      const r = targetRef.current?.getBoundingClientRect()
      if (r) setOrigin({ x: r.left + r.width / 2, y: r.top + r.height * 0.6 })
    }, CONFETTI.delayMs)
    return () => clearTimeout(t)
  }, [armed, targetRef])
  if (!origin) return null
  return <Celebration origin={origin} onDone={() => setOrigin(null)} />
}
