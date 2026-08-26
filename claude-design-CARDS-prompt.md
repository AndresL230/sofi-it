# Claude Design — Cards Prompt (SoFi Purchase Coach)

Build the card library for the SoFi Purchase Coach answer screens. Every answer is a **stack composed from these cards** — never a fixed template. If you already have the base prototype, this upgrades/replaces the cards in it.

**Also build a Card Gallery screen** (reachable from a small slate "card gallery" link in the home page footer): every card below rendered once with the sample data in the appendix, in a responsive masonry grid, each labeled with its card name in 11px slate caps above it, grouped under the section headers used here. Interactive cards must work in the gallery. This screen exists so all cards are reviewable without hunting through queries.

**Governing rule: every card must be identifiable with its text removed — by silhouette and graphic alone.** If two cards would pass for each other blurred, one is wrong. No chart-library defaults substituting for the signature graphics — the iceberg, fork, runway, punch card, receipt, calendar strip, Venn, polaroids, stamp, speedometer and multiplication wall are all bespoke.

Every card: white, 16px radius, soft shadow, enters with the stack stagger (fade + 8px rise); its signature motion fires once ~200ms after entrance, then holds still. Every number inside every graphic is bound to the appendix data — never decorative static text.

---

## Verdict & framing

**1. verdict_banner** — the only full-bleed tinted element. Verdict word bold first ("Fine." / "Tight." / "Over."), one clause after it, amount right-aligned in hero numerals. Tint animates in last. Never more than one sentence of judgment. Tints: fine = turquoise, tight = gold→salmon, over = red.

**2. plan_header** — replaces verdict_banner on large purchases: "Not today — but here's the path." Amount hero-sized. No tint.

**3. green_light** — a **passport-stamp seal**: double-ring turquoise circle rotated −8°, "COVERED" in letterspaced caps inside, check glyph beneath, slightly rough stamp-ink edge. Copy sits right of it ("Dining's $140 under usual — enjoy it."). The unqualified yes. Renders when category is under pace AND goals on track.

**4. consequence_line** — deliberately the ONLY chrome-free element in the system: one plain factual sentence, 14px slate, no card, no icon, 20px margins. Its plainness is its identity. Factual never advisory — "Say yes and dining runs $35 hot this month," never "you should."

**5. post_purchase_footer** — **before→after ledger strip** on every answer: stat pairs ("checking $3,240 → $3,180", "Freedom $1,220 → $1,360", "dining $410 → $470") separated by thin arrows, the "after" values rolling in as digits; purple goal-delta segment at far right, only when a goal exists.

## Money context

**6. category_pulse** — **segmented capsule bar**: solid turquoise = spent so far, **diagonal-hatched** segment = this purchase, thin navy tick = your usual, lavender = remaining. Caption row: days left + projected landing total.

**7. pace_projection** — **trajectory mini-chart**: solid teal line across elapsed days, then a dotted arc projecting to month-end; dashed lavender horizontal = usual; a small salmon flag where the arc crosses it ("+$35"). Renders only when the purchase pushes projected month-end >5% over usual.

**8. discretionary_runway** — a literal **runway**: dark navy horizontal band with white center-line dashes; upcoming bills as labeled lavender blocks consuming length from the right (rent, subs); the remaining lit stretch in teal carrying "$612 of room"; payday a small beacon dot at the far end.

**9. carrying_cost** — **three month columns**: each a bar of remaining balance with a red interest cap stacked on top; a cumulative "+$42" tag counts up above the third column. One label line only. Renders when the amount can't clear checking after bills.

**10. cashflow_timeline** — horizontal line with biweekly payday $-dot ticks; today a navy dot; a teal flag "affordable in full ~Apr 18" and a purple flag "Mar 27 if you redirect $180/mo" on stems. Large answers only.

**11. payday_proximity** — **5-tile calendar strip**: rounded 44px day squares on a thin lavender baseline, weekday initials; today = navy fill, white numeral, "today" tag beneath; payday tile = turquoise fill with a white "$" glyph and a floating green `+$2,610` tag on a stem above. A 3px teal dot travels the baseline over 700ms and stops ~70% of the way. Beneath: two mini verdict pills with an arrow between — "buy today → **tight**" (salmon) → "buy Friday → **fine**" (turquoise) — then a teal link "Remind me Friday" (toast: "I'll re-run this Friday morning"). Renders when payday ≤4 days away and runway is tight.

## Cards & rewards

**12. best_card_row** — mini **card art** (rounded rect in the issuer's palette color, name in white) left, earn line center, green delta pill right ("+$3.60 vs your 2%"), chevron expanding to card_ranking. Small answers.

**13. card_ranking** — a **leaderboard**: left rail of oversized rank numerals (28px lavender; the "1" turquoise); each row a mini card art + reason + delta vs winner; winner row elevated 2px with a soft turquoise glow; disqualifier badges replace the delta where relevant — gold "cap reached — $13 left", salmon "would hit 34% — pay before the 12th", gray "no bonus category". All five cards, always.

**14. utilization_watch** — **half-arc speedometer**: 0–100% arc banded green→gold→red, a tick and small label at the 30% threshold, thin needle resting at 34%; pay-by date beneath in navy semibold. Renders when a candidate card would cross 30%.

**15. credit_sweep** — a horizontal row of **mini ticket chips** (gold tint, perforated left edge, value bold) — one per unused credit ("$10 Amex dining", "$50 CSP hotel") — with a "swept" total pill at right that counts up as the tickets stagger in 80ms apart.

**16. credit_expiry** — **the expiring coupon**. Card split 70/30 by a **vertical perforated divider** — dashed lavender line with semicircular notches punched into the card's top and bottom edges where it meets them, like a tear-off ticket stub. The right stub is tinted gold 15% and holds a **circular countdown dial**: thin gold ring, 270° arc for days remaining out of 30, "6" in navy bold 28px at center, "days left" 11px slate beneath. Left: small gold coin icon + "UNUSED CREDIT" in 11px letterspaced slate caps; "$10 Amex dining credit" 17px semibold navy; "This dinner uses it before it disappears." 14px slate. Dial arc draws clockwise 500ms, then the stub pulses to 1.02 once. **Never red on this card** — expiry is opportunity, not alarm.

**17. points_offset** — **receipt math**: right-aligned ledger rows in tabular numerals ("48,000 UR → Iberia   −$530", "Amex credits   −$20"), a 1px rule, then "real out-of-pocket **$670**" in hero numerals. Tabular figures on this card only.

**18. benefits_check** — **three shields** in a row: active shields turquoise-outlined with the day count inside ("120d") and the label beneath (returns / purchase protection / extended warranty / trip protection, chosen by category); inapplicable shields lavender at 40% opacity. No prose at all. Doesn't render for dining, groceries, or transport.

## Behavior lens (data, never judgment)

**19. merchant_habit** — a **loyalty punch card**: a row of 8 punch circles, this month's visits shown as punched holes (inner shadow, slight offset), the rest empty rings; footer "4 visits · $212 YTD."

**20. impulse_frequency** — **quarter dot-strip**: 13 thin week ticks; past purchases as filled navy dots sized by amount sitting on their week; this purchase a hollow pulsing dot at today's tick. One label line beneath.

**21. cost_per_use** — **interactive**: a price-tag graphic splitting into a row of per-use tokens; an "expected uses" slider (10–100) beneath; the $/use figure recomputes live and shifts color teal→gold→salmon across thresholds; anchor line "your boots: ≈$8/wear so far."

**22. duplicate_check** — **two polaroid tiles** side by side, rotated ∓2°: left "6 weeks ago · running sneakers · $95", right "today · these · $140", a small "VS" chip on the seam. Renders when a similar-category buy occurred <90 days ago.

**23. split_check** — **the live receipt**, interactive. Straight top edge, **zigzag torn bottom edge** (8px triangles, 1px lavender), faint dotted receipt rules between rows. Rows: "THE CHECK" 11px letterspaced caps centered · "$60.00" hero centered · dotted rule · **stepper row**: 1–4 person icons horizontally (filled turquoise circles with white person glyphs for the current count, lavender-outline circles for the rest) flanked by −/+ 36px ring buttons · "your share" 12px slate with the per-person amount 24px bold navy **recomputing live with an odometer digit-roll** (200ms) as the count changes ($60 → $30 → $20 → $15) · a **verdict pill** at the bottom that re-evaluates for the share and crossfades color over 250ms (tight/salmon at $60 for one → fine/turquoise at $20 for three), caption "verdict for your share." Renders on restaurant queries ≥ $40.

**24. hold_24h** — a **flip card**. Front: outlined turquoise button "Hold it for 24 hours — I'll re-ask you tomorrow." On tap the whole card 3D-flips on the y-axis (600ms) to a sealed state: navy face, envelope-flap crease, a thin clock ring counting 24h, "Held. Ask me tomorrow." Outside the sealed face sits a dashed demo control `⏭ skip to tomorrow`; tapping it flips again to the re-ask: "Still want the $140 running shoes? Nothing about the answer changed — still fine, SoFi 2% still the card." Buttons "Buy it" / "Let it go" (Let it go → quiet toast, no confetti: "Saved $140. Lisbon says thanks." when a goal exists, else "Saved $140."). Medium discretionary only — never groceries, bills, or transport.

## Recurring

**25. annualized** — a **multiplication wall**: "$15" on a small tile, an × glyph, a 4×3 grid of twelve micro month-tiles filling turquoise in sequence 40ms apart, an = glyph, then "$180/yr" landing in hero numerals as a count-up.

**26. subscription_stack** — a **stacked tower**: each subscription a thin tabular row (name + price) piled like a receipt tower; the candidate slides into the top highlighted gold; the total beneath ticks $85 → $100. Past 6 subs, middle rows compress to 60% height.

**27. overlap_check** — a small **Venn**: two overlapping circles each holding their service chips, the intersection shaded salmon at 15% with the overlapping pair named inside ("Netflix · Hulu"). One caption line, no recommendation.

**28. price_creep** — **the creeping sparkline**. Headline: "Same subscriptions. **+$14/mo** in raises." (+$14 in salmon). Graphic: a **12-month stepped area sparkline**, full width, 72px tall — 2px salmon line stepping upward $71 → $85, salmon→transparent vertical gradient beneath at 12%, tiny 9px month initials every other tick. At each raise month, a small salmon dot with a **floating micro-tag on a 1px stem** ("Netflix +$2.50", "Spotify +$1" — 10px navy text in white pills with lavender borders). Endpoint anchors "$71" 14px and "$85" 16px semibold. Beyond the right end, a hollow salmon dot at $100 labeled "with Crunchyroll". Footer: "That's $168/yr of drift — before adding this one." Line draws left→right 600ms; tags pop 60ms after the line passes their dot.

## Goals

**29. goal_impact_chip** — a purple pill with a tiny plane glyph that **nudges 4px right** as the date crossfades "Apr 3 → Apr 5"; the pace fix beneath in 11px ("skip one dinner this week to stay on pace"). Small/medium answers, once a goal exists.

**30. goal_collision** — interactive showpiece: **two stacked mini-timelines** sharing an x-axis (Lisbon in purple, the purchase in navy) with a **tradeoff slider** between them; dragging redistributes both end dates live; endpoint labels "protect Lisbon" ↔ "move now"; thumb defaults to the balanced compromise ("Both fit if Lisbon moves to May 9 — or this waits until Apr 2."). Large purchase against an existing goal.

**31. track_goal_cta** — full-width purple button with a small vault illustration at left; tap triggers a coin-drop micro-animation into the vault (300ms), then a toast ("Lisbon is now a tracked goal — small purchases will check against it.") and auto-return home with the goal pill visible.

## Large-purchase showpieces

**32. payment_fork** — **the branching paths**. Title "Three ways to pay $2,800". A single navy dot at top center drops a 2px line that splits into three **smooth-curved branches** (rounded bezier elbows, never hard angles) feeding into three equal columns. Each column: a **vertical cost bar** (28px wide, rounded top) whose height is proportional to true total cost, the branch entering its top; beneath, method name 13px semibold, total 18px bold, one 11px slate line. Cash now — turquoise, "$2,800", "gone today, $0 extra". SoFi loan — purple, taller, "$2,969", "12 mo · 10.99% · $247/mo". Ride the card — red, tallest, "$3,180", "Freedom 24.24% · a year to clear". The cheapest column gets a thin turquoise ring and a small "true cost winner" tag. Branches draw top-down 300ms, then bars grow bottom-up left→right 200ms each. No judgment copy — the bar heights argue.

**33. total_cost_of_event** — **the iceberg**. Headline "The flight is the tip." 17px semibold navy. A horizontal **waterline at 35% card height**: plain white above; below it a navy vertical gradient (`#201747` 8% → 20%) with two thin turquoise wavy hairlines at the surface. The iceberg is a **faceted low-poly polygon**: a small white/lavender peak above the line carrying a floating white pill tag "**Flight $1,200**"; a mass roughly 2× larger below in slightly darker lavender facets, holding three **chip tags anchored to facets** — "Stay ~$640" · "Food & out ~$420" · "Local + extras ~$240" (11px slate in white pills with subtle shadow). Anchor row beneath: "REALISTIC ALL-IN" 12px slate caps + "**≈ $2,500**" in hero numerals + a 10px footnote "based on your last trip running 2.1× the flight." Waterline shimmers once (2px horizontal drift); submerged chips fade in top→bottom 120ms apart — the cost sinking into view.

**34. guilt_free_balance** — **the fun-money gauge**, deliberately the lightest-feeling card in the system. Compact horizontal: left a **72px ring gauge** — lavender track, turquoise→green gradient fill sweeping to 57% ($85 of $150), rounded line caps, a tiny green spark dot orbiting at the fill's endpoint; center "$85" 20px bold navy over "left" 10px slate. Right: "No-questions money" 15px semibold navy; "You set aside $150/mo for exactly this. $85 is still yours to burn." 13px slate; a small green tag pill "counts $85 of these shoes as pre-approved ✓". If the purchase exceeds the balance, the fill turns **gold, never red**, and the tag reads "covers $85 of it — the last $55 is a real decision." **No warnings ever appear on this card** — it exists to make the rest of the system feel fair. Ring sweeps 500ms with a 1.03 settle bounce.

---

## Composition rules
Max **7 cards** per answer (drop lowest-priority beyond that) · max **one interactive card** per answer (split_check, cost_per_use, goal_collision, hold_24h) · max **one showpiece**, except large answers which may carry two (e.g. iceberg + fork) · a card whose data condition fails **silently doesn't render** — never an empty state inside an answer.

**Mobile (380px):** dial, stepper, gauge, punch card and calendar strip keep full size; sparkline, fork, iceberg, timelines compress horizontally, never vertically.

## Appendix — data the cards bind to
Colors: turquoise `#00A2C7` · navy `#201747` · purple `#330072` (goals only) · red `#E03E52` (over only) · salmon `#DD7975` · gold `#FED880` · slate `#53565A` · lavender `#E5E1E6` · green `#00A05A`. Type: Proxima Nova, fallback Inter (−0.01em). **All hero numerals: bold digits with small raised cents.**

Checking $3,240 · Savings $8,900 (Lisbon vault $1,150) · 48,000 Chase UR + 22,000 Amex MR · payday in 3 days, $2,610 biweekly. Cards: SoFi Unlimited 2% ($340/$10k) · Amex Gold ($290, $10 dining credit expiring in 6 days) · Citi Custom Cash ($210/$3k, $487 of $500 cap used) · Chase Sapphire Preferred ($620/$12k, $50 hotel credit unused) · Chase Freedom Unlimited ($1,220/$4k, statement closes the 12th, APR 24.24%). Baselines: dining $410/$550 with 12 days left · groceries $310/$480 · transport $95/$160 · shopping $215/$250 (prior: $95 sneakers, $120 boots this quarter) · entertainment $60/$120 · subs $85/$85 · rent $1,850. Merchants: Blue Bottle ×4 (~$6, $212 YTD) · Sweetgreen ×4 (~$13). Subs: Netflix $15.49, Hulu $7.99, Spotify $11.99, iCloud $2.99, NYT $17, ClassPass $19, gym $45 — was $71/mo a year ago (Netflix +$2.50, Spotify +$1). Prior trip: $380 flight + ~$800 around it (2.1×). SoFi loan 10.99%. Fun money $150/mo, $85 left. Goal: Lisbon $2,400 by [today + 10 weeks], $1,150 saved, $125/wk pace.
