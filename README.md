# SoFi Purchase Coach

## What it is

A single-page pre-purchase decision engine demo that lives inside a clone of SoFi's Coach Insights screen. You type a thing and a price ("$60 dinner", "$1,200 flight to Lisbon in March"); a Cloudflare Worker (or a local keyword fallback) classifies the text into a small JSON shape, and the client-side engine computes every number — verdict, best card, category pace, payday runway, interest, points, goal impact — from a seeded, Plaid-shaped mock user and deals a stack of up to seven cards from a library of 34. The LLM never does math; nothing it returns is rendered as a number. One `wrangler deploy` serves the SPA and the API from a single Worker.

## Stack

From `package.json`:

| Concern | Library |
|---|---|
| App | `react` 18.3, `react-dom`, `react-router-dom` 6, `vite` 5, `typescript` 5.5 |
| Styling | `tailwindcss` 3.4, `tailwindcss-animate`, `postcss`, `autoprefixer`, `clsx`, `tailwind-merge`, `class-variance-authority` |
| Numerals | `@number-flow/react` 0.5 (every currency value, via `<Money>`) |
| Motion | `framer-motion` 11 |
| UI primitives | `@radix-ui/react-dialog`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `sonner` (shadcn-style wrappers in `src/components/ui`) |
| Charts | `recharts` 2.12 — only through the Tremor copy-paste bases in `src/vendor/tremor` (`CategoryBar`, `ProgressCircle`, `SparkAreaChart`, `Tracker`) |
| State | `zustand` 5 (goal persisted to `localStorage` under `purchase-coach-goals`) |
| Validation | `zod` 3 (Worker response and client-side API schema) |
| Worker | `wrangler` 4, `@cloudflare/workers-types` |
| Lint | `eslint` 9, `typescript-eslint`, `eslint-plugin-import`, `eslint-import-resolver-typescript` |
| Verification | `playwright-core` (headless captures only; not part of the app) |

Font: Inter from Google Fonts (`index.html`).

## Quick start

```sh
npm install
npm run dev          # Vite on http://localhost:5173
npm run worker:dev   # wrangler dev on http://127.0.0.1:8787 (optional)
npm run build        # tsc -b && vite build → dist/
npm run deploy       # build, then wrangler deploy (SPA assets + Worker)
```

Vite proxies `/api` to `http://127.0.0.1:8787` (`vite.config.ts`), so with both dev servers running the app talks to the local Worker. With only `npm run dev`, `/api/classify` fails and the client silently uses the keyword fallback classifier — every screen still works.

`wrangler.jsonc` binds the built `dist/` as `ASSETS` (SPA not-found handling), a KV namespace `CACHE`, and `RATE_LIMIT_PER_HOUR = "20"`.

### Classifier secret

```sh
npx wrangler secret put ANTHROPIC_API_KEY
```

The key is optional. Without it `worker/index.ts` returns `{ fallback: true }` for every classification and the client (`src/engine/classify.ts`) uses `src/engine/fallbackClassifier.ts` — regex amount, keyword → category, size thresholds, `/mo|month|subscription/` ⇒ recurring. The app is fully functional either way. `GET /api/health` reports `{ ok, model, hasKey }` so you can confirm which mode a deployment is in. For local Worker dev, put the key in `.dev.vars` (gitignored).

With a key: model `claude-haiku-4-5`, `max_tokens: 400`, temperature 0, 3 s timeout, query ≤ 200 chars (413 above), user text wrapped in `<q>` tags, zod-validated output, KV cache 24 h keyed on the normalized query, the nine matrix queries pre-warmed on first request, per-IP limit of 20/hour → `429` with `fallback: true`. On any non-OK response, schema mismatch, or timeout the client falls back locally; the amount is always re-parsed from the user's text, never taken from the model.

## Architecture map

```
src/
  brand.ts              BRAND constant (wordmark, product name, house card, loan name)
  data/                 Plaid-shaped mock user
    mockUser.ts         accounts[], transactions[] (seeded generator, seed 42, all dates relative to now)
    baselines.ts        monthly usual / runRate per category, REDIRECT_PLAN
    subscriptions.ts    subscription rows (+ year-ago prices), SERVICE_CATALOG
    cardRules.ts        the five cards: earn rates, caps, credits, benefits, APR
    plaidAdapter.ts     the one adapter: Plaid shapes → engine UserModel
    index.ts            NOW = new Date(); USER = buildUser(NOW)
  engine/               pure math, no React
    types.ts            the type contract (the only engine module cards may import, plus format.ts)
    context.ts          buildContext(classification, goal, user, now) → EngineContext
    paces.ts runway.ts cardMath.ts verdicts.ts goals.ts money.ts behavior.ts
    composer.ts         (ctx, eligible) → CardStack
    classify.ts         POST /api/classify with fallback
    fallbackClassifier.ts
    queries.ts          MATRIX_QUERIES, CHIPS, CHOREOGRAPHY, NON_PURCHASE_REPLY
    format.ts
  cards/                one file per card type (34) + kit.tsx + registry.ts
  components/           Money.tsx, Rich.tsx, DateText.tsx, CardArt.tsx, ui/*
  screens/              Home, Answer, Goals, CardGallery, CoachInput, Shell
  store/                zustand goal store
  vendor/tremor/        restyled Tremor bases
worker/index.ts         static assets + POST /api/classify + GET /api/health
scripts/audit-literals.mjs
```

Data flow: `data` → `plaidAdapter` → `engine/context` → `engine/composer` → `cards` (via `registry`) → `screens`.

### Enforced boundaries

Two rules from the architecture spec, plus the ones that make them stick, live in `eslint.config.js` as `import/no-restricted-paths` zones:

| Target | May not import from | Exception |
|---|---|---|
| `src/engine` | `src/cards` | — |
| `src/cards` | `src/data` | — |
| `src/cards` | `src/engine` | `engine/types.ts`, `engine/format.ts` |
| `src/engine` | `src/screens` | — |
| `src/data` | `src/engine` | `engine/types.ts` |

Cards receive engine-computed props only. `src/cards/kit.tsx` re-exports everything else a card is allowed to use (`Money`, `Num`, `Rich`, `DateText`, `CardArt`, `Badge`, `Button`, `Slider`, `CardShell`, `Caps`).

A second rule — no literal money, date, or percentage values in card JSX — is checked by `npm run audit:literals` (`scripts/audit-literals.mjs`), which scans `src/cards/*.tsx` text nodes and string props and allows only geometry contexts (viewBox, stroke, px, durations).

## Card contract

Each `src/cards/<type>.tsx` exports:

```ts
export const condition = (ctx: EngineContext) => boolean   // false ⇒ silently not rendered
export const select    = (ctx: EngineContext): Props       // pure projection of ctx into props
export default defineCard<Props>({
  type, section, label,
  condition, select, Component,
  samples: [{ query: '$60 dinner', goal?: boolean, label?: string, override? }],
  span?: 'full' | 'auto',        // full-width in two-column layouts
  column?: 'left' | 'right',     // lane in two-column layouts (default right)
  bare?: boolean,                // chrome-free (consequence_line, chip)
})
```

`src/cards/registry.ts` imports all 34 modules into `CARD_LIST` (ordered as numbered in the cards spec) and `CARDS` (keyed by type); it throws at load if the count is not 34. The Answer screen composes from it (`compose(ctx, (t) => CARDS[t].condition(ctx))`) and the Card Gallery renders every module's `samples` through `buildContext` — there is no second copy of any card markup.

Components receive `props & { actions }` where `actions` is `{ toast, goHome, trackGoal, remindLater }` — injected by the Answer screen, toast-only in the gallery.

## `<Money>` rule

All currency goes through `src/components/Money.tsx`, which wraps `@number-flow/react`. No card formats currency itself.

- `size`: `hero | lg | md | sm | inline`
- `cents`: `raised` (hero style — cents as a superscript at ~50% size) · `decimal` · `never` · `auto` (raised unless `inline`, where it is decimal only for non-integers)
- `signed`, `prefix`, `suffix`, `approx` (rounds and prepends "≈ ")
- `animated` (default true — every change rolls like an odometer)
- `delayMs` — delays the roll so count-ups land after a card's signature motion (annualized, credit_sweep, footer "after" values). Cards get their entrance delay from `useDelay()` in `kit.tsx`.

`Num` is the non-currency sibling (counts, days, percentages, points). `NumberFlowGroup` is re-exported for cards where several values change together (split_check, post_purchase_footer).

## Composer

`src/engine/composer.ts` — `compose(ctx, eligible) → { path, layout, cards, dropped }`.

Nine golden paths encode the trigger matrix, each a prioritised list of entries with the framing cards marked `required`:

| Path | Trigger | Layout |
|---|---|---|
| `crunchyroll` | `frequency === 'recurring'` | recurring |
| `flight` | large · travel | plan |
| `moving` / `large-generic` | large · housing_moving / other | plan |
| `shoes` | medium · shopping_apparel | considered |
| `monitor` | medium · shopping_electronics | considered |
| `tickets` | medium · entertainment | considered |
| `medium-generic` | medium · anything else | considered |
| `latte` / `dinner` / `uber` / `groceries` | small · coffee / dining / transport / groceries | quick |
| `small-generic` | small · anything else | quick |

Steps: (1) drop any entry whose `condition` fails — required framing cards included; (2) walk by priority applying caps — max 1 interactive (`split_check`, `cost_per_use`, `goal_collision`, `hold_24h`) and 1 showpiece (`credit_expiry`, `payday_proximity`, `price_creep`, `payment_fork`, `total_cost_of_event`, `guilt_free_balance`), 2 showpieces when `size === 'large'`; (3) drop lowest-priority optional cards until ≤ 7; (4) render in path order with `consequence_line` and `post_purchase_footer` last.

The composer never imports a card. Eligibility is injected as a function so each card's `condition` stays co-located with the card and the `engine ↛ cards` lint rule holds.

## The nine matrix queries

From `src/engine/queries.ts`:

| # | Query | Path |
|---|---|---|
| 1 | `$6 latte` | latte |
| 2 | `$60 dinner` | dinner |
| 3 | `$28 Uber` | uber |
| 4 | `$15/mo Crunchyroll` | crunchyroll |
| 5 | `$140 running shoes` | shoes |
| 6 | `$450 monitor` | monitor |
| 7 | `$180 concert tickets` | tickets |
| 8 | `$1,200 flight to Lisbon in March` | flight |
| 9 | `$2,800 to move apartments` | moving |

Home chips (`CHIPS`): `$60 dinner`, `$140 running shoes`, `$1,200 flight to Lisbon in March`, `$15/mo Crunchyroll`.

Demo choreography (`CHOREOGRAPHY`): `$6 latte` → `$60 dinner` → `$1,200 flight to Lisbon in March` (track Lisbon as a goal) → `$60 dinner` again (verdict flips to Tight, `goal_impact_chip` enters) → `$2,800 to move apartments` (`goal_collision`).

Non-purchase input gets `NON_PURCHASE_REPLY`: `Tell me a thing and a price — like "$60 dinner".`

The Worker pre-warms the same nine queries into KV on first request (`worker/index.ts` `MATRIX_QUERIES`).

## Scripts

| Script | Command | What it does |
|---|---|---|
| `dev` | `vite` | Dev server on :5173, proxies `/api` → :8787 |
| `build` | `tsc -b && vite build` | Typecheck all projects, bundle to `dist/` (manual chunks: vendor, motion, charts) |
| `preview` | `vite preview` | Serve `dist/` locally |
| `lint` | `eslint src worker` | Includes the boundary zones above |
| `typecheck` | `tsc -b` | App + worker + node tsconfigs |
| `audit:literals` | `node scripts/audit-literals.mjs` | Fails on money/date/percent literals in card JSX |
| `deploy` | `npm run build && wrangler deploy` | One Worker: assets + API |
| `worker:dev` | `wrangler dev` | Local Worker on :8787 (uses `.dev.vars` for the key) |

## Mock data notes

- `src/data/mockUser.ts` builds a Plaid response (`accounts[]`, `transactions[]` with `personal_finance_category`, ISO dates). Noise transactions come from a seeded PRNG (`src/data/seed.ts`, seed 42); anchors are hand-authored on top.
- Everything is relative to `Date.now()` at module load (`src/data/index.ts` exports `NOW` and `USER`). Nothing is pinned to a calendar date, so the demo is correct in any week.
- Anchors: biweekly payroll of $2,610 with the next payday in 3 days; rent $1,850 on the 1st; subscription rows charged monthly with year-ago prices before their raise; Blue Bottle ×4 this month (and ~4/month historically); Sweetgreen ×4 this month; two apparel buys this quarter (Nike $95 at −42 d, Blundstone $120 at −70 d); two entertainment buys this quarter (Ticketmaster $85 at −49 d, Sunset Cinema $52 at −22 d); prior trip cluster ~4 months ago (JetBlue $380 flight + $206 stay + $136 food + $78 local = 2.1× the flight).
- Month-to-date spend per category is laid down as `runRate × elapsed / daysInMonth`, so pace copy holds on any day of the month.
- Constants: persona Maya Chen, Boston; `CASH = { bufferFloor: 450, cushion: 300 }`; `ALLOWANCE = { monthly: 150, spent: 65 }`; `LOAN = { apr: 0.1099, termMonths: 12 }`; points: 48,000 Chase UR (→ Iberia) and 22,000 Amex MR.
- Accounts: SoFi Checking $3,240 · SoFi Savings $8,900 (vaults: Lisbon $1,150, Emergency $6,000) · SoFi Invest $8,952 · five credit cards (SoFi Unlimited 2% $340/$10k, Amex Gold $290, Citi Custom Cash $210/$3k, Chase Sapphire Preferred $620/$12k, Chase Freedom Unlimited $1,220/$4k, APR 24.24% — the only APR the spec gives; the others are `null`).
- Point valuations (`cardRules.ts`): Amex MR at 2¢/pt, Chase UR at 1¢/pt. Citi Custom Cash carries a 5% dining cap of $500 with $487 used.

## Renaming

`src/brand.ts` exports a single `BRAND` object — `wordmark`, `product`, `navSection`, `flatCard`, `flatCardShort`, `loan`, `plusPill`, `avatarInitials`. Edit that one object to rebrand the demo; nothing in JSX hardcodes the name. Colours are semantic CSS variables in `src/styles/globals.css` (`--teal`, `--navy`, `--purple`, `--red`, `--salmon`, `--gold`, `--slate`, `--lavender`, `--green`), so a palette swap is one block.
