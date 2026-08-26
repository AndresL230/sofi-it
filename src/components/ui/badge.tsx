import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-pill font-semibold whitespace-nowrap', {
  variants: {
    tone: {
      teal: 'bg-teal-tint text-teal-ink',
      salmon: 'bg-salmon-tint text-salmon-ink',
      gold: 'bg-gold text-gold-ink',
      gray: 'bg-lavender text-slate',
      green: 'bg-green-tint text-green',
      purple: 'bg-purple text-white',
      navy: 'bg-navy text-white',
      red: 'bg-red-tint text-red-ink',
      tealSolid: 'bg-teal text-white',
      salmonSolid: 'bg-salmon text-white',
    },
    size: { xs: 'text-caption px-2 py-0.5', sm: 'text-meta px-2.5 py-1', md: 'text-meta px-3 py-1', lg: 'text-body px-4.5 py-1.5' },
  },
  defaultVariants: { tone: 'teal', size: 'sm' },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />
}
export { badgeVariants }
