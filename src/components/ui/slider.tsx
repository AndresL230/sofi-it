import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

/** shadcn Slider restyled to SoFi tokens: lavender track, teal range, white thumb with teal ring. */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { trackClassName?: string; rangeClassName?: string; thumbClassName?: string; thumbLabel?: string }
>(({ className, trackClassName, rangeClassName, thumbClassName, thumbLabel, ...props }, ref) => (
  <SliderPrimitive.Root ref={ref} className={cn('relative flex w-full touch-none select-none items-center py-2', className)} {...props}>
    <SliderPrimitive.Track className={cn('relative h-2 w-full grow overflow-hidden rounded-pill bg-lavender', trackClassName)}>
      <SliderPrimitive.Range className={cn('absolute h-full bg-teal', rangeClassName)} />
    </SliderPrimitive.Track>
    {/* 24px so the handle meets the minimum target size; aria-label because Radix does not
        forward the Root's label to the element the user actually operates. */}
    <SliderPrimitive.Thumb
      aria-label={thumbLabel ?? (typeof props['aria-label'] === 'string' ? props['aria-label'] : undefined)}
      className={cn(
        'block h-6 w-6 rounded-full border-[2.5px] border-teal bg-white shadow-pop transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/30 cursor-grab active:cursor-grabbing',
        thumbClassName,
      )}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName
export { Slider }
