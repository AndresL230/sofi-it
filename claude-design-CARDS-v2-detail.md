# Card Visual Spec — the seven v2 cards (paste into Claude Design)

Detailed visual direction for the seven additional cards the engine can choose. Each is a white 16px-radius card in the existing system, but each gets one signature graphic that makes it instantly recognizable in the stack. Brand tokens apply throughout: turquoise `#00A2C7`, navy `#201747`, purple `#330072`, red `#E03E52`, salmon `#DD7975`, gold `#FED880`, slate `#53565A`, lavender `#E5E1E6`, green `#00A05A`. All hero numbers use bold numerals with small raised cents. Every card animates in with the stack stagger (fade + 8px rise); each card's signature motion listed below fires once, ~200ms after its entrance, then holds still.

---

## 1. credit_expiry — "the expiring coupon"
**Renders when:** dining purchase + unused card credit expiring in &lt;10 days.
**Layout:** horizontal card styled as a coupon. Left 70%: content. Right 30%: separated by a **vertical perforated divider** — a dashed lavender line with two semicircular notches punched into the card's top and bottom edges where the dash line meets them, exactly like a tear-off ticket stub.
**The graphic:** the right stub has a soft gold tint (`#FED880` at 15%) and holds a **circular countdown dial**: thin gold ring, 270° arc representing days remaining out of 30, with "6" in navy bold 28px at center and "days left" in 11px slate beneath.
**Left content:** small gold coin icon + label "UNUSED CREDIT" in 11px letterspaced slate caps; then "$10 Amex dining credit" in 17px semibold navy; then one line, 14px slate: "This dinner uses it before it disappears."
**Motion:** the dial arc draws clockwise over 500ms; the stub gives one gentle 1.02 scale pulse when the arc completes.
**Never:** red on this card — expiry is opportunity, not alarm.

## 2. split_check — "the live receipt"
**Renders when:** restaurant query ≥ $40. Interactive.
**Layout:** vertical card styled as a **receipt**: top edge straight, bottom edge a subtle zigzag (8px triangles, 1px lavender border) like torn paper. Faint dotted lavender rules between rows, receipt-style.
**Rows top to bottom:** "THE CHECK" 11px letterspaced caps centered; "$60.00" hero numerals centered; a dotted rule; the **stepper row**: 1–4 person icons in a horizontal row — filled turquoise circles with white person glyphs for the current count, lavender-outline circles for the rest — flanked by − / + tap targets (36px circles, turquoise ring). Beneath: "your share" in 12px slate and the per-person amount in 24px bold navy that **recomputes live** ($60 → $30 → $20 → $15).
**The payoff row:** a verdict pill at the receipt's bottom that re-evaluates with the count — at $60/1 it might read "tight" (salmon fill); at $20/3 it flips to "fine" (turquoise fill). Pill crossfades color and text in 250ms. Caption in 11px slate: "verdict for your share."
**Motion:** on count change, the share number rolls like an odometer (digits slide vertically, 200ms).

## 3. payday_proximity — "the calendar strip"
**Renders when:** next payday ≤ 4 days and runway is tight.
**Layout:** full-width horizontal card. Top line: bolt/clock icon + "3 days to payday" 15px semibold navy.
**The graphic:** a **5-day calendar strip** — five rounded-square day tiles (44px) in a row, labeled with weekday initials, connected by a thin lavender baseline. Today's tile: navy fill, white date numeral, small "today" tag beneath. In-between tiles: white with lavender border. **Payday tile:** turquoise fill, white "$" glyph replacing the date, a green `+$2,610` floating tag above it on a small stem.
**Beneath the strip:** two mini verdict pills side by side with an arrow between: "buy today → **tight**" (salmon pill) → "buy Friday → **fine**" (turquoise pill). Then a teal text link: "Remind me Friday" (in the prototype, tapping shows a quiet toast "I'll re-run this Friday morning").
**Motion:** a 3px turquoise progress dot travels the baseline from today's tile toward the payday tile over 700ms and stops ~70% of the way, marking where "now" sits in the wait.

## 4. price_creep — "the creeping sparkline"
**Renders when:** recurring query + subscription total rose YoY.
**Layout:** card headline first: "Same subscriptions. **+$14/mo** in raises." with the +$14 in salmon.
**The graphic:** a **12-month stepped area sparkline**, full card width, 72px tall: x-axis = last 12 months (tiny month initials in 9px slate every other tick), line stepping upward from $71 to $85. Line 2px salmon; area beneath a salmon→transparent vertical gradient at 12% opacity. At each price-raise month, a **small salmon dot with a floating micro-tag** on a 1px stem: "Netflix +$2.50", "Spotify +$1" (10px, navy text, white pill with lavender border). Left and right endpoints get bold anchors: "$71" and "$85" in 14px navy, the right one 16px semibold.
**Footer line:** 13px slate: "That's $168/yr of drift — before adding this one." Then this query's sub appended as a hollow salmon dot beyond the line's right end at $100, labeled "with Crunchyroll".
**Motion:** the line draws left→right over 600ms; tags pop in 60ms after their dot passes.

## 5. payment_fork — "the branching paths"
**Renders when:** large purchase can't clear from checking.
**Layout:** card titled "Three ways to pay $2,800" 15px semibold navy, then the signature graphic filling the card.
**The graphic:** a literal **fork diagram**. A single navy dot at top center ("$2,800" beside it) drops a 2px line that splits into three smooth-curved branches (use rounded bezier elbows, not hard angles) ending in three equal columns. Each column: a **vertical cost bar** (28px wide, rounded top) whose height is proportional to true total cost, the branch feeding into its top; beneath each bar, the method name 13px semibold, the total in 18px bold, and one 11px slate line.
- **Cash now:** turquoise bar, "$2,800", "gone today, $0 extra".
- **SoFi loan:** purple bar slightly taller, "$2,969", "12 mo · 10.99% · $247/mo".
- **Ride the card:** red bar tallest, "$3,180", "Freedom 24.24% · a year to clear".
The cheapest column gets a thin turquoise ring around its whole column and a tiny "true cost winner" tag.
**Motion:** branches draw top-down (300ms), then bars grow bottom-up in sequence left→right (200ms each). No other judgment copy — the bar heights argue.

## 6. total_cost_of_event — "the iceberg"
**Renders when:** travel/large event purchase.
**Layout:** card with headline "The flight is the tip." 17px semibold navy. The graphic owns the card.
**The graphic:** an **iceberg cross-section**. A horizontal waterline at 35% card height: above it, plain white background; below it, a navy→deep-navy vertical gradient (`#201747` 8% → 20%) suggesting water, with two thin wavy hairlines in turquoise at the waterline. The iceberg: a faceted low-poly white/lavender polygon — small peak above the line labeled with a floating tag "**Flight $1,200**" (white pill, navy text); a mass ~2× larger below the line in slightly darker lavender facets. Inside the submerged mass, three small **chip tags** anchored to facets: "Stay ~$640" · "Food &amp; out ~$420" · "Local + extras ~$240" (11px, white pills, slate text, subtle shadow).
**Anchor row beneath:** "Realistic all-in" 12px slate caps + "**≈ $2,500**" hero numerals, with a 10px footnote: "based on your last trip running 2.1× the flight."
**Motion:** waterline shimmers once (2px horizontal drift); submerged chips fade in sequentially top→bottom, 120ms apart — the cost sinking into view.

## 7. guilt_free_balance — "the fun-money gauge"
**Renders when:** medium discretionary purchase + verdict is tight.
**Layout:** compact horizontal card, deliberately the *lightest*-feeling card in the system. Left: the gauge. Right: copy.
**The graphic:** a **ring gauge** 72px: track in lavender, fill in a turquoise→green gradient sweeping to 57% ($85 of $150), rounded line caps. Center: "$85" 20px bold navy over "left" 10px slate. Orbiting the ring's outer edge at the fill's endpoint, a tiny green spark dot.
**Right copy:** "No-questions money" 15px semibold navy; "You set aside $150/mo for exactly this. $85 is still yours to burn." 13px slate. A small green tag pill: "counts $85 of these shoes as pre-approved ✓".
**Tone rule:** no warnings ever appear on this card; it exists to make the rest of the system feel fair. If the purchase exceeds the remaining balance, the gauge fill turns gold (not red) and the tag reads "covers $85 of it — the last $55 is a real decision."
**Motion:** ring fills with a 500ms sweep and a 1.03 settle bounce; the spark dot fades in at the tip.

---

## Stack-level rules for these seven
- One signature graphic per card, exactly as specified — never two graphics in one card, never a generic bar chart substituted for a signature.
- Max one of these "showpiece" cards per answer alongside the core verdict/ranking cards, except large purchases, which may carry two (e.g. iceberg + fork). The composer enforces this.
- Graphics scale down gracefully at 380px width: dial, stepper, gauge, and calendar strip stay full size; sparkline, fork, and iceberg compress horizontally, never vertically.
- All numbers inside graphics come from the engine's mock-data math — graphics are bound to data props, nothing hand-drawn as static text.

---

## 10. Distinct UI identities — every remaining core card (no two cards in the system may look alike)

### Verdict &amp; framing
- **verdict_banner** — the only full-bleed tinted element: verdict word bold, one clause, amount right in hero numerals (NumberFlow). Tint animates in last.
- **green_light** — a **passport-stamp seal**: double-ring turquoise circle, rotated −8°, "COVERED" in letterspaced caps inside, check glyph beneath, slightly rough stamp-ink edge. Sits left of the copy. It should feel earned, not decorative.
- **consequence_line** — deliberately the ONLY chrome-free element in the system: one plain sentence, 14px slate, no card, no icon, 20px margin above and below. Its plainness *is* its identity — the quiet honest voice.
- **post_purchase_footer** — a **before→after ledger strip**: stat pairs ("checking $3,240 → $3,180") with a thin arrow between, each "after" value rolling in via NumberFlow; goal segment in purple at the far right.

### Money context
- **category_pulse** — segmented **capsule bar** (Tremor CategoryBar base): solid turquoise = spent, **diagonal-hatched** segment = this purchase, thin navy tick = your usual, lavender = remaining. Caption row: days left + landing total.
- **pace_projection** — a **trajectory mini-chart**: solid teal line for days elapsed, then a dotted arc projecting to month-end; dashed horizontal lavender line = usual; where the dotted arc crosses it, a small salmon flag with the overshoot ("+$35").
- **discretionary_runway** — a literal **runway**: dark navy horizontal band with white center-line dashes; upcoming bills as labeled lavender blocks consuming length from the right (rent, subs); the remaining lit stretch in teal with "$612 of room" on it; payday as a small beacon dot at the far end.
- **carrying_cost** — **three month columns**: each a small bar of remaining balance with a red cap segment on top = interest accrued that month; cumulative "+$42" tag grows above the third column (NumberFlow count-up). No copy beyond one label line.
- **cashflow_timeline** — horizontal line with biweekly payday ticks (small $ dots), teal "affordable in full" flag and purple accelerated flag on stems; today marked with a navy dot.

### Cards &amp; rewards
- **best_card_row** — mini **card art** (rounded rect in the issuer's brand color from our palette, name in white) left; earn line center; a green delta pill right ("+$3.60 vs your 2%"). Chevron expander to the full ranking.
- **card_ranking** — a **leaderboard**: left rail of big rank numerals (28px, lavender; the "1" in turquoise), each row a mini card art + reason + delta; winner row elevated 2px with a soft turquoise glow; disqualifier badges (gold "cap reached", salmon "utilization") sit where the delta would.
- **utilization_watch** — a **half-arc speedometer**: 0–100% arc banded green→gold→red, thin needle at 34%, a tick and tiny label at the 30% threshold; beneath, the pay-by date in navy semibold.
- **credit_sweep** — a horizontal row of **mini ticket chips** (gold tint, perforated left edge, value bold) — one per unused credit; at right a "swept" total pill that counts up as each ticket animates in with a 80ms stagger.
- **points_offset** — **receipt math**: right-aligned ledger rows ("48,000 UR → Iberia  −$530", "Amex credits  −$20"), a 1px rule, then "real out-of-pocket **$670**" in hero numerals. Monospace-feel tabular numerals for the ledger only.
- **benefits_check** — **three shields** in a row: active shields turquoise-outlined with the day count inside ("120d") and label beneath; inapplicable shields lavender at 40% opacity. No prose.

### Behavior lens
- **merchant_habit** — a **loyalty punch card**: a row of 8 punch circles, this month's visits shown as punched holes (inner shadow, slight offset), the rest empty rings; footer "4 visits · $212 YTD". Instantly legible, mildly funny, zero judgment.
- **impulse_frequency** — a **quarter dot-strip**: 13 thin week ticks; past purchases as filled navy dots sized by amount sitting on their week; this purchase as a hollow pulsing dot at today's tick. One label line beneath.
- **cost_per_use** — **interactive**: price tag graphic splitting into a row of per-use tokens; an "expected uses" slider (10–100) beneath; the $/use figure recomputes live via NumberFlow and its color shifts teal→gold→salmon across thresholds. The comparison line ("your boots: $8/wear") anchors it.
- **duplicate_check** — **two polaroid tiles** side by side, rotated ∓2°: left "6 weeks ago · running sneakers · $95", right "today · these · $140", a small "VS" chip on the seam. Data only.
- **hold_24h** — a **flip card**: front is the outlined hold button; on tap the whole card 3D-flips (600ms, y-axis) to a sealed state — navy face, envelope-flap crease, a thin clock ring counting 24h, "Held. Ask me tomorrow." The dashed `⏭ skip to tomorrow` control sits outside the sealed face; skipping flips it again to the re-ask.

### Recurring
- **annualized** — a **multiplication wall**: "$15" on a small tile, an × glyph, then a 4×3 grid of twelve micro month-tiles that fill turquoise in sequence (40ms each), an = glyph, and "$180/yr" landing in hero numerals via NumberFlow count-up.
- **subscription_stack** — a **stacked tower**: each sub a thin row (name + price, tabular) piled like a receipt tower; the candidate sub slides into the top highlighted gold; the total beneath ticks $85 → $100 (NumberFlow). If &gt;6 subs, middle rows compress to 60% height.
- **overlap_check** — a small **Venn**: two overlapping circles, each holding its service chips; the intersection shaded salmon 15% with the overlapping pair inside. One caption line, no recommendation.

### Goals
- **goal_impact_chip** — purple pill with a tiny plane glyph that **nudges 4px right** as the date crossfades "Apr 3 → Apr 5"; the pace fix ("skip one dinner this week") in 11px beneath the pill.
- **goal_collision** — the second interactive showpiece: **two mini-timelines** stacked (Lisbon purple, the purchase navy) sharing an x-axis, plus a **tradeoff slider** between them; dragging redistributes dates live at both ends (NumberFlow on the dates). Endpoint labels: "protect Lisbon" ↔ "move now". Default thumb at the balanced compromise.
- **track_goal_cta** — full-width purple button with a small vault illustration left; on tap a coin-drop micro-animation into the vault (300ms), then the toast and auto-return home.

### System rule
Every card must be identifiable **with its text removed** — by silhouette and graphic alone. If two cards would pass for each other blurred, one of them is wrong. Composer still caps answers at 7 cards, max one interactive card (split_check, cost_per_use, goal_collision, hold_24h) per answer.
