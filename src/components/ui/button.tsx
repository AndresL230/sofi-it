import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ctl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card active:translate-y-px disabled:pointer-events-none disabled:opacity-50 disabled:active:translate-y-0 cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-teal text-white hover:bg-[var(--teal-hover)] active:bg-[var(--teal-ink)]',
        outline: 'border-[1.5px] border-teal bg-white text-teal hover:bg-teal-tint active:bg-teal-tint2',
        ghost: 'border-[1.5px] border-lavender bg-white text-slate hover:bg-lavender-soft active:bg-lavender',
        purple: 'bg-purple text-white hover:bg-[var(--purple-hover)] active:bg-[var(--purple-ink)]',
        link: 'text-teal hover:text-teal-ink font-semibold p-0 h-auto rounded-none',
      },
      size: {
        sm: 'h-9 px-4 text-body',
        md: 'h-11 px-5 text-lede',
        lg: 'h-[52px] px-6 text-lede',
        xl: 'h-[54px] px-6.5 text-lede',
        auto: '',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
