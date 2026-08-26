import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ctl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-teal text-white hover:bg-[var(--teal-hover)]',
        outline: 'border-[1.5px] border-teal bg-white text-teal hover:bg-teal-tint',
        ghost: 'border-[1.5px] border-lavender bg-white text-slate hover:bg-lavender-soft',
        purple: 'bg-purple text-white hover:bg-[var(--purple-hover)]',
        link: 'text-teal hover:text-teal-ink font-semibold p-0 h-auto rounded-none',
      },
      size: {
        sm: 'h-9 px-4 text-[13.5px]',
        md: 'h-11 px-5 text-[14px]',
        lg: 'h-[52px] px-6 text-[15px]',
        xl: 'h-[54px] px-[26px] text-[15px]',
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
