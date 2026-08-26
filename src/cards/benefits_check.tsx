import type { EngineContext } from '@/engine/types'
import { defineCard, CardShell, Num } from './kit'

interface Props { shields: EngineContext['benefits'] }

/** #18 — three shields, no prose: active ones outlined teal with the day count inside; inapplicable ones ghosted. */
function BenefitsCheck({ shields }: Props) {
  return (
    <CardShell>
      <div className="flex justify-around gap-[10px] text-center">
        {shields.map((s) => (
          <div key={s.key} style={{ opacity: s.active ? 1 : 0.45 }}>
            <div className="relative mx-auto h-14 w-[52px]">
              <svg viewBox="0 0 24 26" className="h-14 w-[52px]" aria-hidden><path d="M12 1l9 3.5v7c0 6-4 9.5-9 13-5-3.5-9-7-9-13v-7z" fill="none" stroke={s.active ? 'var(--teal)' : '#B7B2BF'} strokeWidth="1.6" /></svg>
              <div className="absolute inset-0 flex items-center justify-center text-[13px] font-extrabold" style={{ color: s.active ? 'var(--teal)' : '#B7B2BF' }}>{s.days === null ? (s.active ? '✓' : '—') : <><Num value={s.days >= 365 ? Math.round(s.days / 365) : s.days} animated={false} />{s.days >= 365 ? 'y' : 'd'}</>}</div>
            </div>
            <div className="mx-auto mt-[6px] max-w-[90px] text-[11.5px] text-slate">{s.label}</div>
          </div>
        ))}
      </div>
    </CardShell>
  )
}

const EXCLUDED = ['dining', 'coffee', 'groceries', 'transport', 'subscription']
export const condition = (ctx: EngineContext) => ctx.q.size !== 'small' && !EXCLUDED.includes(ctx.q.category) && ctx.benefits.some((b) => b.active)
export const select = (ctx: EngineContext): Props => ({ shields: ctx.benefits })

export default defineCard<Props>({ type: 'benefits_check', column: 'left', section: 'Cards & rewards', label: '', condition, select, Component: BenefitsCheck, samples: [{ query: '$140 running shoes', label: 'apparel' }, { query: '$450 monitor', label: 'electronics — extended warranty' }] })
