# PORT-INVENTORY — Purchase Coach design export → codebase

**Sources actually available** (this repo was empty; none of the three spec files or `/design-export/` existed locally or in git history — everything below was recovered from the Claude Design project `176d3d70…`):

| Input | Status | Where recovered |
|---|---|---|
| `Purchase Coach.dc.html` (export, 1,470 lines) + `support.js` (DC runtime) | ✅ full | Claude Design MCP `read_file` |
| `MASTER-claude-design-prompt.md` (screens, persona, query handling) | ✅ full | first user message of the design transcript |
| `claude-design-CARDS-prompt.md` (34 numbered cards, composition rules, appendix data) | ✅ full | last user message of the design transcript |
| Seven-card v2 visual detail (§1–7 + §10 identities) | ✅ full | 5th user message of the transcript |
| `claude-code-prompt-sofi-purchase-coach.md` (ARCHITECTURE spec) | ❌ **not found anywhere** | — |

> **Gap:** the architecture spec is missing. The port brief in your message describes it in enough detail (Vite+React18+TS+Tailwind, `<Money>`/NumberFlow, Tremor bases, `/src/data` Plaid-shaped mock + adapter, `/src/engine` math modules, composer with golden paths, Cloudflare Worker `/api/classify` with Haiku 4.5 / zod / KV / 20-per-hour limit) that I'll treat **that brief as the architecture spec**. Things I'm inferring because they only exist in the missing file are marked ⚠ INFERRED below.

Legend — **Fidelity:** faithful = lift markup as-is · simplified = present but a spec'd graphic/motion is missing · missing = not in export. **Interactive:** ✔ works / ✘ flattened / — n/a. **Literals → props:** numbers/dates/strings baked into markup or `renderVals()` that must become engine-computed props.

## Cards (34)

### Verdict & framing

| # | Card | In export? | Fidelity | Interactive | Literals → props |
|---|---|---|---|---|---|
| 1 | `verdict_banner` | ✔ Answer + gallery (3 tints) | faithful | — | word/clause per mode+sub hardcoded in `verdict()`; "$612 of discretionary room"; tints OK. Hero numeral is a raw `<sup>` — needs `<Money>`. |
| 2 | `plan_header` | ✔ S3 Plan + gallery | faithful | — | amount bound; headline copy fine. Fork variant uses different headline ("Checking can't absorb this one.") — needs a `tone` prop. |
| 3 | `green_light` | ✔ S1 (groceries) + gallery | faithful (no "rough stamp-ink edge") | — | "$170 under usual" / "$140 under usual" literal. |
| 4 | `consequence_line` | ✔ all answers + gallery | faithful | — | sentences hardcoded per mode/sub in `cons{}`; "$35 hot", "$80 under". |
| 5 | `post_purchase_footer` | ✔ all answers + gallery | **simplified** — plain "→" text, no digit-roll; mode 2 ledger is fully literal | — | 3240, 290, 340, 410/550, 310/480, 95/160, 1220, "$3,100", "$480", "$355 of $250", "Lisbon −2 days". |

### Money context

| # | Card | In export? | Fidelity | Interactive | Literals → props |
|---|---|---|---|---|---|
| 6 | `category_pulse` | ✔ S1 dining + gallery | simplified — hand-rolled bar, not Tremor base (fine per rule; hand-rolled is prettier). Widths literal. | — | 63%, 84.6%, hatch = `a/650`, "Dining this month", "$410 of $550", "12 days left · ≈ $585, about $35 over". |
| 7 | `pace_projection` | ✔ **gallery only** — never dealt in an answer | faithful visual, fully static | — | path, "usual $550", "+$35", "around the 29th", today dot at 63%. |
| 8 | `discretionary_runway` | ✔ S3 Fork + gallery | faithful | — | 45% / 8% / 34% widths, "$612 of room", "RENT $1,850", "payday Fri". |
| 9 | `carrying_cost` | ✔ S3 Fork + gallery | simplified — cap heights static (6/12/18px), no count-up | — | months "Sep/Oct/Nov" (must be relative to today), "+$95" in gallery, interest3 computed from `a*1.1357`. |
| 10 | `cashflow_timeline` | ✔ S3 Plan + gallery | simplified — fixed positions, no "$" payday dots (plain ticks) | — | 48%, 12/24/36%, 68%, "Mar 27 — with $180/mo redirect", "~Apr 18", "biweekly $2,610" (all must be computed from `Date.now()`). |
| 11 | `payday_proximity` | ✔ S1 transport + gallery | faithful (dot travel, tags, pills) | ✔ "Remind me Friday" toast | tiles 25/26/27/$/29, "Tue · today", "Fri · payday", "+$2,610", "3 days to payday", "buy Friday → fine". Dot stop % is a CSS keyframe literal (62%). |

### Cards & rewards

| # | Card | In export? | Fidelity | Interactive | Literals → props |
|---|---|---|---|---|---|
| 12 | `best_card_row` | ✔ S1 + gallery | faithful | ✔ expander → ranking | reason/delta computed from `a*.08 − a*.02`; "$10 dining credit"; card art colors + last-4 per card. |
| 13 | `card_ranking` | ✔ S1 expander, S2, S3 booking, gallery | faithful (rail numerals, winner glow, badges) | — | **entire ranking hardcoded per mode** in `cardsFor()` — $ back, deltas, reasons, badges ("$13 of $500 left", "34% utilization", "the 12th"). Must come from engine. |
| 14 | `utilization_watch` | ✔ S2 + gallery | faithful | — | needle geometry fixed at 34% (`x2=71 y2=39`), "34%", "the 12th", 30% tick. |
| 15 | `credit_sweep` | ✔ **gallery only** | faithful-ish — pill pops in, does not count up | — | "$10 Amex dining", "$50 CSP hotel", "$60 swept". |
| 16 | `credit_expiry` | ✔ S1 dining<$70 + gallery | faithful (notches, 270° dial, pulse) | — | "6", dial dash `15` (=6/30·75), "$10 Amex dining credit". |
| 17 | `points_offset` | ✔ S3 Plan + gallery | faithful (tabular ledger, rule, hero) | — | "48,000 Chase UR → Iberia", −$530, −$20, "$670", "~Mar 21". |
| 18 | `benefits_check` | ✔ S2 + gallery | faithful (three shields) | — | `shields[]` literal (120d/90d/—, labels). |

### Behavior lens

| # | Card | In export? | Fidelity | Interactive | Literals → props |
|---|---|---|---|---|---|
| 19 | `merchant_habit` | ✔ S1 coffee + gallery | faithful (punched holes w/ inner shadow) | — | "Blue Bottle", 4 of 8 punches, "4 visits this month · $212 YTD". |
| 20 | `impulse_frequency` | ✔ **gallery only** | faithful visual; 13 ticks hand-unrolled | — | dots at weeks 3 & 8 with fixed sizes; "$95, $120"; caption. |
| 21 | `cost_per_use` | ✔ S2 + gallery | **simplified** — slider + live figure only; the spec'd price-tag→tokens graphic is absent | ✔ works (10–100, recompute, teal→gold→salmon) | thresholds 6/12, "$8/wear" anchor, 140 in gallery. No NumberFlow. |
| 22 | `duplicate_check` | ✔ S2 + gallery | faithful (∓2° polaroids, VS chip) | — | "6 weeks ago", "running sneakers · $95", "these · $140". |
| 23 | `split_check` | ✔ S1 dining≥$70 + gallery | faithful (zigzag edge, receipt rules, stepper) — **no odometer roll** on share | ✔ works (1–4, share, pill flips) | tight threshold `share ≥ 45`; export triggers at ≥$70, spec says ≥$40. |
| 24 | `hold_24h` | ✔ S2 + gallery | **simplified** — state machine complete but **no 3D y-axis flip** (uses `popIn` scale), no envelope-flap crease, 24h ring static at 8% | ✔ works (hold → held → skip → re-ask → buy / let go + toasts) | "$140 running shoes", "Meridian 2% still the card", "Saved $140". |

### Recurring

| # | Card | In export? | Fidelity | Interactive | Literals → props |
|---|---|---|---|---|---|
| 25 | `annualized` | ✔ S5 + gallery | faithful (12 tiles, 40ms stagger); result pops rather than counts up | — | gallery $15/$180; live bound. Needs NumberFlow count-up. |
| 26 | `subscription_stack` | ✔ S5 + gallery | faithful (gold top row, compressed middles) | — | `subRows[]` literal, "$85 →", new total. |
| 27 | `overlap_check` | ✔ S5 + gallery | faithful-ish — labels are text, not "service chips" | — | "Netflix / Hulu", "anime catalogs", caption. |
| 28 | `price_creep` | ✔ S5 + gallery | **simplified** — no month initials on the x-axis; step path literal | — | "+$14/mo", "$71", "$85", "$100", "Netflix +$2.50", "Spotify +$1", "$168/yr", path coords. |

### Goals

| # | Card | In export? | Fidelity | Interactive | Literals → props |
|---|---|---|---|---|---|
| 29 | `goal_impact_chip` | ✔ S1 w/ goal + gallery | faithful (plane nudge) — date is static text, no crossfade | — | "Apr 3 → Apr 5" (must be goal-date math), "skip one dinner this week". |
| 30 | `goal_collision` | ✔ S3 travel + goal, gallery | **simplified** — two progress bars + slider; spec wants two mini-*timelines* on a shared x-axis, NumberFlow on dates | ✔ works (slider moves both bars + dates) | anchored to `new Date(2027,3,3)` / Apr 2 2027 — **not relative to today**; "May 9 / Apr 2" summary literal; 52+ct·0.42 / 90−ct·0.72 magic numbers. |
| 31 | `track_goal_cta` | ✔ S3 + gallery | faithful (vault glyph, coin drop, toast, auto-return) | ✔ | "Track Lisbon as a goal" → goal name prop. |

### Large-purchase showpieces

| # | Card | In export? | Fidelity | Interactive | Literals → props |
|---|---|---|---|---|---|
| 32 | `payment_fork` | ✔ S3 Fork + gallery | faithful (bezier branches draw, bars grow in sequence, winner ring) | — | bar heights computed from amount ✔; but multipliers `×1.0604` / `×1.1357` and "12 mo · 10.99%", "Freedom 24.24%" literal; winner ring always on column 1 (should be computed). |
| 33 | `total_cost_of_event` | ✔ S3 Plan + gallery | faithful (iceberg facets, waterline, sunk chips) — waterline shimmer absent | — | "Stay ~$640", "Food & out ~$420", "Local + extras ~$240", "≈ $2,500", "2.1×". |
| 34 | `guilt_free_balance` | ✔ S2 (gold "exceeds" variant) + gallery (green variant) | faithful — **missing the orbiting green spark dot** | — | "$85", "$150/mo", 57%, "$55", tag copy. |

**Totals:** 34/34 present somewhere · 31 dealt in an answer, **3 gallery-only** (`pace_projection`, `credit_sweep`, `impulse_frequency`) · fidelity: 24 faithful, **10 simplified**, 0 missing · interactive: all 4 work as state, but `hold_24h` is flattened from a 3D flip to a scale-pop, and `split_check`/`cost_per_use`/`goal_collision` lack the spec'd digit-roll (NumberFlow).

## Screens

| Screen | In export? | Fidelity | Interactive | Literals → props / notes |
|---|---|---|---|---|
| **Nav / shell** | ✔ | faithful to the *minimal* nav you picked in Design ("wordmark · Coach Insights · Get ✦ Plus · avatar"), **not** the 11-link SoFi nav in the master prompt | ✔ wordmark → home | wordmark text "meridian.", avatar "MC". |
| **Home (S0)** | ✔ | faithful clone: net-worth hero + line chart + 3M/6M/YTD/1Y/ALL + 3 rows; spending hero + 4 bars + 4 txns; coach input card above; footer "card gallery" link | ✔ range toggle, chips (4: export added "$15/mo Crunchyroll"), input, Enter, goals pill | $18,412.06, ▲ $1,240, $12,140 / −$2,680 / $8,952, $2,340.44, bar heights, **"May Jun Jul Aug"** (must be relative to today), txns list, "Checking ··4021", 5 SVG chart paths. |
| **Answer** | ✔ | **Five fixed templates** (S1 quick w/ 5 sub-variants, S2 considered, S3 Plan, S3 Fork, S5 Recurring) — *not* a composed stack. Shimmer 600ms ✔, stagger via per-card `animation-delay` ✔, banner tints in last ✔. | ✔ | Mode/sub chosen by regex in `parse()`; every template's card set is static. **The composer replaces this entirely** — cap 7 / 1 interactive / 1 showpiece is nowhere enforced in the export. |
| **Goals (S4)** | ✔ | faithful (empty state, suggested Lisbon card, 4-field form, purple goal card w/ progress) | ✔ track / stop tracking / form | "on track" tag static, "$125/week", vault 1,150, target 2,400; `tenWeeks()` is already relative ✔. |
| **Card Gallery** | ✔ | CSS-columns masonry, 6 section headers, 11px slate caps labels — **hand-duplicated markup** (second copy of every card, `g_` prefixed SVG ids) | ✔ interactive cards work, but they **share state with the answer screen** (`uses`, `people`, `held`) | Must become a single registry render. |

## Dependencies the export leans on that the architecture brief doesn't sanction

| Export dependency | Verdict |
|---|---|
| `support.js` DC runtime: React 18.3.1 **UMD from unpkg**, **@babel/standalone** compiled in-browser, `<sc-if>`/`<sc-for>` template tags, `style-hover` / `style-focus` / `style-before` pseudo-attributes | ✘ drop entirely — replace with real TSX + Tailwind variants (`hover:`, `focus:`, `before:`). |
| All styling as inline `style=""` (no Tailwind, no tokens) | ✘ lift into `tailwind.config` tokens + `globals.css`. |
| Google Fonts **Inter** via `<link>` | ✔ sanctioned (master prompt: Proxima Nova → Inter fallback). Keep. |
| No NumberFlow (raw `<sup>` cents), no Tremor, no zod, no router, no eslint | ✘ all required by the brief; add. |
| `Date.now()` used only for `tenWeeks()` and one slider; everything else pinned to Aug 2026 / 2027 | ✘ all dates → relative. |
| Component-wide single `state` object (people/uses/held shared across screens) | ✘ card-local state. |

## Decisions I need from you before Step 2 (recommended default first)

1. **Palette/brand.** The export re-hued everything to an original "meridian." palette (teal `#0E8FA8`, navy `#1D2144`, purple `#4B2E83`, red `#D64550`, salmon `#DD7975`, gold `#F5CE6E`, slate `#53565A`, lavender `#E5E1E6`, green `#0E9E5F`, bg `#F7F5F2`) because Claude Design declined to reproduce SoFi branding. Both specs say SoFi hexes (`#00A2C7`, `#201747`, `#330072`, `#E03E52`, `#FED880`…). Your conflict rule says visuals → export. **Default: ship the export's nine colors as the CSS variables**, and name the tokens semantically (`--teal`, `--navy`…) so a one-line swap to SoFi hexes is possible later. Say "SoFi hexes" if you'd rather I use the spec values.
2. **Brand name in copy.** Card names / loan / wordmark: export says "Meridian Unlimited 2%", "Meridian loan", "meridian."; specs say SoFi. These are *data values*, so spec wins by your rule. **Default: SoFi names in data, export's minimal nav layout with a "SoFi"-style wordmark.**
3. **Missing architecture spec.** Proceed using your brief as the spec (⚠ INFERRED items: `EngineContext` shape, Plaid adapter shape, the nine matrix queries, golden-path names)? **Default: yes.**
4. **The nine matrix queries** (⚠ INFERRED from the export's parser + your choreography): `$6 latte` (merchant_habit) · `$60 dinner` (credit_expiry + split_check) · `$54 groceries` (green_light) · `$18 uber` (payday_proximity) · `$140 running shoes` (considered) · `$1,200 flight to Lisbon in March` (plan) · `$2,800 laptop` (fork) · `$15/mo Crunchyroll` (recurring) · `$1,800 moving` (large + goal → goal_collision). Correct these if your matrix differs.

## Things in the export that are prettier than the spec (keeping, per your rule)
- `category_pulse` hand-rolled capsule with a hatched segment beats a restyled Tremor CategoryBar; I'll keep the export's bar and only use Tremor where a card has no signature graphic of its own.
- `credit_expiry` notches done with page-colored circles — simple and exact.
- `payment_fork` bar heights already data-proportional.

## Things cheaper than the spec (will rebuild)
- `hold_24h` real 3D flip + flap crease; `split_check` / `cost_per_use` / `goal_collision` / `annualized` / `post_purchase_footer` digit-rolls via `<Money>`; `goal_collision` true dual timelines; `price_creep` month ticks; `guilt_free_balance` spark dot; `total_cost_of_event` waterline shimmer; `cost_per_use` price-tag→tokens graphic; `credit_sweep` count-up; `pace_projection` / `impulse_frequency` / `credit_sweep` get real triggers so they're dealt, not gallery-only.
