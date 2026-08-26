import type { EngineContext } from '@/engine/types'
import { CardShell, Money, Num, useDelay } from '../kit'

interface Props { merchant: string; visits: number; slots: number; ytdSpend: number }

/** #19 — loyalty punch card: 8 rings, this month's visits punched (inner shadow), the rest empty. Zero judgment. */
function MerchantHabit({ merchant, visits, slots, ytdSpend }: Props) {
  const d = useDelay()
  return (
    <CardShell className="flex flex-col justify-center">
      <div className="text-[14px] font-bold">{merchant} — regular's card</div>
      <div className="mt-[14px] grid max-w-[342px] gap-[6px]" style={{ gridTemplateColumns: `repeat(${slots}, minmax(0, 1fr))` }}>
        {Array.from({ length: slots }, (_, i) => {
          const punched = i < visits
          return <div key={i} className="flex aspect-square w-full max-w-[34px] items-center justify-center rounded-full border-2 text-[13px] text-slate-muted" style={{ borderColor: punched ? 'var(--lavender)' : 'var(--lavender-deep)', background: punched ? '#EDEBF0' : '#fff', boxShadow: punched ? 'inset 1px 2px 4px rgba(0,0,0,.2)' : 'none', animation: punched ? `popIn .25s ${d(200 + i * 60)} both` : undefined }}>{punched ? '●' : ''}</div>
        })}
      </div>
      <div className="mt-3 text-[13px] text-slate"><Num value={visits} /> visits this month · <Money value={ytdSpend} size="inline" cents="never" /> YTD</div>
    </CardShell>
  )
}

export const select = (ctx: EngineContext): Props => ({ merchant: ctx.merchantHabit!.merchant, visits: ctx.merchantHabit!.visitsThisMonth, slots: 8, ytdSpend: ctx.merchantHabit!.ytdSpend })

export { meta, condition } from './meta'
export default MerchantHabit
