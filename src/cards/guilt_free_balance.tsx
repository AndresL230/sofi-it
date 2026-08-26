import type { EngineContext } from '@/engine/types'
import { defineCard, CardShell, Money, useDelay } from './kit'
import { ProgressCircle } from '@/vendor/tremor/ProgressCircle'

interface Props { monthly: number; left: number; covers: number; remainder: number; thing: string }

/** #34 — the fun-money gauge, the lightest card in the system. Gold (never red) when the purchase exceeds what's left. No warnings, ever. */
function GuiltFreeBalance({ monthly, left, covers, remainder, thing }: Props) {
  const d = useDelay()
  const exceeds = remainder > 0
  const frac = monthly > 0 ? left / monthly : 0
  const angle = -90 + frac * 360
  const R = 31, cx = 38
  const sx = cx + R * Math.cos((angle * Math.PI) / 180), sy = cx + R * Math.sin((angle * Math.PI) / 180)
  return (
    <CardShell className="flex items-center gap-[18px]">
      <div className="relative shrink-0">
        <svg width="0" height="0" aria-hidden><defs><linearGradient id="gfgTeal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--teal)" /><stop offset="100%" stopColor="var(--green)" /></linearGradient><linearGradient id="gfgGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--gold-deep)" /><stop offset="100%" stopColor="#C8973B" /></linearGradient></defs></svg>
        <ProgressCircle value={frac} size={76} strokeWidth={7} gradientId={exceeds ? 'gfgGold' : 'gfgTeal'} track="var(--lavender)" delay={d(350)} settle>
          <div className="text-[20px] font-extrabold leading-none text-navy"><Money value={left} size="inline" cents="never" /></div>
          <div className="text-[10px] text-slate">left</div>
        </ProgressCircle>
        {!exceeds ? <div className="absolute h-[7px] w-[7px] rounded-full bg-green shadow-[0_0_6px_1px_rgba(0,160,90,.7)]" style={{ left: sx - 3.5, top: sy - 3.5, animation: `sparkIn .3s ${d(850)} both` }} /> : null}
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-semibold text-navy">No-questions money</div>
        <div className="mt-[3px] text-[13px] text-slate">You set aside <Money value={monthly} size="inline" cents="never" animated={false} />/mo for exactly this. <Money value={left} size="inline" cents="never" animated={false} /> is still yours to burn.</div>
        <span className="mt-2 inline-block rounded-pill px-[11px] py-1 text-[11.5px] font-semibold" style={exceeds ? { background: 'rgba(254,216,128,.4)', color: 'var(--gold-ink)' } : { background: 'var(--green-tint)', color: 'var(--green)' }}>
          {exceeds ? <>covers <Money value={covers} size="inline" cents="never" animated={false} /> of it — the last <Money value={remainder} size="inline" cents="never" animated={false} /> is a real decision</> : <>counts <Money value={covers} size="inline" cents="never" animated={false} /> of {thing} as pre-approved ✓</>}
        </span>
      </div>
    </CardShell>
  )
}

export const condition = (ctx: EngineContext) => ctx.q.size === 'medium' && ctx.q.isDiscretionary && ctx.q.frequency !== 'recurring' && ctx.verdict.tone === 'tight'
export const select = (ctx: EngineContext): Props => ({ monthly: ctx.allowance.monthly, left: ctx.allowance.left, covers: ctx.allowance.covers, remainder: ctx.allowance.remainder, thing: ctx.q.thing.length <= 16 ? `these ${ctx.q.thing}` : 'this' })

export default defineCard<Props>({ type: 'guilt_free_balance', column: 'left', section: 'Large-purchase showpieces', label: '', condition, select, Component: GuiltFreeBalance, samples: [{ query: '$180 concert tickets', label: 'gold — exceeds what\'s left' }, { query: '$180 concert tickets', label: 'green — within allowance', override: (p) => ({ ...p, covers: p.left, remainder: 0, thing: 'these tickets' }) }] })
