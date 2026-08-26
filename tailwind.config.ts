import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

/**
 * SoFi Purchase Coach design tokens.
 * The nine brand colors + derived tints/inks are CSS variables in src/styles/globals.css;
 * Tailwind only references them, so swapping a palette is a one-file edit.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: 'var(--teal)', ink: 'var(--teal-ink)', tint: 'var(--teal-tint)', tint2: 'var(--teal-tint-2)', pale: 'var(--teal-pale)', soft: 'var(--teal-soft)' },
        navy: { DEFAULT: 'var(--navy)', ink: 'var(--navy)' },
        purple: { DEFAULT: 'var(--purple)', ink: 'var(--purple-ink)', tint: 'var(--purple-tint)' },
        red: { DEFAULT: 'var(--red)', ink: 'var(--red-ink)', tint: 'var(--red-tint)' },
        salmon: { DEFAULT: 'var(--salmon)', ink: 'var(--salmon-ink)', tint: 'var(--salmon-tint)' },
        gold: { DEFAULT: 'var(--gold)', ink: 'var(--gold-ink)', deep: 'var(--gold-deep)', tint: 'var(--gold-tint)' },
        slate: { DEFAULT: 'var(--slate)', muted: 'var(--slate-muted)', hair: 'var(--hairline)' },
        lavender: { DEFAULT: 'var(--lavender)', soft: 'var(--lavender-soft)', deep: 'var(--lavender-deep)' },
        green: { DEFAULT: 'var(--green)', tint: 'var(--green-tint)' },
        page: 'var(--page)',
        ink: 'var(--ink)',
        card: 'var(--card)',
        // shadcn-style semantic aliases
        background: 'var(--page)',
        foreground: 'var(--ink)',
        primary: { DEFAULT: 'var(--teal)', foreground: '#ffffff' },
        secondary: { DEFAULT: 'var(--lavender-soft)', foreground: 'var(--slate)' },
        muted: { DEFAULT: 'var(--lavender-soft)', foreground: 'var(--slate-muted)' },
        accent: { DEFAULT: 'var(--teal-tint)', foreground: 'var(--teal-ink)' },
        destructive: { DEFAULT: 'var(--red)', foreground: '#ffffff' },
        border: 'var(--lavender)',
        input: 'var(--lavender)',
        ring: 'var(--teal)',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      fontSize: {
        micro: ['10px', { lineHeight: '1.2' }],
        caption: ['11px', { lineHeight: '1.3' }],
        xs2: ['12.5px', { lineHeight: '1.4' }],
        body: ['14px', { lineHeight: '1.45' }],
        'body-lg': ['15px', { lineHeight: '1.45' }],
        title: ['17px', { lineHeight: '1.3' }],
        h1: ['clamp(24px,3vw,32px)', { lineHeight: '1.15' }],
        h2: ['clamp(21px,2.4vw,27px)', { lineHeight: '1.15' }],
      },
      borderRadius: { card: '16px', banner: '14px', ctl: '12px', sm2: '10px', pill: '999px' },
      boxShadow: {
        card: '0 6px 24px rgba(32,23,71,.06)',
        winner: 'inset 3px 0 0 var(--teal), 0 4px 16px rgba(0,162,199,.16)',
        pop: '0 2px 8px rgba(32,23,71,.15)',
        polaroid: '0 4px 10px rgba(32,23,71,.1)',
      },
      maxWidth: { shell: '1180px', quick: '640px', plan: '980px', fork: '760px' },
    },
  },
  plugins: [animate],
} satisfies Config
