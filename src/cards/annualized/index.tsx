import { useEffect, useState } from 'react'
import type { EngineContext } from '@/engine/types'
import { CardShell, Money, T, cn, useDelay } from '../kit'

interface Props { monthly: number; yearly: number; months: number }

/**
 * #25 — the multiplication made physical: twelve month-blocks fill in one at a time and the
 * row of them IS the year, so "small monthly" and "large yearly" are the same picture.
 * The yearly figure is the punchline (hero); the monthly one and the ×12 are captions.
 */
function Annualized({ monthly, yearly, months }: Props) {
  const d = useDelay()
  const [shown, setShown] = useState(0)
  const delay = parseInt(d(300)) + months * 40
  useEffect(() => { setShown(yearly) }, [yearly])
  return (
    <CardShell className="flex flex-col justify-center">
      <div className="flex items-baseline gap-2">
        <Money value={shown} size="hero" delayMs={delay} />
        <span className={cn(T.lede, 'text-slate')}>a year</span>
      </div>
      <div className="mt-3.5 flex gap-1.5" aria-hidden>
        {Array.from({ length: months }, (_, i) => (
          <div key={i} className="h-4.5 flex-1 rounded-sm bg-teal" style={{ animation: `riseIn .22s ${d(300 + i * 40)} both` }} />
        ))}
      </div>
      <div className={cn(T.caption, 'mt-2')}>
        <Money value={monthly} size="inline" suffix="/mo" className="font-bold text-ink" animated={false} /> × {months} months
      </div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ monthly: ctx.q.amount, yearly: Math.round(ctx.q.amount * 12), months: 12 })

export { meta, condition } from './meta'
export default Annualized
