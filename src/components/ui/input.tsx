import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-11 w-full min-w-0 rounded-sm2 border-[1.5px] border-lavender bg-white px-3.5 text-lede text-ink outline-none transition-colors placeholder:text-slate-muted focus:border-teal',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'
export { Input }
