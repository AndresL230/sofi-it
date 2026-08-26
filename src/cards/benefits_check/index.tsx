import type { EngineContext } from '@/engine/types'
import { CardShell, Num, Caps, T, cn } from '../kit'

interface Props { shields: EngineContext['benefits'] }

type Shield = Props['shields'][number]

/**
 * #18 — three shields, no prose. One icon scale, one stroke weight, the number always in
 * the same place. Unavailable reads as unavailable without leaning on colour: dashed
 * outline, no fill, an em dash, and "not on your cards" spelled out.
 *
 * Two layouts, switched on the CARD's own width (container query, not the viewport):
 * under 380px of content box it is the three-across grid the narrow column was tuned for;
 * at or above it the shields turn into a full-height list — icon left, name and issuer
 * beside it — so a card stretched to a tall bento row fills with generous rows instead of
 * floating a 250px block in the middle of 527px of white.
 */
function BenefitsCheck({ shields }: Props) {
  return (
    <CardShell className="flex h-full flex-col [container-type:inline-size]">
      <Caps>Coverage on your cards</Caps>
      {/* Column-major flow, so shields / benefit names / issuers each form one aligned row. */}
      <div className="mt-3.5 grid flex-1 auto-cols-fr grid-flow-col grid-rows-[auto_auto_auto] content-center items-start gap-x-1.5 gap-y-2 text-center [@container_(min-width:380px)]:flex [@container_(min-width:380px)]:flex-col [@container_(min-width:380px)]:items-stretch [@container_(min-width:380px)]:text-left">
        {shields.map((s) => {
          const [name, issuer] = split(s.label)
          return (
            /* `contents` at narrow flattens the group into the grid, so the three sub-rows
               still align; at wide the same element becomes the list row. */
            <div key={s.key} className="contents [@container_(min-width:380px)]:flex [@container_(min-width:380px)]:flex-1 [@container_(min-width:380px)]:items-center [@container_(min-width:380px)]:gap-4 [@container_(min-width:380px)]:border-t [@container_(min-width:380px)]:border-lavender [@container_(min-width:380px)]:first:border-t-0">
              <ShieldIcon s={s} name={name} />
              <div className="contents [@container_(min-width:380px)]:block">
                <div className={cn(T.caption, 'font-semibold leading-snug [@container_(min-width:380px)]:text-lede', s.active ? 'text-ink' : 'text-slate-muted')}>{name}</div>
                <div className={cn(T.micro, 'leading-snug [@container_(min-width:380px)]:mt-0.5 [@container_(min-width:380px)]:text-caption')}>{s.active ? issuer : 'not on your cards'}</div>
              </div>
            </div>
          )
        })}
      </div>
    </CardShell>
  )
}

function ShieldIcon({ s, name }: { s: Shield; name: string }) {
  const tone = s.active ? 'var(--teal)' : 'var(--lavender-deep)'
  const glyph = s.active ? 'var(--teal)' : 'var(--slate-muted)'
  const value = s.days === null ? null : s.days >= 365 ? { n: Math.round(s.days / 365), unit: 'y' } : { n: s.days, unit: 'd' }
  const spoken = s.active ? (value ? `${value.n} ${value.unit === 'y' ? 'years' : 'days'}` : 'included') : 'not on your cards'
  return (
    <div className="relative mx-auto h-14 w-14 shrink-0 [@container_(min-width:380px)]:mx-0" role="img" aria-label={`${name}: ${spoken}`}>
      {/* vectorEffect keeps the stroke at 1.6px whatever the box scale, so all three read identically. */}
      <svg viewBox="0 0 24 26" className="h-14 w-14" aria-hidden>
        <path
          d="M12 1l9 3.5v7c0 6-4 9.5-9 13-5-3.5-9-7-9-13v-7z"
          fill={s.active ? 'var(--teal-tint)' : 'none'}
          stroke={tone}
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeDasharray={s.active ? undefined : '3 2.5'}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* Number always lands on the same line of the shield, whatever its length. */}
      <div className="absolute inset-x-0 top-0 flex h-12 items-center justify-center gap-px" style={{ color: glyph }}>
        {value ? (
          <>
            <span className="text-body font-extrabold tabular-nums leading-none"><Num value={value.n} animated={false} /></span>
            <span className="text-micro font-bold leading-none">{value.unit}</span>
          </>
        ) : (
          <span className="text-body font-extrabold leading-none">{s.active ? '✓' : '—'}</span>
        )}
      </div>
    </div>
  )
}

/** Engine hands over "Purchase protection · Amex Gold"; the card puts the two parts on their own rows. */
function split(label: string): [string, string] {
  const i = label.lastIndexOf(' · ')
  return i < 0 ? [label, ''] : [label.slice(0, i), label.slice(i + 3)]
}

export const select = (ctx: EngineContext): Props => ({ shields: ctx.benefits })

export { meta, condition } from './meta'
export default BenefitsCheck
