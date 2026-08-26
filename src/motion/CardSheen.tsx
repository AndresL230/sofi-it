import { useEffect, useState } from 'react'
import { CARD_SHEEN_LEAD_MS, CARD_SHEEN_MS } from './tokens'

/**
 * One pass of light across a card as it lands — the classify sweep resolving onto real content.
 *
 * It unmounts itself when its own pass is over, so the answer screen is left with nothing
 * animating and no extra layers. Owning that timer here (rather than one flag on the answer
 * screen) matters for more than tidiness: a flag up there re-renders every card in the stack.
 *
 * The clip lives on this overlay, never on the card, so nothing a card draws outside its own
 * box gets cut off.
 */
export function CardSheen({ delay }: { delay: number }) {
  const [on, setOn] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setOn(false), delay + CARD_SHEEN_LEAD_MS + CARD_SHEEN_MS + 80)
    return () => clearTimeout(t)
  }, [delay])
  if (!on) return null
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-card">
      <span className="pc-sheen-bar" style={{ animationDelay: `${delay + CARD_SHEEN_LEAD_MS}ms` }} />
    </span>
  )
}
