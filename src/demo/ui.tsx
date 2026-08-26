import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** A panel section: 11px slate caps header, hairline divider. `collapsible` renders a native <details> (keyboard for free). */
export function Section({ id, title, aside, children, collapsible, defaultOpen = true }: { id: string; title: string; aside?: ReactNode; children: ReactNode; collapsible?: boolean; defaultOpen?: boolean }) {
  const head = (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
      <h3 className="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-slate">{title}</h3>
      {aside ? <div className="shrink-0 text-[11px] text-slate-muted">{aside}</div> : null}
    </div>
  )
  if (!collapsible) {
    return (
      <section data-section={id} className="border-b border-lavender-soft px-5 py-4">
        <div className="mb-[10px]">{head}</div>
        {children}
      </section>
    )
  }
  return (
    <details data-section={id} open={defaultOpen} className="group border-b border-lavender-soft px-5 py-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-sm2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 [&::-webkit-details-marker]:hidden">
        {head}
        <span aria-hidden className="w-3 text-center text-[14px] leading-none text-slate-muted transition-transform group-open:rotate-90">›</span>
      </summary>
      <div className="mt-[10px]">{children}</div>
    </details>
  )
}

type Tone = 'ghost' | 'teal' | 'outline' | 'purple' | 'danger' | 'navy'
const TONES: Record<Tone, string> = {
  ghost: 'border-[1.5px] border-lavender bg-white text-slate hover:bg-lavender-soft',
  teal: 'bg-teal text-white hover:bg-[var(--teal-hover)]',
  outline: 'border-[1.5px] border-teal bg-white text-teal hover:bg-teal-tint',
  purple: 'bg-purple text-white hover:bg-[var(--purple-hover)]',
  danger: 'border-[1.5px] border-red bg-white text-red-ink hover:bg-red-tint',
  navy: 'bg-navy text-white hover:brightness-110',
}
/** Dense 32px control for the panel (the app's <Button size="sm"> is 36px and too loud here). */
export function Mini({ className, tone = 'ghost', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button
      type="button"
      className={cn('inline-flex h-8 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-sm2 px-3 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 disabled:cursor-not-allowed disabled:opacity-40', TONES[tone], className)}
      {...props}
    />
  )
}

/** Accessible switch bound to a boolean. */
export function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-3 text-[13px] text-ink">
      <span>{label}</span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-pill transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50', checked ? 'bg-teal' : 'bg-lavender-deep')}
      >
        <span aria-hidden className={cn('absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-pop transition-[left]', checked ? 'left-[23px]' : 'left-[3px]')} />
      </button>
    </label>
  )
}

export const Caption = ({ children, className }: { children: ReactNode; className?: string }) => <p className={cn('m-0 text-[11.5px] leading-snug text-slate-muted', className)}>{children}</p>
