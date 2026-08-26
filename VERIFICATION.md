# VERIFICATION — Step 6: app vs design export, and the acceptance checklist

Date: 2026-08-26. Sources compared: `design-export/Purchase Coach.dc.html` (the Claude Design export), the running app (`npm run dev` + `npm run worker:dev`, no API key), the cards spec (`claude-design-CARDS-prompt.md`), and the architecture spec (`claude-code-prompt-sofi-purchase-coach.md`). Rule applied throughout: visuals follow the export; card behaviour, data values, and composition follow the specs.

## (a) Method

1. Headless captures (`playwright-core`) of every export state: Home, the five Answer templates and their sub-variants, Goals, Card Gallery.
2. Headless captures of the app: Home, the nine matrix answers (each with and without the Lisbon goal where the goal changes the stack), Goals, Card Gallery, and Home/Answer at a 380 px viewport.
3. Side-by-side review of each pair. Every visible number in the app was traced back to an engine function or a mock-data constant; every number in the export was checked against the specs.
4. Composition of each answer was read off the DOM (`data-card` attributes) and compared with the export's fixed templates and with `compose()`'s output.

## (b) Drift table — export vs app

| Area | Export | App | Verdict |
|---|---|---|---|
| Palette + wordmark | Original "meridian." palette (`#0E8FA8` etc.), wordmark "meridian." | SoFi hexes `#00A2C7 #201747 #330072 #E03E52 #DD7975 #FED880 #53565A #E5E1E6 #00A05A` behind semantic CSS variables (`--teal`, `--navy`, …); wordmark and product name behind `BRAND` (`src/brand.ts`) | intentional — user decision; tokens are supplied data, not visuals |
| Home: net worth | Hardcoded "$18,412.06 / ▲ $1,240" | Computed from accounts: $18,412.06 (identical). Delta computed from the seeded 6-month net-worth history ≈ $1,258 | kept spec (computed) |
| Home: spending | Hardcoded "$2,340.44" | Month-to-date sum of generated transactions; ≈ $3,3xx on Aug 26 because rent is included and the figure moves with the day of the month | kept spec (computed); varies by design |
| Home: net-worth chart | SVG letterboxed inside the card | Line spans the card width | intentional |
| $60 dinner: stack | verdict · best_card_row · credit_expiry · category_pulse · consequence · footer (export's split_check fired only ≥ $70) | verdict · best_card_row · category_pulse · split_check · credit_expiry · consequence · footer. With a goal: goal_impact_chip enters and credit_expiry is dropped by priority (cap 7) | kept spec — split_check ≥ $40 per the cards spec |
| $60 dinner: pace copy | "≈ $585, about $35 over usual" | Identical, computed from `runRate × elapsed/daysInMonth` | kept export (by computation) |
| $60 dinner: footer | No goal line | Adds "Lisbon −2 days" when a goal exists | kept spec |
| $140 shoes: stack | 9 cards, caps ignored (ranking, benefits, utilization, guilt-free, duplicate, cost-per-use, hold) | verdict ("Fine, with a caveat.") · card_ranking · hold_24h · duplicate_check · utilization_watch · consequence · footer. benefits_check / cost_per_use / guilt_free_balance dropped by priority or condition (guilt_free_balance only renders when the verdict is tight — it renders on $450 monitor and $180 concert tickets) | kept spec (caps 7 / 1 interactive / 1 showpiece) |
| $140 shoes: Citi row | Dimmed with "5% cap reached — $13 of $500 left" | Same: cap ≥ 90% used ⇒ disqualified everywhere the card is ranked | kept export |
| $140 shoes: hold_24h motion | Scale pop (`popIn`) | Real 3D y-axis flip | kept spec |
| $1,200 flight: "path" cards | Two cards ("Save on pace" / "Tighten & make March") not in the 34-card library | Dropped; their content lives in cashflow_timeline's purple redirect flag | intentional |
| $1,200 flight: points_offset | UR −$530, credits −$20 ⇒ $670 | UR −$530, Amex credits ×2 −$20, CSP hotel credit −$50 ⇒ $600 (computed from `cardRules.ts` credits) | kept spec (computed) |
| $1,200 flight: dates | Fixed "Mar 27" / "Apr 18" | Relative to today | kept spec |
| $15/mo Crunchyroll: price_creep | Hand-drawn $71 → $85 path, "+$14/mo", "$168/yr of drift" | Rows from the spec appendix sum to $119.46; only two raises named (Netflix +$2.50, Spotify +$1) ⇒ "+$3.50/mo", "$42/yr of drift", $116 → $119, "$134 with Crunchyroll". Base is Tremor/Recharts `SparkAreaChart` (lazy-loaded); month initials added on the x-axis | kept spec (data-honest; see (c)) |
| $2,800 move: payment_fork | Totals from fixed multipliers (×1.0604 / ×1.1357); winner ring always on column 1 | Amortised: SoFi loan 10.99% × 12 = $2,969 / $247 mo; Freedom 24.24% = $3,181 — matches the spec's $2,969 / $3,180 within $1. "Ride the card" picks the only card with a spec-given APR (Freedom); other APRs are `null`, not invented. Winner computed | kept spec |
| Layouts (considered / recurring / plan) | Two-stack composition (left / right lanes) | Same two-stack composition, driven by each card's `column` hint, instead of a flat auto-fit grid | kept export |
| Motion: stack entrance | CSS `riseIn` with per-card `animation-delay` | Same (`riseIn`, per-card delay) rather than rAF-driven, so it survives background tabs | kept export |
| Motion: signature keyframes | Export keyframes | Kept | kept export |
| Motion: count-ups | Timers / static pops | NumberFlow timing via `<Money delayMs>` | kept spec |
| Gallery | Hand-duplicated markup (second copy of every card, `g_`-prefixed SVG ids), state shared with the answer screen | All 34 rendered from `src/cards/registry.ts` with engine-built samples; card-local state | kept spec |
| Gallery-only cards | `pace_projection`, `credit_sweep`, `impulse_frequency` never dealt in an answer | Real triggers: pace_projection (Uber / generic small), credit_sweep (groceries / small), impulse_frequency (tickets / shoes) | kept spec |

## (c) Spec inconsistencies the engine resolved by computing

Each of these is a place where the specs' literal numbers do not agree with each other or with the supplied data. In every case the app computes from the data and the copy follows.

1. **Amex MR valuation.** The spec's "4x ≈ $4.80 / +$3.60 vs your 2%" on a $60 dinner only holds at 2¢/pt, so `cardRules.ts` values MR at 2¢ (UR stays at 1¢). Consequence: on non-bonus categories Amex Gold (1x at 2¢ = 2%) ties SoFi 2%, and the tie-break prefers the flat house card ("Simple and best").
2. **Subscription total.** The appendix rows sum to $119.46, not the "$85 usual" the export's sparkline assumed. Only two raises are named (Netflix +$2.50, Spotify +$1), so creep is +$3.50/mo and $42/yr, not +$14/mo and $168/yr.
3. **Prior trip ratio.** The spec says "$380 flight + ~$800 around it" and also "2.1× the flight" — those disagree. Data uses $380 + $420 around (stay $206, food $136, local $78), so "≈ 2.1× the flight" and "≈ $2,5xx all-in" for the $1,200 flight both hold.
4. **Days-left / month-to-date.** "12 days left / $410 of $550" only held on the spec's writing day. The generator lays month-to-date spend as `runRate × elapsed/daysInMonth`, so the pace story ("≈ $585, about $35 over") holds on any day; the day count and the $-spent figure move.
5. **Goal impact.** Only the overshoot above usual counts as goal money: $35 ÷ ($125/week ÷ 7 per day) ≈ 2 days, which reproduces "Lisbon −2 days".
6. **Redirect plan.** Dining → $460 and entertainment → $80 (`REDIRECT_PLAN`) sum to $130/mo, not the spec's "$180/mo". cashflow_timeline uses $130.
7. **Discretionary room.** Computed as checking − rent − remaining subscriptions − one pay cycle of essentials − $450 buffer ≈ $640, rather than the spec's literal $612.
8. **Payday.** Today + 3 days per the spec's relative rule, so the weekday in copy varies ("buy Saturday → fine" on Aug 26, 2026; the export's "buy Friday" was fixed text).

## (d) Acceptance checklist

From `claude-code-prompt-sofi-purchase-coach.md`.

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Choreography latte → dinner → flight (track goal) → dinner (flips tight) → moving (collision) runs with zero API dependency | PASS | Run end to end on the fallback classifier with no `ANTHROPIC_API_KEY` (`/api/health` → `hasKey: false`); second `$60 dinner` shows Tight + goal_impact_chip; moving shows goal_collision |
| 2 | All 34 cards render in the gallery | PASS | `registry.ts` asserts 34 at load; gallery renders every module's `samples` from `buildContext`; captured with no empty cells |
| 3 | All four interactive cards work | PASS | hold_24h flip (hold → held → skip → re-ask → buy / let go), split_check stepper 1–4 with rolling share and pill flip, cost_per_use slider, goal_collision slider moving both dates |
| 4 | Arbitrary input → sensible answer or graceful non-purchase reply; nothing throws, nothing renders empty | PASS | Unknown-but-valid purchases land on the size/frequency generic paths; non-purchase text renders `Tell me a thing and a price — like "$60 dinner".` |
| 5 | Kill the API key → whole app still works on the fallback classifier | PASS | Worker returns `{ fallback: true }` without a key; client `classify()` degrades to `fallbackClassify()` on any non-OK / schema / timeout / `fallback` response |
| 6 | No answer exceeds 7 cards / 1 interactive / 1 showpiece (2 on large); unmet conditions never render | PASS | `compose()` enforces all three caps; eligibility filter runs before caps so a failed `condition` renders nothing; verified on all nine answers with and without a goal |
| 7 | API key absent from client bundle (`grep` the dist output) | PASS | `grep -rl "sk-ant\|ANTHROPIC_API_KEY" dist/` returns nothing after `npm run build` (2026-08-26); the key is read only in `worker/index.ts` from `env` and never inlined into `dist/` |
| 8 | Rate limit returns 429 under hammering | PASS | Production, one IP: 1 `$60 dinner` + 24 sequential `$6 latte` POSTs → 200 for the first 20 counted requests, then `429 {"error":"rate limited","fallback":true}` + `retry-after: 3600` from hammer #21 onward (hammer #15 returned a 500 / Cloudflare 1101 and did not count — see (e)) |
| 9 | Usable on a 380 px phone; hero numerals keep the raised-cents style | PASS | `document.documentElement.scrollWidth === 380` on Home and every answer; `<Money cents="raised">` used for all hero numerals |
| 10 | Dates/paces correct relative to today, whenever "today" is | PASS | `src/data/index.ts` builds `USER` from `NOW = new Date()`; all anchors (paydays, rent, statement close, credit expiry, prior trip, apparel buys, goal deadline) derive from it — no calendar literals |

Bundle (from `dist/` after `npm run build`, gzip): index 88 KB · vendor 53 KB · motion 38 KB · CSS 7 KB = **186 KB initial load**; SparkAreaChart (recharts, lazy) 104 KB fetched only when `price_creep` renders; ≈ 290 KB total. Under the ~350 KB target — PASS.

Charts chunk (resolved 2026-08-26): the `charts: ['recharts']` manual chunk in `vite.config.ts` was pulling recharts into a chunk the entry statically imported and `index.html` modulepreloaded. Removing that entry lets Rollup fold recharts into the lazy `SparkAreaChart-*.js` chunk; the entry now imports only `vendor` and `motion`, `index.html` modulepreloads only those two, and no chunk containing recharts is referenced statically (verified by grepping `dist/assets/index-*.js` for `from"./SparkAreaChart-`).

## (e) Deploy

- URL: https://sofi-purchase-coach.andreslopez-23061.workers.dev
- Deployed 2026-08-26T05:20:42Z via `npx wrangler deploy` (version `334d9900-dd93-4d6d-ba80-937555d0d149`; 6 static assets + Worker; bindings `CACHE` KV, `ASSETS`, `RATE_LIMIT_PER_HOUR="20"`).
- `ANTHROPIC_API_KEY` is **not yet set**: `GET /api/health` → `{"ok":true,"model":"claude-haiku-4-5","hasKey":false}` and `POST /api/classify` → `{"fallback":true}`. Set it with `npx wrangler secret put ANTHROPIC_API_KEY` (takes effect without a redeploy; re-check `/api/health` for `hasKey:true`).
- Smoke (curl, 2026-08-26T05:21Z): `/`, `/gallery`, `/answer?q=%2460%20dinner` → 200 `text/html` with `<div id="root">` (SPA not-found handling); `/assets/index-CGZXA4sq.js` → 200 `text/javascript`; `/assets/index-BGJj19MR.css` → 200 `text/css`.
- Observed during the hammer: one request (hammer #15) returned HTTP 500 `error code: 1101` (uncaught Worker exception) and was not counted by the limiter. `rateLimited()` writes the same KV key (`rl:<hour>:<ip>`) on every request with no try/catch; KV allows one write per second per key, so a tight burst can make `put` throw. Not reproduced by a later 10-request burst watched with `wrangler tail` (10 × `ok`/429, no exceptions), so the cause is unconfirmed — the 05:21Z event is in the Workers observability logs. Not an acceptance item; noted for follow-up (wrap the put, or treat a failed put as "not limited").

