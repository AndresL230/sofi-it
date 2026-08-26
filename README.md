# SoFi Purchase Coach

## What it is

A single-page pre-purchase decision engine demo that lives inside a clone of SoFi's Coach Insights screen. You type a thing and a price ("$60 dinner", "$1,200 flight to Lisbon in March"); a Cloudflare Worker (or a local keyword fallback) classifies the text into a small JSON shape, and the client-side engine computes every number — verdict, best card, category pace, payday runway, interest, points, goal impact — from the active profile's Plaid-shaped mock user (three personas: Maya, Devon, Priya) and deals a stack of up to seven cards from a library of 34, laid out as a bento grid. The LLM never does math; nothing it returns is rendered as a number. One `wrangler deploy` serves the SPA and the API from a single Worker.

Production: **https://meridian.andresl.dev** (custom domain) and https://sofi-purchase-coach.andreslopez-23061.workers.dev (both live; `wrangler.jsonc` sets `workers_dev: true` alongside the custom-domain route). The Anthropic key is set on production — `GET /api/health` returns `hasKey:true` — so classification runs on Claude Haiku 4.5 with the keyword fallback behind it.

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
| State | `zustand` 5 (goals persisted to `localStorage` under `purchase-coach-goals`; active profile under `purchase-coach-profile`; demo panel under `purchase-coach-demo`; gallery view under `purchase-coach-gallery-view`) |
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

The key is optional and **is set on production** — `GET /api/health` on both URLs returns `{"ok":true,"model":"claude-haiku-4-5","hasKey":true}`. Setting or rotating the secret takes effect without a redeploy; re-check `/api/health`. Without it `worker/index.ts` returns `{ fallback: true }` for every classification and the client (`src/engine/classify.ts`) uses `src/engine/fallbackClassifier.ts` — anchored `$` amount parsing (a `$`-figure wins over a bare number; no leading `-`, no exponent, `k` scales ×1000, anything above 1,000,000 is a non-purchase), keyword → category, size thresholds, `/mo|month|subscription/` ⇒ recurring. The app is fully functional either way; the demo panel's **Force keyword fallback** switch (`useDemoStore.forceFallback`) exercises that path with the key present. For local Worker dev, put the key in `.dev.vars` (gitignored).

With a key: model `claude-haiku-4-5`, `max_tokens: 400`, temperature 0, 3 s timeout, query ≤ 200 chars (413 above), user text wrapped in `<q>` tags, zod-validated output, KV cache 24 h keyed on the normalized query, the nine matrix queries pre-warmed on first request, per-IP limit of 20/hour → `429` with `fallback: true`. On any non-OK response, schema mismatch, or timeout the client falls back locally; the amount is always re-parsed from the user's text, never taken from the model.

## Architecture map

```
src/
  types.ts              THE contract: Classification, UserModel, EngineContext, Profile, CardMeta, CardProps, CardActions
  brand.ts              BRAND constant (wordmark, product name, house card, loan name, publicUrl)
  data/                 Plaid-shaped mock user, driven by ProfileSpec
    spec.ts             ProfileSpec / CardSpec — everything that varies between personas (goals, merchants, seed…)
    plaid.ts            Plaid-shaped types; accountIds(spec); SpendCategory → Plaid PFC mapping
    csv.ts              parses profiles/<id>.transactions.csv (days_ago rows) → Plaid transactions relative to now
    mockUser.ts         buildPlaidResponse(spec, now): accounts + calendar rows (payroll, rent, subscriptions) + CSV rows
    baselines.ts        usual / runRate per category from the spec
    subscriptions.ts    Maya's subscription rows (+ year-ago prices), SERVICE_CATALOG
    cardRules.ts        CardSpec[] → earn rates, caps, credits, benefits, APR
    plaidAdapter.ts     the one adapter: Plaid shapes → engine UserModel (incl. seededGoals)
    profiles/           maya|devon|priya.spec.ts (plain data), *.transactions.csv (generated), specs.ts, withBrand.ts, index.ts (PROFILES)
    index.ts            NOW (real clock, or ?now= / VITE_NOW override); USER = default profile built at NOW
  engine/               pure math, no React
    types.ts            compatibility re-export of src/types.ts
    context.ts          buildContext(classification, goal, user, now) → EngineContext
    paces.ts runway.ts cardMath.ts verdicts.ts goals.ts money.ts behavior.ts
    composer.ts         (ctx, metas) → CardStack — scoring + matrix bypass; explain() for the inspector
    layout.ts           bento rows: Knuth–Plass justified breaking on a 12-col grid, stacks, height balancing
    classify.ts         POST /api/classify with fallback (forceFallback option)
    fallbackClassifier.ts
    queries.ts          MATRIX_QUERIES, CHIPS, CHOREOGRAPHY, NON_PURCHASE_REPLY
    format.ts
  cards/                one folder per card (34): <id>/{index.tsx, meta.ts, graphic.tsx?}
    index.ts            import.meta.glob registry → CARDS, CARD_LIST, CARD_METAS
    kit.tsx             everything a card may import besides types/format
    _ranking.tsx        shared by best_card_row / card_ranking
  components/           Money.tsx, Rich.tsx, DateText.tsx, CardArt.tsx, ui/*
  screens/              Home, Answer, Goals, Transactions (lazy), CardGallery + gallery/{ByExpense.tsx, expense.ts}, CoachInput, Shell, SharePage (lazy)
  demo/                 DemoPanel (lazy; ✦ Demo pill + panel), ProfileSwitcher (nav avatar), ProfileList, TimeTravel, Classifier, Inspector, ui
  store/                index.ts (goals + session), profile.ts (active profile, useUser), demo.ts (panel state, force-fallback, inspector)
  vendor/tremor/        restyled Tremor bases
worker/index.ts         static assets + POST /api/classify + GET /api/health
scripts/audit-literals.mjs   literal audit for card JSX
scripts/gen-data.mjs         writes profiles/<id>.transactions.csv from the specs
public/favicon.svg
```

Data flow: `profiles/<id>.spec.ts` + `profiles/<id>.transactions.csv` → `mockUser.buildPlaidResponse(spec, NOW)` → `plaidAdapter` → `useUser()` → `engine/context` → `engine/composer` (fed `CARD_METAS`) → `engine/layout` (bento rows) → `cards` (via the glob registry) → `screens`.

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
  span?,         // 'full' | 'auto'   legacy hint; bento widths now come from engine/layout.ts's per-card table
  column?,       // 'left' | 'right'  legacy hint from the two-lane layouts; unused by the bento grid
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

The composer never imports a card. Metas are injected by the registry so each card's `condition`/`relevance` stays co-located with the card and the `engine ↛ cards` lint rule holds. `explain(ctx, metas)` returns the same decision as a row per candidate (condition, relevance, priority, score, kept, reason) — the demo panel's card inspector and the gallery's "by expense" view read it.

## Answer layout (bento)

`quick` stacks (the small-purchase paths) render as a single column capped at `max-w-quick`. Every other layout is a bento grid built by `src/engine/layout.ts`:

- Each card has a natural width in columns plus a `[min, max]` it may shrink or stretch to (`WIDTH` table, keyed by card id; unlisted cards default to `[6, 4, 12]`) and a rough height class 1–3 (`HEIGHT`).
- `stackShorts()` first groups two (or three, if their heights still balance) short cards that follow a tall one into a single **stack cell**, so a leaderboard or a fork does not sit beside a one-line card with a wall of white under it. Two shorts immediately before a tall card are stacked the same way.
- `layoutRows()` then chooses row breaks with the Knuth–Plass dynamic programme TeX uses for paragraphs: badness per row = `(12 − Σ natural)²`, plus `40` for rows of more than three cells and `10 × (max h − min h)²` for pairing very different heights. Full-width anchors (`verdict_banner`, `plan_header`, `consequence_line`, `post_purchase_footer`, `track_goal_cta`, `goal_impact_chip`) always break their own row; a width-capped showpiece (iceberg, fork, sparkline) that cannot reach 12 columns pays extra to sit alone mid-stack, so it pairs, and a lone card on the last row stretches.
- `justify()` distributes each row's leftover columns proportionally within `[min, max]` with largest-remainder rounding, so every row sums to exactly 12.

`Answer.tsx` renders one `grid-cols-12` row per `LayoutRow` (single column below `md`), each cell spanning `--span` columns and rendering its stack vertically; cards stretch to the row height and stacks share the extra space. Every row carries `data-row="id[+id]:span …"` (e.g. `card_ranking:6 hold_24h+duplicate_check:6`) for QA scripts, next to the per-card `data-card`.

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

Home chips come from the active profile's `starters` (Maya: `$60 dinner`, `$140 running shoes`, `$1,200 flight to Lisbon in March`, `$15/mo Crunchyroll`; Devon and Priya have their own); `CHIPS` in `queries.ts` is Maya's set.

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
| `gen:data` | `node scripts/gen-data.mjs` | Regenerates `src/data/profiles/<id>.transactions.csv` for every persona (Node ≥ 22.18) |
| `deploy` | `npm run build && wrangler deploy` | One Worker: assets + API |
| `worker:dev` | `wrangler dev` | Local Worker on :8787 (uses `.dev.vars` for the key) |

## Profiles

Three personas, one shape. `ProfileSpec` (`src/data/spec.ts`) is everything that varies between them — persona, accounts and vaults, payroll, rent, cash buffer, allowance, points, loan terms, prior trip, baselines, subscriptions, cards (`CardSpec[]`), habits, redirect plan, seeded `goals`, `goalTemplate`, `netWorthDelta6m`, the noise `seed`, and optional city-flavoured `merchants` pools for the generator. The generator, card rules, baselines and adapter are all driven by it.

| id | Persona | Source | Seed | Shape |
|---|---|---|---|---|
| `maya` | Maya Chen, Boston | master spec §2 + cards spec appendix, verbatim numbers | 42 | biweekly $2,610, five cards, Lisbon vault, ~$550 dining usual |
| `devon` | Devon Reyes, Austin | authored as a demo persona (not from a spec) | 7 | paycheck-to-paycheck: $1,890 biweekly, Freedom at $2,150/$3,000, no points, dining over pace — verdicts skew tight |
| `priya` | Priya Nair, Seattle | authored as a demo persona (not from a spec) | 11 | high income: $4,420 biweekly, $22.4k savings, 112k UR / 61k MR, eleven subscriptions that keep creeping |

Files under `src/data/profiles/`: `<id>.spec.ts` is plain data with no app imports (so `scripts/gen-data.mjs` can load it with Node's native TypeScript stripping); `specs.ts` lists the three for the generator; `withBrand.ts` renames the `isFlatHouseCard` card to `BRAND.flatCard`; `<id>.ts` wraps the spec into a `Profile` (`src/types.ts`: `{ id, name, blurb, initials, build: (now) => UserModel, starters }`); `index.ts` exports `PROFILES`, `DEFAULT_PROFILE_ID` (`maya`) and `profileById()`.

`src/store/profile.ts` persists the active id to `localStorage` under `purchase-coach-profile` and exposes `useUser()` → `{ user, profileId, now }`, memoised per profile. Home, Answer, Goals, Transactions, the Card Gallery and the demo panel all read it, so switching re-derives every number without a reload. The top-right nav avatar (`src/demo/ProfileSwitcher.tsx`) is the switcher: **click cycles to the next profile** (with a "Now viewing …" toast, the session reset and a return Home); hover, long-press or ArrowDown opens a popover listing all three (`ProfileList`, also embedded in the demo panel). Each profile's `starters` feed the Home chips.

## Data

Transactions are served from **`src/data/profiles/<id>.transactions.csv`**, committed as the demo data and parsed once per session by `src/data/csv.ts` (`import.meta.glob('./profiles/*.transactions.csv', { query: '?raw' })`). Columns:

```
days_ago,amount,merchant,account,category,detailed,tags
```

`account` is a stable key (`checking | savings | brokerage | <cardId>`), `category` an engine `SpendCategory`, `detailed` the Plaid PFC detailed code, `tags` a `|`-joined list of anchor hints (`coffee`, `lunch`, `apparel`, `sneakers`, `boots`, `tickets`, `trip`, `flight`, `stay`, `food`, `local`). Rows carry `days_ago` rather than calendar dates, so `loadTransactions(spec, now)` materialises them relative to `NOW` at load time and the history is correct in any week.

What the CSV holds: 14 months of seeded noise (six categories, city-flavoured merchant pools, ticket sizes capped under the impulse/duplicate thresholds so those cards are driven by the hand-authored anchors only) plus the relative anchors — coffee ×N and lunch ×N per month, the apparel and entertainment buys, the prior-trip cluster. The trailing 31 days are laid at each category's `runRate / 30.44` per day and older months at `usual / 30.44` with mild drift, so on any date the current-month sum ≈ `runRate × elapsed / daysInMonth` — what `engine/paces.ts` assumes, and why the "≈ $585, about $35 over usual" pace copy still holds.

Calendar-anchored rows are **not** in the CSV: biweekly payroll ending at `now + 3`, rent on the 1st and subscriptions on fixed days with year-ago prices before their raise month are still generated at runtime by `src/data/mockUser.ts`, because their meaning is calendar-based. `buildPlaidResponse(spec, now)` merges both sources into one Plaid-shaped response; `plaidAdapter.ts` turns it into the engine `UserModel`.

Regenerate with `npm run gen:data` (`scripts/gen-data.mjs`, **Node ≥ 22.18** — it imports the `.spec.ts` files natively). One seeded PRNG per profile (`spec.seed`: 42 / 7 / 11), ~95 rows a month, so the files land at roughly 1,200–1,500 rows each (maya 1,215 · devon 1,214 · priya 1,510). The script prints per-profile row counts and gzip sizes; the three files add about 34 KB gzipped to the bundle.

## Goals

Each spec may seed `goals` (name, emoji, target, `vaultName` or `saved`, weekly, weeksOut). `plaidAdapter` maps them to `user.seededGoals` with ids `seed-<slug>`, the vault balance looked up by name, deadline `now + weeksOut × 7` and `createdAt = now − 30 d`. Maya seeds *Emergency fund*; Devon *Emergency cushion* and *Pay down Freedom*; Priya *House down payment* and *New bike*. `goalTemplate` (Lisbon / Denver weekend / Tokyo trip) is what `suggestedGoal()` offers when nothing is tracked.

`src/store/index.ts` keeps **one active goal** — `useGoalStore.goal` — and that goal alone drives verdicts, `goal_impact_chip`, the footer delta and `goal_collision`; `others: Goal[]` are tracked but never consulted. `activate(g)` swaps a goal in and moves the previous active one to `others`; `addOther(g)` files a new one without activating it; `remove(id)` deletes from either slot; `setGoal(null)` stops tracking. `/goals` shows the active goal as a hero card (saved / target, progress bar, deadline, weeks left, weekly pace, landing date, on-track badge, "Stop tracking"), the suggested-goal card and the add form when nothing is tracked, and "Your other goals" — every seeded goal plus `others` — each with a **✦ Check purchases against this** button that calls `activate`. Seeded goals cannot be removed; user-added ones can. The coach input shows the active goal as a purple pill with its progress (or "✦ Set a goal" when none is tracked); either opens `/goals`.

## Routes

| Route | Screen | Notes |
|---|---|---|
| `/` | `Home` | Coach Insights clone: net worth (expandable account rows), spending, recent transactions, chips from the active profile's `starters` |
| `/answer?q=…` | `Answer` | Composed stack; bento rows for non-quick layouts; DEV footer shows path / count / source / dropped |
| `/goals` | `Goals` | Active goal, suggested goal, add form, other goals with "Check purchases against this" |
| `/transactions` | `Transactions` (lazy) | Every transaction grouped by day: merchant search, month (this month, the five before it, or all months), account, and category chips with counts; spent / count / top-category summary; "Show more" paging (60); row → detail dialog with account, category + PFC code, tags, visit count and month-in-category context, hand-off to the coach. `?tx=<id>` deep-links a detail dialog |
| `/gallery` | `CardGallery` | `?by=card` (default): all 34 cards by section from each card's `samples`; `?by=expense`: one section per purchase type with the stack the composer would actually deal. The choice persists in `localStorage` |
| `/share` | `SharePage` (lazy) | Projectable QR of `BRAND.publicUrl`; `/qr` redirects here |
| `*` | — | Redirects to `/` |

The header is wordmark · nav section · Plus pill · profile avatar; the Add / Search / Manage buttons from the export were dropped.

### Card gallery

**By card** renders each card's `samples` through `buildContext` on the active profile. If a sample's `condition` cannot be met on that profile's data, the gallery previews it with the reference persona (Maya) and labels it "previewed with Maya's data"; only when neither profile satisfies the condition (and no `override` is set) does a dashed "condition false" placeholder appear. Interactive cards work here; `actions` are toast-only.

**By expense type** (`src/screens/gallery/expense.ts`, pure) builds one section per `EXPENSE_TYPES` entry — coffee `$6 latte`, dining `$60 dinner`, groceries `$54 groceries`, transport `$28 Uber`, apparel `$140 running shoes`, electronics `$450 monitor`, entertainment `$180 concert tickets`, travel `$1,200 flight to Lisbon in March`, subscription `$15/mo Crunchyroll`, moving `$2,800 to move apartments`, other `$35 gift` — from `explain()` with and without a goal. Each section shows the path and layout, the dealt stack as pills (plus the with-goal stack when it differs), candidate / dealt / cap counts, and every eligible card with its score and the composer's reason; sort by **Dealt first** (stack order, then dropped by cap), **By score** or **A–Z**. Cards that no type triggers on the active profile are listed at the top rather than silently missing; on Maya all 34 are covered.

## Demo controls

`src/demo/DemoPanel.tsx` (lazy) mounts a floating **✦ Demo** pill bottom-right on every page; it opens a 360 px right-hand panel (a full-screen sheet below 640 px; Esc closes; the app shifts left so the nav stays reachable). State lives in `src/store/demo.ts` (`purchase-coach-demo`: `open`, `forceFallback`, `choreoStep`; the inspector is not persisted). Sections:

- **Profile** — the same `ProfileList` as the avatar popover.
- **Walkthrough** — the five `CHOREOGRAPHY` beats with expected outcomes, Start / Prev / Next / Stop; step 3 blocks Next until the suggested goal is tracked (a "Track Lisbon" button is inline). Scripted for Maya; a caption says so on other profiles.
- **Nine matrix queries** — one button per `MATRIX_QUERIES` entry; the current answer's path is highlighted.
- **Goal** — the active goal, or "Track …" the profile's suggested goal; Clear goal.
- **Time travel** — the app's current date, a date input and quick jumps (Today, Next payday, The 1st, Month end, +6 months); each is a full reload with `?now=`.
- **Classifier** — Worker health (`/api/health`: Claude Haiku 4.5 live / no key / unreachable), the **Force keyword fallback** switch, and the last answer's source (`api`, `cache`, `fallback`, `chip`).
- **Card inspector** (collapsed by default) — every candidate for the current answer from `explain()`: kind, `score/priority`, kept or why not; clicking a kept row scrolls to that card and outlines it.
- **Pages** — Home, Card gallery, Goals, Share (new tab) and the production URL with a Copy button.
- **Reset** — clears the three storage keys and reloads Home on the real clock (confirm step).

## Design notes

- **Flat cards.** `--shadow-card: none` in `src/styles/globals.css`; `.pc-card` is white on the warm page with a 16 px radius and no rim, border or edge accent (the winner inset bar, gold top rule, purple goal rule and ticket dashed edge were all removed) — a user decision.
- **Which card** (`card_ranking`) shows the top three rows with an "N more cards ›" / "Show top cards only" toggle; `best_card_row` keeps its "See all cards" expander.
- Bento cells fill: cards stretch to the row height, stacks share the extra space, short cards centre their content.
- Goals are emphasised: hero goal card on `/goals`, a larger suggested-goal card, and a purple goal pill with progress in the coach input.

## Share page

`/share` (`src/screens/SharePage.tsx`, lazy chunk that also carries the `qrcode` lib) is a clean, projectable page outside the Shell with an SVG QR of `BRAND.publicUrl` (`https://meridian.andresl.dev`, overridable with `VITE_PUBLIC_URL`). `/qr` redirects to `/share`; unknown routes redirect to `/`.

## Mock data notes (Maya)

- `src/data/mockUser.ts` builds a Plaid response (`accounts[]`, `transactions[]` with `personal_finance_category`, ISO dates) from the profile's spec plus its CSV (see **Data**). Everything is relative to `NOW` at module load (`src/data/index.ts`; real clock unless `?now=` / `VITE_NOW` is set). Nothing is pinned to a calendar date, so the demo is correct in any week — verified across month and year boundaries (see `VERIFICATION.md`, Wave 3 QA).
- Anchors (from `maya.spec.ts`): biweekly payroll of $2,610 with the next payday in 3 days; rent $1,850 on the 1st; subscription rows charged monthly with year-ago prices before their raise; Blue Bottle ×4 a month; Sweetgreen ×4 a month; two apparel buys this quarter (Nike $95 at −42 d, Blundstone $120 at −70 d); two entertainment buys this quarter (Ticketmaster $85 at −49 d, Sunset Cinema $52 at −22 d); prior trip cluster 4 months ago (Montréal: $380 flight + $206 stay + $136 food + $78 local = 2.1× the flight).
- Month-to-date spend per category lands at `runRate × elapsed / daysInMonth`, so pace copy holds on any day of the month.
- Constants: `cash = { bufferFloor: 450, cushion: 300 }`; `allowance = { monthly: 150, spent: 65 }`; `loan = { apr: 0.1099, termMonths: 12 }`; points: 48,000 Chase UR (→ Iberia) and 22,000 Amex MR.
- Accounts: SoFi Checking $3,240 · SoFi Savings $8,900 (vaults: Lisbon $1,150, Emergency $6,000) · SoFi Invest $8,952 · five credit cards (SoFi Unlimited 2% $340/$10k, Amex Gold $290, Citi Custom Cash $210/$3k, Chase Sapphire Preferred $620/$12k, Chase Freedom Unlimited $1,220/$4k, APR 24.24% — the only APR the spec gives; the others are `null`).
- Point valuations (`CardSpec.pointValueCents`): Amex MR at 2¢/pt, Chase UR at 1¢/pt. Citi Custom Cash carries a 5% dining cap of $500 with $487 used.
- Devon and Priya follow the same shape with their own numbers (`devon.spec.ts`, `priya.spec.ts`); see **Profiles**.

## Renaming

`src/brand.ts` exports a single `BRAND` object — `wordmark`, `product`, `navSection`, `flatCard`, `flatCardShort`, `loan`, `plusPill`, `avatarInitials`, `publicUrl`. Edit that one object to rebrand the demo; nothing in JSX hardcodes the name. Colours are semantic CSS variables in `src/styles/globals.css` (`--teal`, `--navy`, `--purple`, `--red`, `--salmon`, `--gold`, `--slate`, `--lavender`, `--green`), so a palette swap is one block. `public/favicon.svg` is a teal rounded square with a white "S".

## Orchestration conventions

Work is split between an orchestrator and subagents by file ownership:

- **Orchestrator-only (shared) files:** `src/types.ts` (and the `src/engine/types.ts` re-export), `src/data/spec.ts`, `src/engine/composer.ts`, `src/engine/layout.ts`, `src/cards/index.ts`, `src/cards/kit.tsx`, `src/data/profiles/index.ts` and `specs.ts`, `src/store/*`, `src/App.tsx` (router), `src/styles/globals.css` / `tailwind.config.ts` (tokens), `package.json`, `wrangler.jsonc`, `eslint.config.js`, `vite.config.ts`.
- **Subagents edit only what they are assigned:** their card folders under `src/cards/<id>/`, individual `src/engine/*` math modules, `worker/`, or one persona's `src/data/profiles/<id>.spec.ts` (then `npm run gen:data` to refresh its CSV). A card is self-contained (`meta.ts` + `index.tsx`), so a card task never needs a shared-file change beyond its id in `CARD_TYPES`, which the orchestrator adds; if anything else seems necessary, it goes back to the orchestrator.
- Boundaries are enforced mechanically: the eslint zones above, the registry's `meta.id === folder` check, `CARD_TYPES` length, and `npm run audit:literals`.
