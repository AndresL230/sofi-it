# SoFi Purchase Coach

## What it is

A single-page pre-purchase decision engine demo that lives inside a clone of SoFi's Coach Insights screen. You type a thing and a price ("$60 dinner", "$1,200 flight to Lisbon in March"); a Cloudflare Worker (or a local keyword fallback) classifies the text into a small JSON shape, and the client-side engine computes every number — verdict, best card, category pace, payday runway, interest, points, goal impact — from the active profile's seeded, Plaid-shaped mock user and deals a stack of up to seven cards from a library of 34. The LLM never does math; nothing it returns is rendered as a number. One `wrangler deploy` serves the SPA and the API from a single Worker.

Production: **https://meridian.andresl.dev** (custom domain) and https://sofi-purchase-coach.andreslopez-23061.workers.dev (both live; `wrangler.jsonc` sets `workers_dev: true` alongside the custom-domain route).

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
| State | `zustand` 5 (goal persisted to `localStorage` under `purchase-coach-goals`; active profile under `purchase-coach-profile`) |
| Validation | `zod` 3 (Worker response and client-side API schema) |
| QR | `qrcode` (only in the lazy `/share` chunk) |
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

`wrangler.jsonc` binds the built `dist/` as `ASSETS` (SPA not-found handling), a KV namespace `CACHE`, `RATE_LIMIT_PER_HOUR = "20"`, `workers_dev: true`, and the custom-domain route `meridian.andresl.dev`.

### Time travel

`src/data/index.ts` fixes the app clock once at module load: `?now=YYYY-MM-DD` on any URL (or `VITE_NOW` at build time) becomes `NOW`, and every date, pace, payday, credit expiry and goal deadline is derived from it. Invalid values fall back to the real clock. Used by the demo controls and the Q4 checks (`/answer?q=%2460%20dinner&now=2026-12-31`).

### Classifier secret

```sh
npx wrangler secret put ANTHROPIC_API_KEY
```

The key is optional and **is not currently set on production** — `GET /api/health` on both URLs returns `{"ok":true,"model":"claude-haiku-4-5","hasKey":false}`. Setting the secret takes effect without a redeploy; re-check `/api/health` for `hasKey: true`. Without it `worker/index.ts` returns `{ fallback: true }` for every classification and the client (`src/engine/classify.ts`) uses `src/engine/fallbackClassifier.ts` — anchored `$` amount parsing (a `$`-figure wins over a bare number; no leading `-`, no exponent, `k` scales ×1000, anything above 1,000,000 is a non-purchase), keyword → category, size thresholds, `/mo|month|subscription/` ⇒ recurring. The app is fully functional either way. For local Worker dev, put the key in `.dev.vars` (gitignored).

With a key: model `claude-haiku-4-5`, `max_tokens: 400`, temperature 0, 3 s timeout, query ≤ 200 chars (413 above), user text wrapped in `<q>` tags, zod-validated output, KV cache 24 h keyed on the normalized query, the nine matrix queries pre-warmed on first request, per-IP limit of 20/hour → `429` with `fallback: true`. On any non-OK response, schema mismatch, or timeout the client falls back locally; the amount is always re-parsed from the user's text, never taken from the model.

## Architecture map

```
src/
  types.ts              THE contract: Classification, UserModel, EngineContext, Profile, CardMeta, CardProps, CardActions
  brand.ts              BRAND constant (wordmark, product name, house card, loan name, publicUrl)
  data/                 Plaid-shaped mock user
    mockUser.ts         accounts[], transactions[] (seeded generator, seed 42, all dates relative to now)
    baselines.ts        monthly usual / runRate per category, REDIRECT_PLAN
    subscriptions.ts    subscription rows (+ year-ago prices), SERVICE_CATALOG
    cardRules.ts        the five cards: earn rates, caps, credits, benefits, APR
    plaidAdapter.ts     the one adapter: Plaid shapes → engine UserModel
    profiles/           PROFILES: Profile[] (maya.ts today; devon/priya pending the addendum)
    index.ts            NOW (real clock, or ?now= / VITE_NOW override); USER = buildUser(NOW)
  engine/               pure math, no React
    types.ts            compatibility re-export of src/types.ts
    context.ts          buildContext(classification, goal, user, now) → EngineContext
    paces.ts runway.ts cardMath.ts verdicts.ts goals.ts money.ts behavior.ts
    composer.ts         (ctx, metas) → CardStack — scoring + matrix bypass
    classify.ts         POST /api/classify with fallback
    fallbackClassifier.ts
    queries.ts          MATRIX_QUERIES, CHIPS, CHOREOGRAPHY, NON_PURCHASE_REPLY
    format.ts
  cards/                one folder per card (34): <id>/{index.tsx, meta.ts, graphic.tsx?}
    index.ts            import.meta.glob registry → CARDS, CARD_LIST, CARD_METAS
    kit.tsx             everything a card may import besides types/format
    _ranking.tsx        shared by best_card_row / card_ranking
  components/           Money.tsx, Rich.tsx, DateText.tsx, CardArt.tsx, ui/*
  screens/              Home, Answer, Goals, CardGallery, CoachInput, Shell, SharePage (lazy)
  store/                index.ts (goal + session), profile.ts (active profile, useUser)
  vendor/tremor/        restyled Tremor bases
worker/index.ts         static assets + POST /api/classify + GET /api/health
scripts/audit-literals.mjs
public/favicon.svg
```

Data flow: `profiles/<id>.build(NOW)` → `plaidAdapter` → `useUser()` → `engine/context` → `engine/composer` (fed `CARD_METAS`) → `cards` (via the glob registry) → `screens`.

### Enforced boundaries

Two rules from the architecture spec, plus the ones that make them stick, live in `eslint.config.js` as `import/no-restricted-paths` zones:

| Target | May not import from | Exception |
|---|---|---|
| `src/engine` | `src/cards` | — |
| `src/cards` | `src/data` | — |
| `src/cards` | `src/engine` | `engine/types.ts`, `engine/format.ts` (`src/types.ts` is unrestricted) |
| `src/engine` | `src/screens` | — |
| `src/data` | `src/engine` | `engine/types.ts` |

Cards receive engine-computed props only. `src/cards/kit.tsx` re-exports everything else a card is allowed to use (`Money`, `Num`, `NumberFlowGroup`, `Rich`, `DateText`, `CardArt`, `Badge`, `Button`, `Slider`, `CardShell`, `Caps`, `useDelay`, `cn`).

A second rule — no literal money, date, or percentage values in card JSX — is checked by `npm run audit:literals` (`scripts/audit-literals.mjs`), which scans every `.tsx` inside `src/cards/*/` (card folders only; `kit.tsx` and `_ranking.tsx` are skipped) for text nodes and string props and allows only geometry contexts (viewBox, stroke, px, durations).

## Card contract

One folder per card: `src/cards/<id>/` with two required files (plus an optional `graphic.tsx`). Types come from `src/types.ts`.

`meta.ts` — the card's self-description, read by the registry and the composer:

```ts
export const condition = (ctx: EngineContext) => boolean     // false ⇒ silently not rendered
export const meta: CardMeta = {
  id,            // must equal the folder name (the registry throws otherwise)
  group,         // CardSection, e.g. 'Behavior lens'
  kind,          // 'core' | 'interactive' | 'showpiece' — what the caps count
  priority,      // static base priority (higher = kept first when over the cap)
  condition,
  relevance,     // (ctx) => 0..1 — how much this card matters for THIS purchase
  anchor?,       // 'first' | 'last' — framing cards, never dropped
  span?,         // 'full' | 'auto'   full-width in two-column layouts
  column?,       // 'left' | 'right'  lane in two-column layouts (default right)
  bare?,         // chrome-free (consequence_line, chip)
  samples: [{ query: '$60 dinner', goal?: boolean, label?: string, override? }],
}
```

`index.tsx` — the component and its projection:

```ts
export const select = (ctx: EngineContext): Props   // pure projection of ctx into props
export { meta, condition } from './meta'
export default Component                            // receives CardProps<Props> = Props & { actions }
```

`src/cards/index.ts` is an `import.meta.glob('./*/index.tsx', { eager: true })` registry: it builds `CARDS` (keyed by id), `CARD_LIST` (ordered as numbered in the cards spec) and `CARD_METAS`, and throws at load if any `meta.id` differs from its folder name or any of the 34 `CARD_TYPES` is missing. Adding a card means adding one folder plus its entry in `CARD_TYPES` — no other shared file changes. The Answer screen composes with `compose(ctx, CARD_METAS)`, and the Card Gallery renders every entry's `samples` through `buildContext` — there is no second copy of any card markup.

`actions` (`CardActions`) is `{ toast, goHome, trackGoal, remindLater }` — injected by the Answer screen, `noopActions`/toast-only in the gallery.

## `<Money>` rule

All currency goes through `src/components/Money.tsx`, which wraps `@number-flow/react`. No card formats currency itself.

- `size`: `hero | lg | md | sm | inline`
- `cents`: `raised` (hero style — cents as a superscript at ~50% size) · `decimal` · `never` · `auto` (raised unless `inline`, where it is decimal only for non-integers)
- `signed`, `prefix`, `suffix`, `approx` (rounds and prepends "≈ ")
- `animated` (default true — every change rolls like an odometer)
- `delayMs` — delays the roll so count-ups land after a card's signature motion (annualized, credit_sweep, footer "after" values). Cards get their entrance delay from `useDelay()` in `kit.tsx`.

`Num` is the non-currency sibling (counts, days, percentages, points). `NumberFlowGroup` is re-exported for cards where several values change together (split_check, post_purchase_footer).

## Composer

`src/engine/composer.ts` — `compose(ctx, metas: CardMeta[]) → { path, layout, cards, dropped }`. It is a scorer, not a template engine:

1. **Pool.** The nine matrix queries take the golden-path bypass: a hand-ordered `MATRIX_PATHS` list keyed by `matrixPath(ctx)`. Anything else draws from a generic pool by size class (`genericPool`: recurring / large / medium / small) and gets `layoutFor(ctx)`.
2. **Filter** the pool by each card's `condition(ctx)` — a failed condition never renders, framing cards included.
3. **Score** = `relevance(ctx) × priority` (relevance clamped to 0..1). On a matrix path the hand order dominates (`(pool.length − index) × 1000 + score`), so scoring only breaks ties there.
4. **Sort** by score, then **cap**: max 1 `interactive` and 1 `showpiece` (2 showpieces when `size === 'large'`), then drop the lowest non-anchor cards until ≤ 7.
5. **Anchors**: `anchor: 'first'` (verdict / plan header) leads, `anchor: 'last'` (consequence, then footer) closes; everything else keeps pool order.

| Path | Trigger | Layout |
|---|---|---|
| `crunchyroll` | `frequency === 'recurring'` | recurring |
| `flight` / `moving` | large · travel / housing_moving | plan |
| `shoes` / `monitor` / `tickets` | medium · shopping_apparel / shopping_electronics / entertainment | considered |
| `latte` / `dinner` / `uber` | small · coffee / dining / transport | quick |
| `plan-generic` / `considered-generic` / `quick-generic` / `recurring-generic` | everything else, by size class | as named |

The composer never imports a card. Metas are injected by the registry so each card's `condition`/`relevance` stays co-located with the card and the `engine ↛ cards` lint rule holds.

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
| `build` | `tsc -b && vite build` | Typecheck all projects, bundle to `dist/` (manual chunks: vendor, motion; recharts and `/share` are lazy) |
| `preview` | `vite preview` | Serve `dist/` locally |
| `lint` | `eslint src worker` | Includes the boundary zones above |
| `typecheck` | `tsc -b` | App + worker + node tsconfigs |
| `audit:literals` | `node scripts/audit-literals.mjs` | Fails on money/date/percent literals in card JSX |
| `deploy` | `npm run build && wrangler deploy` | One Worker: assets + API |
| `worker:dev` | `wrangler dev` | Local Worker on :8787 (uses `.dev.vars` for the key) |

## Profiles

`Profile` (`src/types.ts`) is `{ id, name, blurb, initials, build: (now) => UserModel, starters }`. `src/data/profiles/index.ts` exports `PROFILES: Profile[]`, `DEFAULT_PROFILE_ID` and `profileById()`; today only `maya` (Maya Chen, Boston) exists — Devon and Priya land per the profiles addendum and are added to that one array. `src/store/profile.ts` persists the active id to `localStorage` under `purchase-coach-profile` and exposes `useUser()` → `{ user, profileId, now }`, memoised per profile; Answer, Goals and the Card Gallery read it, so switching profiles (`useProfileStore.getState().setProfile(id)`; a picker UI is part of the addendum) re-derives every stack and number without a reload. Home still reads the static `USER`.

## Share page

`/share` (`src/screens/SharePage.tsx`, lazy chunk that also carries the `qrcode` lib) is a clean, projectable page outside the Shell with an SVG QR of `BRAND.publicUrl` (`https://meridian.andresl.dev`, overridable with `VITE_PUBLIC_URL`). `/qr` redirects to `/share`; unknown routes redirect to `/`.

## Mock data notes

- `src/data/mockUser.ts` builds a Plaid response (`accounts[]`, `transactions[]` with `personal_finance_category`, ISO dates). Noise transactions come from a seeded PRNG (`src/data/seed.ts`, seed 42); anchors are hand-authored on top. Early in a month, anchors spread over the trailing 30 days rather than clustering after the 1st.
- Everything is relative to `NOW` at module load (`src/data/index.ts`; real clock unless `?now=` / `VITE_NOW` is set). Nothing is pinned to a calendar date, so the demo is correct in any week — verified across month and year boundaries (see `VERIFICATION.md`, Wave 3 QA).
- Anchors: biweekly payroll of $2,610 with the next payday in 3 days; rent $1,850 on the 1st; subscription rows charged monthly with year-ago prices before their raise; Blue Bottle ×4 this month (and ~4/month historically); Sweetgreen ×4 this month; two apparel buys this quarter (Nike $95 at −42 d, Blundstone $120 at −70 d); two entertainment buys this quarter (Ticketmaster $85 at −49 d, Sunset Cinema $52 at −22 d); prior trip cluster ~4 months ago (JetBlue $380 flight + $206 stay + $136 food + $78 local = 2.1× the flight).
- Month-to-date spend per category is laid down as `runRate × elapsed / daysInMonth`, so pace copy holds on any day of the month.
- Constants: persona Maya Chen, Boston; `CASH = { bufferFloor: 450, cushion: 300 }`; `ALLOWANCE = { monthly: 150, spent: 65 }`; `LOAN = { apr: 0.1099, termMonths: 12 }`; points: 48,000 Chase UR (→ Iberia) and 22,000 Amex MR.
- Accounts: SoFi Checking $3,240 · SoFi Savings $8,900 (vaults: Lisbon $1,150, Emergency $6,000) · SoFi Invest $8,952 · five credit cards (SoFi Unlimited 2% $340/$10k, Amex Gold $290, Citi Custom Cash $210/$3k, Chase Sapphire Preferred $620/$12k, Chase Freedom Unlimited $1,220/$4k, APR 24.24% — the only APR the spec gives; the others are `null`).
- Point valuations (`cardRules.ts`): Amex MR at 2¢/pt, Chase UR at 1¢/pt. Citi Custom Cash carries a 5% dining cap of $500 with $487 used.

## Renaming

`src/brand.ts` exports a single `BRAND` object — `wordmark`, `product`, `navSection`, `flatCard`, `flatCardShort`, `loan`, `plusPill`, `avatarInitials`, `publicUrl`. Edit that one object to rebrand the demo; nothing in JSX hardcodes the name. Colours are semantic CSS variables in `src/styles/globals.css` (`--teal`, `--navy`, `--purple`, `--red`, `--salmon`, `--gold`, `--slate`, `--lavender`, `--green`), so a palette swap is one block. `public/favicon.svg` is a teal rounded square with a white "S".

## Orchestration conventions

Work is split between an orchestrator and subagents by file ownership:

- **Orchestrator-only (shared) files:** `src/types.ts` (and the `src/engine/types.ts` re-export), `src/engine/composer.ts`, `src/cards/index.ts`, `src/cards/kit.tsx`, `src/data/profiles/index.ts`, `src/store/*`, `src/App.tsx` (router), `src/styles/globals.css` / `tailwind.config.ts` (tokens), `package.json`, `wrangler.jsonc`, `eslint.config.js`, `vite.config.ts`.
- **Subagents edit only what they are assigned:** their card folders under `src/cards/<id>/`, individual `src/engine/*` math modules, `worker/`, or a profile data file under `src/data/profiles/`. A card is self-contained (`meta.ts` + `index.tsx`), so a card task never needs a shared-file change beyond its id in `CARD_TYPES`, which the orchestrator adds; if anything else seems necessary, it goes back to the orchestrator.
- Boundaries are enforced mechanically: the eslint zones above, the registry's `meta.id === folder` check, `CARD_TYPES` length, and `npm run audit:literals`.
