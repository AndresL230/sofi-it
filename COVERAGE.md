# Card coverage — Wave 3 / Q1

Proof that every one of the 34 `CARD_TYPES` is reachable through normal use (appears in at least one
composed *answer stack* on `/answer?q=…`), not only in the Card Gallery.

- **Method.** Headless Playwright against the running Vite dev server (`http://localhost:5179`).
  For each query: `goto /answer?q=<urlencoded>` → wait 1500 ms → read
  `[...document.querySelectorAll('[data-card]')].map(e => e.dataset.card)` plus the DEV footer line
  (`path · N cards · source · dropped: …`). Goal state was set the way a user would: open
  `$1,200 flight to Lisbon in March`, click **Track Lisbon as a goal** (persists to `localStorage`
  key `purchase-coach-goals`), then re-run the queries. `localStorage.clear()` between runs.
- **Clock.** Browser date was **Wed 2026-08-26**. All mock data is generated relative to `now`
  (payday = now+3 d, Amex dining credit expires now+6 d, Blue Bottle ×4 this month, Nike −42 d,
  Blundstone −70 d, Ticketmaster −49 d, Sunset Cinema −22 d), so the results below do not depend on
  the calendar day. `&now=YYYY-MM-DD` was verified live (payday moved from Sat 29 Aug to Thu 13 Aug
  with `now=2026-08-10`) and did not change any stack composition for the queries probed.
- **Classifier.** Every query resolved through the keyword fallback (`source: fallback`; the
  `/api/classify` 404/500 lines are the expected no-Worker path). Reachability therefore reflects
  `fallbackClassifier.ts` categorisation; an LLM classifier could only widen it.
- **Profiles.** Only Maya exists today. The table carries one *reached* column per profile; add a
  column (and re-run the same query list) when Devon / Priya land.

## 1. Coverage table (34 cards)

Legend: ✔ reached in an answer stack · ✘ not reached. "Goal" column = state of the tracked-goal
store when the card surfaced (`none` / `Lisbon`).

| # | card id | group | kind | Maya | query that surfaces it (goal state) | notes |
|---|---|---|---|:-:|---|---|
| 1 | `verdict_banner` | Verdict & framing | core | ✔ | `$6 latte` (none) | Anchor on every non-large stack. |
| 2 | `plan_header` | Verdict & framing | core | ✔ | `$1,200 flight to Lisbon in March` (none) | Anchor on every large stack. |
| 3 | `green_light` | Verdict & framing | core | ✔ | `$54 groceries` (none); also `$25 movie tickets` | Needs `projectedWith ≤ 0.9 × usual`. Only groceries (runRate 360 vs usual 480 → any amount ≤ $72) and entertainment (82 vs 120 → ≤ $26) can satisfy it; dining/transport/other run too close to usual. Never fires on the `latte` matrix path. |
| 4 | `consequence_line` | Verdict & framing | core | ✔ | `$60 dinner` (none) | Anchor; absent only on large **travel** (`consequence` is `[]` by design). |
| 5 | `post_purchase_footer` | Verdict & framing | core | ✔ | `$60 dinner` (none) | Anchor on every stack. |
| 6 | `category_pulse` | Money context | core | ✔ | `$60 dinner` (none) | Every small/medium non-recurring stack. |
| 7 | `pace_projection` | Money context | core | ✔ | `$28 Uber` (none); also `$30 parking`, `$20 CVS` | Eligible on `$60 dinner` too but always cap-dropped there (priority 60 is the lowest non-anchor). Dropped on `$28 Uber` once the goal exists (goal_impact_chip takes the slot). |
| 8 | `discretionary_runway` | Money context | core | ✔ | `$180 concert tickets` (none) | Also `$2,800 to move apartments`, `$120 groceries at Whole Foods`, `$150 gift`. |
| 9 | `carrying_cost` | Money context | core | ✔ | `$450 monitor` (none) | Requires `roomAfter < cushion` → amount > ≈$296 on this data (room ≈ $596). Also `$2,800 to move apartments`, `$700 laptop`, `$400 groceries`. |
| 10 | `cashflow_timeline` | Money context | core | ✔ | `$1,200 flight to Lisbon in March` (none) | Large + shortfall > 0 (availableNow = room − cushion ≈ $296). Also `$700 laptop`, `$1,500 couch`. Cap-dropped on `moving` once the goal exists. |
| 11 | `payday_proximity` | Money context | showpiece | ✔ | `$28 Uber` (none) | Payday is always now+3 d; needs verdict ≠ fine, so `$12 Uber` (fine) does **not** show it. Also `$95 concert tickets`, `$85 headphones`. |
| 12 | `best_card_row` | Cards & rewards | core | ✔ | `$6 latte` (none) | Every small non-recurring stack. |
| 13 | `card_ranking` | Cards & rewards | core | ✔ | `$140 running shoes` (none) | Every medium/large non-recurring stack (cap-dropped on `moving`). |
| 14 | `utilization_watch` | Cards & rewards | core | ✔ | `$140 running shoes` (none) | Freedom Unlimited sits at 30.5 % before any purchase, so the condition is true for every medium/large query; it survives the cap only on `shoes` (no goal), `$250 jacket` (no goal) and `$120 groceries at Whole Foods`. Dropped on `shoes` once the goal exists. |
| 15 | `credit_sweep` | Cards & rewards | core | ✔ | `$54 groceries` (none) | Only in the *generic small* pool; also `$20 CVS`, `$35 board game`, `$95 concert tickets`, `$85 headphones`, `$25 movie tickets`. |
| 16 | `credit_expiry` | Cards & rewards | showpiece | ✔ | `$60 dinner` (none) | Amex dining credit expires in 6 d. Also `$45 sushi dinner`, `$40 drinks`, `$14 Sweetgreen lunch`. Cap-dropped on `dinner` once the goal exists. |
| 17 | `points_offset` | Cards & rewards | core | ✔ | `$1,200 flight to Lisbon in March` (none) | Travel-only rows; also `$300 hotel`, `$2,000 flight to Tokyo`. |
| 18 | `benefits_check` | Cards & rewards | core | ✔ | `$450 monitor` (none) | Also `$200 headphones`. Eligible on `shoes`/`tickets` but cap-dropped there; dropped on `monitor` once the goal exists. |
| 19 | `merchant_habit` | Behavior lens | core | ✔ | `$6 latte` (none) | Also `$6 latte at Blue Bottle`, `$14 Sweetgreen lunch`. Needs a merchant hint (coffee → Blue Bottle; "lunch"/"salad" → Sweetgreen; or a named merchant) with ≥2 visits this month. |
| 20 | `impulse_frequency` | Behavior lens | core | ✔ | `$180 concert tickets` (none) | Entertainment anchors at −49 d / −22 d. Eligible on `shoes` but cap-dropped there. |
| 21 | `cost_per_use` | Behavior lens | interactive | ✔ | `$450 monitor` (none) | Also `$200 headphones`. On `shoes` the single interactive slot goes to `hold_24h`. |
| 22 | `duplicate_check` | Behavior lens | core | ✔ | `$140 running shoes` (none) | Nike (−42 d) is the tagged twin. Also `$250 jacket`. Cap-dropped on `monitor`. |
| 23 | `split_check` | Behavior lens | interactive | ✔ | `$60 dinner` (none) | Also `$45 sushi dinner`, `$40 drinks`; `$14 Sweetgreen lunch` is < $40 so it is skipped. |
| 24 | `hold_24h` | Behavior lens | interactive | ✔ | `$140 running shoes` (none) | Also `$150 gift`, `$250 jacket`, `$500 dinner`. |
| 25 | `annualized` | Recurring | core | ✔ | `$15/mo Crunchyroll` (none) | Every recurring stack. |
| 26 | `subscription_stack` | Recurring | core | ✔ | `$15/mo Crunchyroll` (none) | Every recurring stack. |
| 27 | `overlap_check` | Recurring | core | ✔ | `$15/mo Crunchyroll` (none) | Also `$10/mo Disney+`. Needs a `serviceCatalog` hit sharing a non-streaming/tv tag; `$8/mo Audible` correctly omits it. |
| 28 | `price_creep` | Recurring | showpiece | ✔ | `$15/mo Crunchyroll` (none) | Netflix + Spotify raises are in the data. |
| 29 | `goal_impact_chip` | Goals | core | ✔ | `$60 dinner` (Lisbon) | Also `$28 Uber`, `$140 running shoes`, `$450 monitor`, `$180 concert tickets`, `$45 sushi dinner`, `$150 gift`, `$250 jacket`, `$500 dinner` with the goal. Never on `$6 latte` (dining overshoot ≤ 0 → daysPushed 0) or `$54 groceries`. |
| 30 | `goal_collision` | Goals | interactive | ✔ | `$2,800 to move apartments` (Lisbon) | Also `$1,200 flight to Lisbon in March`, `$300 hotel`, `$700 laptop` with the goal. |
| 31 | `track_goal_cta` | Goals | core | ✔ | `$1,200 flight to Lisbon in March` (none) | Also `$300 hotel`, `$2,000 flight to Tokyo`. Disappears once a goal exists (by design). |
| 32 | `payment_fork` | Large-purchase showpieces | showpiece | ✔ | `$2,800 to move apartments` (none) | Also `$700 laptop`, `$1,500 couch`. |
| 33 | `total_cost_of_event` | Large-purchase showpieces | showpiece | ✔ | `$1,200 flight to Lisbon in March` (none) | Also `$300 hotel`, `$2,000 flight to Tokyo`. |
| 34 | `guilt_free_balance` | Large-purchase showpieces | showpiece | ✔ | `$180 concert tickets` (none) | Also `$200 headphones`. Requires verdict tone `tight`; dropped on `tickets` once the goal exists (goal_impact_chip outranks it). Not reachable on `shoes` (verdict is "Fine, with a caveat"). |

## 2. Unreached cards

**None.** All 34 cards surfaced in at least one composed answer stack for Maya without touching the
Card Gallery.

### Near-misses worth knowing (reachable, but on a narrow path)

These are *not* failures, but each is one data tweak away from becoming one. Suggestions are
diagnostic only — nothing was changed.

| card | why it is narrow | concrete suggestion (not implemented) |
|---|---|---|
| `green_light` | Only groceries ≤ $72 or entertainment ≤ $26 pass `projectedWith ≤ 0.9 × usual`. It is in the `latte` matrix path but dining runRate (525) vs usual (550) can never satisfy it, so the "$6 latte → green light" story never plays. | Either lower `BASELINES.dining.runRate` to ≈ 480 (then `$6 latte` → 486 ≤ 495 passes, but `$60 dinner` stays over usual at 540 < 550 — check the "$35 over" copy) or relax the threshold to `≤ usual` for `routine` frequency. |
| `credit_expiry` | Reachable only on dining/coffee **without** a goal: on `dinner` the 7-card cap drops it as soon as `goal_impact_chip` joins. | Give it a higher matrix slot than `split_check` on the `dinner` path, or exempt showpieces from the first cap pass. |
| `utilization_watch`, `benefits_check`, `impulse_frequency` | Eligible on every medium query, but in the *generic medium* pool the top five non-anchors (`card_ranking` 95, `category_pulse` 90, `hold_24h` 90, `discretionary_runway` 88, …) always fill the cap. They only surface via the hand-ordered `shoes`/`monitor`/`tickets` paths (and only without a goal). | Lower `category_pulse` relevance for medium discretionary buys, or raise `utilization_watch` priority above 88 when `after > 0.35`. |
| `guilt_free_balance` | Needs `verdict.tone === 'tight'` on a medium discretionary buy, and a goal flips the stack so `goal_impact_chip` pushes it out. Only `tickets`/`$200 headphones` no-goal hit it. | Give the showpiece a small relevance boost when the allowance covers < 100 %, so it outranks `impulse_frequency` on `tickets`. |
| `pace_projection` | Priority 60 makes it the first drop on `dinner` (eligible every time, never shown). It is only visible on the `uber` path or `$20 CVS`. | Either raise to ≥ 86 or remove it from the `dinner` matrix list so the DEV "dropped" line stops advertising it. |
| `merchant_habit` | Relies on the `MERCHANT_HINT` map (coffee/latte/espresso/lunch/salad) or a named merchant from the fallback regex; "$7 cappuccino" works only because coffee-category defaults to Blue Bottle. | Add `tatte`, `sweetgreen` variants and `breakfast` to `MERCHANT_HINT` for robustness. |
| `overlap_check` | Only services in `SERVICE_CATALOG` with a shared non-streaming tag overlap; the fallback regex's `merchant_guess` list is short (crunchyroll/netflix/spotify/hulu), so `$10/mo Disney+` overlaps via the `thing`-derived service name. | Nothing needed for Maya; new profiles must ship a catalog entry for every subscription in their data. |

## 3. Total

**34 / 34 reached for Maya.** (0 unreached.)

## Appendix A — observed stacks (raw)

No goal (`localStorage` cleared):

| query | path | cards (DOM order) |
|---|---|---|
| `$6 latte` | latte | verdict_banner, best_card_row, merchant_habit, category_pulse, consequence_line, post_purchase_footer |
| `$60 dinner` | dinner | verdict_banner, best_card_row, category_pulse, split_check, credit_expiry, consequence_line, post_purchase_footer |
| `$28 Uber` | uber | verdict_banner, best_card_row, payday_proximity, category_pulse, pace_projection, consequence_line, post_purchase_footer |
| `$15/mo Crunchyroll` | crunchyroll | verdict_banner, price_creep, annualized, subscription_stack, overlap_check, consequence_line, post_purchase_footer |
| `$140 running shoes` | shoes | verdict_banner, card_ranking, utilization_watch, hold_24h, duplicate_check, consequence_line, post_purchase_footer |
| `$450 monitor` | monitor | verdict_banner, card_ranking, carrying_cost, benefits_check, cost_per_use, consequence_line, post_purchase_footer |
| `$180 concert tickets` | tickets | verdict_banner, card_ranking, guilt_free_balance, discretionary_runway, impulse_frequency, consequence_line, post_purchase_footer |
| `$1,200 flight to Lisbon in March` | flight | plan_header, total_cost_of_event, card_ranking, cashflow_timeline, points_offset, track_goal_cta, post_purchase_footer |
| `$2,800 to move apartments` | moving | plan_header, payment_fork, carrying_cost, discretionary_runway, cashflow_timeline, consequence_line, post_purchase_footer |
| `$54 groceries` | quick-generic | verdict_banner, best_card_row, category_pulse, green_light, credit_sweep, consequence_line, post_purchase_footer |
| `$120 groceries at Whole Foods` | considered-generic | verdict_banner, card_ranking, utilization_watch, category_pulse, discretionary_runway, consequence_line, post_purchase_footer |
| `$6 latte at Blue Bottle` | latte | verdict_banner, best_card_row, merchant_habit, category_pulse, consequence_line, post_purchase_footer |
| `$14 Sweetgreen lunch` | dinner | verdict_banner, best_card_row, category_pulse, credit_expiry, merchant_habit, consequence_line, post_purchase_footer |
| `$20 CVS` | quick-generic | verdict_banner, best_card_row, category_pulse, credit_sweep, pace_projection, consequence_line, post_purchase_footer |
| `$35 board game` | quick-generic | verdict_banner, best_card_row, category_pulse, credit_sweep, consequence_line, post_purchase_footer |
| `$700 laptop` | plan-generic | plan_header, payment_fork, carrying_cost, card_ranking, cashflow_timeline, consequence_line, post_purchase_footer |
| `$300 hotel` | flight | plan_header, total_cost_of_event, card_ranking, points_offset, track_goal_cta, post_purchase_footer |
| `$45 sushi dinner` | dinner | verdict_banner, best_card_row, category_pulse, split_check, credit_expiry, consequence_line, post_purchase_footer |
| `$150 gift` | considered-generic | verdict_banner, card_ranking, category_pulse, discretionary_runway, hold_24h, consequence_line, post_purchase_footer |
| `$250 jacket` | shoes | verdict_banner, card_ranking, utilization_watch, hold_24h, duplicate_check, consequence_line, post_purchase_footer |
| `$95 concert tickets` | quick-generic | verdict_banner, best_card_row, category_pulse, payday_proximity, credit_sweep, consequence_line, post_purchase_footer |
| `$12 Uber` | uber | verdict_banner, best_card_row, category_pulse, consequence_line, post_purchase_footer |
| `$10/mo Disney+` | crunchyroll | verdict_banner, price_creep, annualized, subscription_stack, overlap_check, consequence_line, post_purchase_footer |
| `$8/mo Audible` | crunchyroll | verdict_banner, price_creep, annualized, subscription_stack, consequence_line, post_purchase_footer |
| `$1,500 couch` | moving | plan_header, payment_fork, carrying_cost, discretionary_runway, cashflow_timeline, consequence_line, post_purchase_footer |
| `$2,000 flight to Tokyo` | flight | plan_header, total_cost_of_event, card_ranking, cashflow_timeline, points_offset, track_goal_cta, post_purchase_footer |
| `$40 drinks` | dinner | verdict_banner, best_card_row, category_pulse, split_check, credit_expiry, consequence_line, post_purchase_footer |
| `$400 groceries` | considered-generic | verdict_banner, card_ranking, carrying_cost, category_pulse, discretionary_runway, consequence_line, post_purchase_footer |
| `$85 headphones` | quick-generic | verdict_banner, best_card_row, category_pulse, payday_proximity, credit_sweep, consequence_line, post_purchase_footer |
| `$200 headphones` | monitor | verdict_banner, card_ranking, benefits_check, guilt_free_balance, cost_per_use, consequence_line, post_purchase_footer |
| `$500 dinner` | considered-generic | verdict_banner, card_ranking, category_pulse, discretionary_runway, hold_24h, consequence_line, post_purchase_footer |
| `$25 movie tickets` | quick-generic | verdict_banner, best_card_row, category_pulse, green_light, credit_sweep, consequence_line, post_purchase_footer |
| `$30 parking` | uber | verdict_banner, best_card_row, payday_proximity, category_pulse, pace_projection, consequence_line, post_purchase_footer |

With the Lisbon goal tracked:

| query | path | cards (DOM order) |
|---|---|---|
| `$6 latte` | latte | verdict_banner, best_card_row, merchant_habit, category_pulse, consequence_line, post_purchase_footer |
| `$60 dinner` | dinner | verdict_banner, best_card_row, goal_impact_chip, category_pulse, split_check, consequence_line, post_purchase_footer |
| `$28 Uber` | uber | verdict_banner, best_card_row, goal_impact_chip, payday_proximity, category_pulse, consequence_line, post_purchase_footer |
| `$15/mo Crunchyroll` | crunchyroll | (unchanged) |
| `$140 running shoes` | shoes | verdict_banner, card_ranking, hold_24h, duplicate_check, goal_impact_chip, consequence_line, post_purchase_footer |
| `$450 monitor` | monitor | verdict_banner, card_ranking, carrying_cost, cost_per_use, goal_impact_chip, consequence_line, post_purchase_footer |
| `$180 concert tickets` | tickets | verdict_banner, card_ranking, discretionary_runway, impulse_frequency, goal_impact_chip, consequence_line, post_purchase_footer |
| `$1,200 flight to Lisbon in March` | flight | plan_header, total_cost_of_event, card_ranking, cashflow_timeline, points_offset, goal_collision, post_purchase_footer |
| `$2,800 to move apartments` | moving | plan_header, payment_fork, carrying_cost, goal_collision, discretionary_runway, consequence_line, post_purchase_footer |
| `$45 sushi dinner` | dinner | verdict_banner, best_card_row, goal_impact_chip, category_pulse, split_check, consequence_line, post_purchase_footer |
| `$150 gift` | considered-generic | verdict_banner, card_ranking, category_pulse, hold_24h, goal_impact_chip, consequence_line, post_purchase_footer |
| `$300 hotel` | flight | plan_header, total_cost_of_event, card_ranking, points_offset, goal_collision, post_purchase_footer |
| `$700 laptop` | plan-generic | plan_header, payment_fork, card_ranking, goal_collision, cashflow_timeline, consequence_line, post_purchase_footer |
| `$54 groceries` | quick-generic | (unchanged) |
| `$250 jacket` | shoes | verdict_banner, card_ranking, hold_24h, duplicate_check, goal_impact_chip, consequence_line, post_purchase_footer |
| `$500 dinner` | considered-generic | verdict_banner, card_ranking, category_pulse, hold_24h, goal_impact_chip, consequence_line, post_purchase_footer |

## Appendix B — re-running for a new profile

Step file shape consumed by the Playwright driver (`pw.mjs <steps.json>`):

```json
[
  { "goto": "http://localhost:5179/" }, { "eval": "localStorage.clear()" },
  { "goto": "http://localhost:5179/answer?q=%2460%20dinner" }, { "wait": 1500 },
  { "eval": "JSON.stringify({path: document.querySelector('[data-screen=answer]')?.getAttribute('data-path'), cards: [...document.querySelectorAll('[data-card]')].map(e=>e.dataset.card)})" }
]
```

To test goal-dependent cards, insert after the clear:
`{ "goto": ".../answer?q=%241%2C200%20flight%20to%20Lisbon%20in%20March" }, { "wait": 1500 }, { "click": "text=Track Lisbon as a goal" }, { "wait": 1200 }`.
Add a `?profile=` (or whatever the profile switcher exposes) to each `goto` once more profiles exist, and add a column to the table in §1.

Key data thresholds for Maya that future profiles must re-derive: room ≈ $596 before payday
(checking 3 240 − rent 1 850 − remaining subs 45 − essentials 299 − buffer 450), cushion $300,
Freedom Unlimited utilization 30.5 % pre-purchase, Amex dining credit at +6 d, payday at +3 d.
