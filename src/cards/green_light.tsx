import type { EngineContext } from '@/engine/types'
import { defineCard, CardShell, Money, useDelay } from './kit'

interface Props { label: string; under: number; plural: boolean }

/** #3 — the passport-stamp seal: the unqualified yes. */
function GreenLight({ label, under, plural }: Props) {
  const d = useDelay()
  return (
    <CardShell className="flex items-center gap-[18px]">
      <Stamp delay={d(200)} />
      <div className="text-[14.5px] text-navy">{label} {plural ? 'are' : 'is'} <b><Money value={under} size="inline" cents="never" /> under usual</b> — enjoy it.</div>
    </CardShell>
  )
}

/** Double-ring turquoise seal rotated −8°, "COVERED" letterspaced, check beneath, rough ink edge. */
export function Stamp({ delay, size = 68 }: { delay: string; size?: number }) {
  return (
    <div className="relative shrink-0 -rotate-[8deg]" style={{ width: size, height: size, animation: `popIn .4s ${delay} both` }} aria-hidden>
      <svg viewBox="0 0 68 68" className="absolute inset-0 h-full w-full">
        <defs><filter id="stampInk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" /></filter></defs>
        <g filter="url(#stampInk)" fill="none" stroke="var(--teal)">
          <circle cx="34" cy="34" r="32" strokeWidth="2.5" />
          <circle cx="34" cy="34" r="28" strokeWidth="1.4" opacity=".55" />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-teal">
        <div className="text-[9px] font-extrabold tracking-[.12em]">COVERED</div>
        <div className="text-[14px] font-extrabold leading-none">✓</div>
      </div>
    </div>
  )
}

export const condition = (ctx: EngineContext) =>
  ctx.q.size === 'small' && ctx.q.frequency !== 'recurring' && ctx.pace.usual > 0 && ctx.pace.projectedWith <= ctx.pace.usual * 0.9 && (ctx.goalImpact ? ctx.goalImpact.onTrack : true)
export const select = (ctx: EngineContext): Props => ({ label: ctx.pace.label, under: Math.round(ctx.pace.usual - ctx.pace.projectedWith), plural: ctx.pace.label.endsWith('s') })

export default defineCard<Props>({ type: 'green_light', section: 'Verdict & framing', label: '', condition, select, Component: GreenLight, samples: [{ query: '$54 groceries' }] })
