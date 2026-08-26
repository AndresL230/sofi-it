import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

/** shadcn Slider restyled to SoFi tokens: lavender track, teal range, white thumb with teal ring. */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { rangeClassName?: string; thumbClassName?: string }
>(({ className, rangeClassName, thumbClassName, ...props }, ref) => (
  <SliderPrimitive.Root ref={ref} className={cn('relative flex w-full touch-none select-none items-center py-2', className)} {...props}>
    <SliderPrimitive.Track className="relative h-[6px] w-full grow overflow-hidden rounded-pill bg-lavender-soft">
      <SliderPrimitive.Range className={cn('absolute h-full bg-teal', rangeClassName)} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        'block h-5 w-5 rounded-full border-[2.5px] border-teal bg-white shadow-pop transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/30 cursor-grab active:cursor-grabbing',
        thumbClassName,
      )}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName
export { Slider }
