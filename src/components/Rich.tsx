import type { RichText } from '@/engine/types'
import { Money, Num } from './Money'
import { DateText } from './DateText'
import { cn } from '@/lib/utils'

const TONE: Record<string, string> = { salmon: 'text-salmon-ink', teal: 'text-teal-ink', purple: 'text-purple', green: 'text-green', gold: 'text-gold-ink', navy: 'text-navy', red: 'text-red-ink' }

/** Renders engine RichText — every number flows through <Money>/<Num>, never string-formatted. */
export function Rich({ text, className, animated = true }: { text: RichText; className?: string; animated?: boolean }) {
  return (
    <span className={className}>
      {text.map((p, i) => {
        if (typeof p === 'string') return <span key={i}>{p}</span>
        if ('money' in p) return <Money key={i} value={p.money} size="inline" cents={p.cents ?? 'auto'} signed={p.signed} prefix={p.prefix} suffix={p.suffix} approx={p.approx} animated={animated} />
        if ('num' in p) return <Num key={i} value={p.num} suffix={p.suffix} prefix={p.prefix} fraction={p.fraction} signed={p.signed} animated={animated} />
        if ('date' in p) return <DateText key={i} date={p.date} fmt={p.fmt} animated={animated} />
        if ('b' in p) return <b key={i} className="font-bold text-ink"><Rich text={p.b} animated={animated} /></b>
        return <span key={i} className={cn('font-semibold', TONE[p.tone])}><Rich text={p.t} animated={animated} /></span>
      })}
    </span>
  )
}
