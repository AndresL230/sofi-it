import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Classification } from '@/types'
import { CROSSFADE, MORPH_ROW_STAGGER_S, MORPH_SPRING, MORPH_START } from './tokens'

interface Block { span: number; h: number }
export interface SkeletonShape {
  key: 'quick' | 'considered' | 'plan' | 'recurring'
  /** The measure the finished answer will occupy (see Answer.tsx: `quick` gets max-w-plan). */
  width: number
  rows: Block[][]
}

const SHELL = 1180, PLAN = 980

/**
 * Four skeletons, one per answer mode. Block counts and heights are the *shape of the decision*:
 * a small purchase is a banner and a pair, a plan is a banner and two showpieces. On a phone,
 * where every answer is one column and the widths can't differ, this is what carries the beat.
 */
const SHAPES: Record<SkeletonShape['key'], SkeletonShape> = {
  quick: { key: 'quick', width: PLAN, rows: [[{ span: 12, h: 96 }], [{ span: 12, h: 60 }], [{ span: 7, h: 112 }, { span: 5, h: 112 }], [{ span: 12, h: 40 }]] },
  considered: { key: 'considered', width: SHELL, rows: [[{ span: 12, h: 96 }], [{ span: 12, h: 60 }], [{ span: 6, h: 168 }, { span: 6, h: 168 }], [{ span: 4, h: 96 }, { span: 4, h: 96 }, { span: 4, h: 96 }], [{ span: 12, h: 40 }]] },
  plan: { key: 'plan', width: SHELL, rows: [[{ span: 12, h: 104 }], [{ span: 7, h: 208 }, { span: 5, h: 208 }], [{ span: 6, h: 150 }, { span: 6, h: 150 }], [{ span: 12, h: 40 }]] },
  recurring: { key: 'recurring', width: SHELL, rows: [[{ span: 12, h: 96 }], [{ span: 6, h: 168 }, { span: 6, h: 168 }], [{ span: 12, h: 72 }], [{ span: 12, h: 40 }]] },
}

/**
 * Which shape the answer will take, read off the *local* parse of the query — which is synchronous,
 * so the morph can start on the same frame as the press instead of waiting for the classifier.
 *
 * Presentation only. This mirrors engine/composer.layoutFor's size → layout mapping but never
 * feeds it: whatever the composer decides still wins, and a mismatch costs a slightly wrong
 * skeleton for ~600ms, never a wrong answer.
 */
export function skeletonShape(c: Classification): SkeletonShape {
  if (!c.is_purchase) return SHAPES.quick
  if (c.frequency === 'recurring') return SHAPES.recurring
  if (c.size === 'large') return SHAPES.plan
  return c.size === 'medium' ? SHAPES.considered : SHAPES.quick
}

/**
 * Beat 2 — the container morphing toward the shape of the answer.
 *
 * The widen is a `scaleX` on the group, never an animated `width`: a small purchase settles at
 * ~0.86 of the shell and a large one runs out to the full 1180px. Below ~1000px there is no room
 * for the two to differ, so the scale is pinned to 1 and the rows carry the beat on their own.
 */
export function AnswerSkeleton({ shape }: { shape: SkeletonShape }) {
  const reduced = useReducedMotion()
  const host = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<{ from: number; to: number }>({ from: 1, to: 1 })

  useLayoutEffect(() => {
    const w = host.current?.offsetWidth ?? shape.width
    const to = Math.min(1, shape.width / w)
    setScale({ from: w >= 1000 ? MORPH_START : to, to })
  }, [shape.width])

  return (
    <div ref={host} aria-hidden data-skeleton={shape.key} className="mb-5.5">
      <motion.div
        className="flex origin-left flex-col gap-4"
        initial={{ scaleX: scale.from }}
        animate={{ scaleX: scale.to }}
        transition={reduced ? CROSSFADE : MORPH_SPRING}
      >
        {shape.rows.map((row, r) => (
          <motion.div
            key={r}
            className="grid grid-cols-1 gap-4 md:grid-cols-12"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={reduced ? CROSSFADE : { duration: 0.34, delay: r * MORPH_ROW_STAGGER_S, ease: [0.22, 1, 0.36, 1] }}
          >
            {row.map((b, i) => (
              <div key={i} className="pc-skel rounded-card md:[grid-column:span_var(--span)]" style={{ height: b.h, ['--span' as string]: b.span }} />
            ))}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
