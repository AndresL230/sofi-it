import { cn } from '@/lib/utils'

/** Mini card art: rounded rect in the issuer's palette gradient, chip, label, last-4. No bank logos. */
export function CardArt({ art, label, last4, className, size = 'md' }: { art: [string, string]; label: string; last4: string; className?: string; size?: 'md' | 'sm' }) {
  const dim = size === 'md' ? 'w-[76px] h-[48px]' : 'w-[58px] h-[37px]'
  // Long issuer labels (CUSTOM CASH, 2% EVERYTHING) would run into the last-4 mask at 76px: shrink them and drop the mask.
  const long = label.length > 9
  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-[8px] p-[6px_7px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_2px_6px_rgba(0,0,0,.18)]', dim, className)} style={{ background: `linear-gradient(135deg, ${art[0]}, ${art[1]})` }} aria-hidden>
      <div className="absolute -right-[14px] -top-[18px] h-[52px] w-[52px] rounded-full bg-white/[.12]" />
      <div className="h-[10px] w-[14px] rounded-[2.5px]" style={{ background: 'linear-gradient(135deg, #F5CE6E, #C8973B)' }} />
      {/* Artwork lettering, not UI type: it scales with the 76px plate, so it stays below the
          named scale's 10px floor — text-micro would run the label past the card edge. */}
      <div className={cn('absolute bottom-[5px] left-[7px] whitespace-nowrap font-bold', long ? 'text-[5.5px] tracking-[.04em]' : 'text-[6.5px] tracking-[.06em]')}>{label}</div>
      {long ? null : <div className="absolute bottom-[5px] right-[7px] text-[6px] opacity-75">··{last4}</div>}
    </div>
  )
}
