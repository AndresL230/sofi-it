import type { EngineContext } from '@/engine/types'
import { defineCard, CardShell, Money, Num, Caps, useDelay } from './kit'

interface Props { flight: number; stay: number; food: number; local: number; allIn: number; ratio: number }

/** #33 — the iceberg: waterline at 35%, faceted low-poly peak above with the flight tag, a 2× mass below holding the sunk-cost chips. */
function TotalCostOfEvent({ flight, stay, food, local, allIn, ratio }: Props) {
  const d = useDelay()
  const chip = (label: string, v: number, left: string, top: string, delay: number) => (
    <div className="absolute whitespace-nowrap rounded-pill bg-white px-[9px] py-[3px] text-[10.5px] text-slate shadow-pop" style={{ left, top, animation: `fadeIn .4s ${d(delay)} both` }}>{label} ~<Money value={v} size="inline" cents="never" animated={false} /></div>
  )
  return (
    <CardShell className="px-[22px] pb-4 pt-5">
      <div className="text-[17px] font-semibold text-navy">The flight is the tip.</div>
      <div className="relative mt-[10px]">
        <svg viewBox="0 0 340 200" className="block w-full" aria-hidden>
          <defs><linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(32,23,71,.08)" /><stop offset="100%" stopColor="rgba(32,23,71,.22)" /></linearGradient></defs>
          <rect x="0" y="70" width="340" height="130" fill="url(#waterG)" rx="8" />
          <g style={{ animation: `waterShimmer .9s ${d(200)} 1` }}>
            <path d="M0 70 Q 14 66 28 70 T 56 70 T 84 70 T 112 70 T 140 70 T 168 70 T 196 70 T 224 70 T 252 70 T 280 70 T 308 70 T 336 70" fill="none" stroke="var(--teal)" strokeWidth="1.2" opacity=".55" />
            <path d="M0 78 Q 14 74 28 78 T 56 78 T 84 78 T 112 78 T 140 78 T 168 78 T 196 78 T 224 78 T 252 78 T 280 78 T 308 78 T 336 78" fill="none" stroke="var(--teal)" strokeWidth="1" opacity=".25" />
          </g>
          <polygon points="170,20 196,70 144,70" fill="#FBFAFC" stroke="var(--lavender)" strokeWidth="1" />
          <polygon points="170,20 183,46 196,70 172,58" fill="#EFEDF3" />
          <polygon points="138,70 202,70 232,126 178,188 112,124" fill="#DCD7E4" />
          <polygon points="138,70 158,118 178,188 112,124" fill="#CDC5D8" />
          <polygon points="202,70 232,126 178,188 188,118" fill="#D4CCDE" />
        </svg>
        <div className="absolute left-[57%] top-[2%] whitespace-nowrap rounded-pill bg-white px-[10px] py-1 text-[11px] font-bold text-navy shadow-pop">Flight <Money value={flight} size="inline" cents="never" animated={false} /></div>
        {chip('Stay', stay, '12%', '44%', 500)}
        {chip('Food & out', food, '52%', '60%', 620)}
        {chip('Local + extras', local, '24%', '76%', 740)}
      </div>
      <div className="mt-3 flex items-baseline gap-[10px]"><Caps className="tracking-[.08em]">Realistic all-in</Caps><Money value={allIn} size="md" approx /></div>
      <div className="mt-[2px] text-[10px] text-slate-muted">based on your last trip running <Num value={ratio} fraction={1} animated={false} />× the flight.</div>
    </CardShell>
  )
}

export const condition = (ctx: EngineContext) => ctx.eventCost !== null && ctx.q.size === 'large'
export const select = (ctx: EngineContext): Props => ({ flight: ctx.eventCost!.flight, stay: ctx.eventCost!.stay, food: ctx.eventCost!.food, local: ctx.eventCost!.local, allIn: ctx.eventCost!.allIn, ratio: ctx.eventCost!.ratio })

export default defineCard<Props>({ type: 'total_cost_of_event', section: 'Large-purchase showpieces', label: '', condition, select, Component: TotalCostOfEvent, samples: [{ query: '$1,200 flight to Lisbon in March' }] })
