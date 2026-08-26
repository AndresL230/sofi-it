import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge has to be taught our custom `fontSize` keys (tailwind.config.ts).
 * Out of the box it only knows the stock scale, so it files `text-lede`, `text-meta`,
 * `text-metric` … under the *text-color* group — which means any cn() that also carries a
 * real colour (`cn(T.caps)` → "text-caption … text-slate", or <Money className="text-navy">)
 * silently drops the size class and the element falls back to inherited type.
 * Registering the group here is what makes the named type scale survive cn().
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['micro', 'caption', 'meta', 'body', 'lede', 'title', 'metric', 'metric-sm', 'metric-lg', 'metric-hero', 'h1', 'h2'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
