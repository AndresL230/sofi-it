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
      /**
       * Deliberate type scale — cards use these names, never arbitrary text-[Npx].
       * Roles: micro/caption/meta = annotation · body/lede = copy · title = card headline
       * metric-* = currency and figures · h1/h2 = page and section.
       */
      fontSize: {
        micro: ['10px', { lineHeight: '1.25' }],
        caption: ['11px', { lineHeight: '1.3' }],
        meta: ['12px', { lineHeight: '1.35' }],
        body: ['13px', { lineHeight: '1.45' }],
        lede: ['14px', { lineHeight: '1.4' }],
        title: ['16px', { lineHeight: '1.3' }],
        'metric-sm': ['18px', { lineHeight: '1' }],
        metric: ['22px', { lineHeight: '1' }],
        'metric-lg': ['27px', { lineHeight: '1' }],
        'metric-hero': ['34px', { lineHeight: '1' }],
        // h1/h2 are fluid PAGE/SECTION headings. Careful: h2 clamps down to 21px below a
        // ~1125px viewport, i.e. BELOW text-metric (22px) — never pair an h2 headline with a
        // metric-sized figure inside a card, or the hierarchy inverts on narrow viewports.
        h1: ['clamp(24px,3vw,32px)', { lineHeight: '1.15' }],
        h2: ['clamp(21px,2.4vw,27px)', { lineHeight: '1.15' }],
      },
      // Half-steps the default 4px scale lacks. Deliberately NO integer keys here: Tailwind's
      // defaults already define 13/14/17 etc, and redefining one silently resizes every
      // existing h-14 / w-14 / p-14 in the codebase.
      spacing: { 4.5: '18px', 5.5: '22px', 6.5: '26px', 7.5: '30px', 17.5: '70px' },
      borderRadius: { card: '16px', banner: '14px', ctl: '12px', sm2: '10px', pill: '999px' },
      boxShadow: {
        card: 'var(--shadow-card)',
        winner: 'inset 3px 0 0 var(--teal), 0 4px 16px rgba(0,162,199,.16)',
        pop: '0 2px 8px rgba(32,23,71,.15)',
        polaroid: '0 4px 10px rgba(32,23,71,.1)',
      },
      maxWidth: { shell: '1180px', quick: '640px', plan: '980px', fork: '760px' },
    },
  },
  plugins: [animate],
} satisfies Config
