# Claude Design Prompt — SoFi Purchase Coach (paste everything below)

Build a single-page interactive prototype called **SoFi Purchase Coach** — a pre-purchase decision engine embedded inside SoFi's Relay / Coach Insights product. Desktop-first web layout, but it must remain usable on a phone (this will be demoed via QR code). All data is hardcoded; no API calls. Every interaction described below must actually work in the prototype.

---

## 1. Brand system — follow strictly

**Colors (exact hex):**
- Turquoise (primary brand / actions / links / "fine" verdict): `#00A2C7`
- Deep navy (dark surfaces, emphasis text): `#201747`
- Purple (goals layer + premium accents only): `#330072`
- Red ("over" verdict, alerts): `#E03E52`
- Salmon ("tight" verdict, soft warnings): `#DD7975`
- Gold (rewards, points, highlights): `#FED880`
- Slate gray (secondary text): `#53565A`
- Lavender-gray (dividers, subtle fills, disabled): `#E5E1E6`
- Page background: warm off-white `#F7F5F3`. Cards: pure white, 16px radius, very soft diffuse shadow.
- Positive money amounts: green `#00A05A`. Near-black body/headline text: `#1B1B1B`.

**Verdict color mapping (used everywhere):** fine = turquoise tint, tight = gold→salmon tint, over = red tint. Goals are always purple. Never use purple for verdicts or red for anything but "over."

**Typography:** Proxima Nova; if unavailable use **Inter** with letter-spacing -0.01em as the stand-in. Big numerals bold with small raised cents (e.g. **$2,992**.92 with the cents superscripted at ~50% size) — this is a signature SoFi pattern, use it for every hero number. Headlines large, near-black, sentence case ("My financial insights"). Body 14–16px, secondary text in slate.

**SoFi UI patterns to reuse throughout:**
- White top nav: SoFi logo left; text links: Home, Banking, Smart Card, Credit Card, Invest, Crypto, Loans, **Coach Insights** (active), Insurance, At Work, Business; icon buttons right; purple "Get ✦ Plus" pill.
- Teal circular icon buttons with tiny labels beneath (Add / Search / Manage).
- Teal text links for secondary actions ("View more", "View all transactions", "Hide chart").
- Transaction rows: round icon, merchant bold + account subline in gray, category middle column, right-aligned amount, chevron.
- Bar charts: rounded bars, prior periods pale blue `#BFE7F2`, current period solid turquoise.

---

## 2. Hardcoded persona data (drives every screen)

Anna Avalos, Boston. Checking (SoFi) $3,240. Savings (SoFi) $8,900 — includes **Lisbon vault: $1,150**. Points: 48,000 Chase UR, 22,000 Amex MR.

**Cards (always ranked with reasons — this 5-card set appears on every answer screen):**
| Card | Balance / Limit | Key rule for demo |
|---|---|---|
| SoFi Unlimited 2% | $340 / $10,000 | Flat 2% baseline, her default card |
| Amex Gold | $290 / (charge) | 4x dining; **$10 monthly dining credit unused** |
| Citi Custom Cash | $210 / $3,000 | 5% top category — **$487 of $500 monthly cap used** (dining) |
| Chase Sapphire Preferred | $620 / $12,000 | 3x dining, 2x travel, trip protection, UR transfer partners |
| Chase Freedom Unlimited | $1,220 / $4,000 | 1.5%; low limit — a $140 purchase puts it at **34% utilization** |

**Spending baselines (current month vs usual):** Dining **$410 of $550 usual, 12 days left in month**. Groceries $310/$480. Transport $95/$160. Shopping $215/$250 — includes two apparel buys this quarter ($95 sneakers, $120 boots). Entertainment $60/$120. Subscriptions $85/$85. Rent $1,850 on the 1st. Biweekly paycheck $2,610.

**Goal (NOT pre-added — the user adds it live during the demo):** "Lisbon trip — $2,400 by [10 weeks from today]", vault already at $1,150, suggested contribution $125/week.

### Financial profile (posture, not mechanics)

Every persona carries a `FinancialProfile`. It is **engine input, never classifier input** — the Worker still emits classification only (`intent`, `size`, `category`, `recurring`) and still never selects cards or does arithmetic. All five effects below are deterministic TypeScript in the engine and scorer.

```ts
export type PaymentHabit = 'pays_in_full' | 'revolves';

export interface FinancialProfile {
  employmentType: 'w2' | 'variable';
  payCadence: 'biweekly' | 'semimonthly' | 'monthly';
  netPerCheck: number;            // the only paycheck figure — no cadence or amount literals downstream
  annualIncome: number;
  paymentHabit: PaymentHabit;     // the one user-editable field
  creditEvent: { label: string; monthsAway: number } | null;
  priority: 'points' | 'cash_back' | 'simplicity' | 'lowest_cost';
  memberSince: string;            // display only, e.g. "2021"
}
```

| | Anna Avalos | Ash | Guru |
|---|---|---|---|
| employmentType | `w2` | `w2` | `w2` |
| payCadence | `biweekly` | `biweekly` | `semimonthly` |
| netPerCheck | $2,610 | $1,510 | $4,180 |
| annualIncome | $92,000 | $52,000 | $168,000 |
| paymentHabit | **`pays_in_full`** | **`revolves`** | `pays_in_full` |
| creditEvent | none | Apartment lease application, 2 months | Mortgage refinance, 5 months |
| priority | `points` | `lowest_cost` | `cash_back` |
| memberSince | 2021 | 2025 | 2019 |

Ash's values are deliberate: they already carry a balance on a near-limit card, so `revolves` plus a lease application two months out makes their answers read completely differently from Anna's on the same query. Anna ships as `pays_in_full` and stays there unless a user flips the toggle live.

**The five effects.**

1. **`paymentHabit === 'revolves'` flips the ranking objective** from rewards-maximizing to cost-minimizing. Each card's projected one-month interest on the purchase amount at its APR is subtracted from its rewards value; ranking is by net value, then APR ascending. Any row whose projected interest exceeds its rewards value carries an explicit reason ("…costs more in interest than it earns back"). `carrying_cost` also fires whenever the ranked winner would still leave a carried balance. Cards with no revolving line (charge cards) and cards whose APR the data leaves unknown model zero interest — an APR is never invented.
2. **`creditEvent` within 6 months tightens and promotes utilization.** The `utilization_watch` threshold drops 30% → 20%, its score is multiplied by 1.75 so it surfaces near the top of the deal, and its copy names the event and its timing. A boosted card also widens its own group cap by one, so the promotion *adds* the gauge rather than evicting `card_ranking`. Beyond 6 months, no effect.
3. **`priority` breaks ties only.** When the top two ranked cards are within 5% of each other in value, `priority` picks the winner; it never overrides a material difference. An *exact* tie keeps the structural rule (travel prefers trip protection, otherwise the flat house card wins) so existing answers are untouched. The tie-break is logged to the console in demo mode.
4. **`employmentType === 'variable'` widens the safety buffer.** Cushion and allowance math require 1.5× the normal buffer before a verdict can land on `fine`. No persona uses this today; it is implemented so the field is not decorative.
5. **`payCadence` + `netPerCheck` drive payday math.** `payday_proximity`, the runway, the projected payday series and monthly-income figures all read these — no cadence literal survives in the engine.

The demo-mode score table carries a `profileEffects` row listing which of the five applied to the current answer.

---

## 3. Screens

### S0 — Home (clone of SoFi "My financial insights", plus one new card)
Recreate the Relay/Coach Insights layout faithfully: headline "My financial insights" with Add/Search/Manage teal circles at right; two-column card area — left card "Net worth" (hero number with raised cents, small line chart, 3M/6M/YTD/1Y/ALL toggle, then rows: Cash · 2, Credit cards · 5, Investments · 1 with amounts); right card "Spending" (hero number, 4-month rounded bar chart May–Aug with current month solid teal, then 4 transaction rows, "View all transactions" teal link). Populate with Anna's numbers (positive net worth ≈ $18,400; spending this month ≈ $2,340).

**The one addition:** a full-width card ABOVE the two columns — this is the new product. Title: "About to buy something?" Subtitle: "Check it before you swipe." One large input field with placeholder `Try "$60 dinner" or "$1,200 flight to Lisbon in March"`. Below it, three suggestion chips: `$60 dinner` · `$140 running shoes` · `$1,200 flight to Lisbon in March`. Small "Goals" teal text link in the card's top-right corner → S4. After a goal exists, a purple pill appears next to that link: `✦ Lisbon · $1,150 of $2,400`.

### Query handling (prototype logic — no API)
Chips map directly to their mode. Typed free text: extract a $ amount with regex; keyword-match category (dinner/coffee/lunch/uber → mode 1 categories; shoes/monitor/tickets/clothes → mode 2; flight/trip/laptop/move → mode 3). Size fallback: &lt;$100 → mode 1, $100–$500 → mode 2, &gt;$500 → mode 3. On submit: input morphs into a shimmer/skeleton for ~600ms with the text "Reading your accounts…", then the answer screen animates in, replacing the two-column area (nav and input card stay). A back arrow "← Insights" returns to S0.

### S1 — Quick check (small &amp; frequent) — triggered by "$60 dinner"
Compact, widget-dense, single column max-width ~640px:
1. **Verdict banner** (turquoise tint): "**Fine.** Dining has room this month." Right side: `$60` in hero numerals.
2. **Best card row:** Amex Gold logo/name, "4x points ≈ $4.80 back — and it clears your unused **$10 dining credit**. +$3.60 vs your SoFi 2%." Small "See all cards" expander → shows the 5-card ranking (see shared component).
3. **Category pulse:** horizontal bar — dining $410 of $550, this $60 marked as a hatched segment landing at $470; caption "12 days left · pace says you finish ≈ $585, about $35 over usual."
4. **One consequence line** (slate, single sentence): "Say yes and dining runs about $35 hot this month — nothing else moves."
**Goal-aware variant (after Lisbon goal exists):** verdict flips to **Tight** (gold/salmon tint): "Doable — but it's Lisbon money now." Added purple chip row: "✦ This pushes Lisbon back ~2 days. Skip one dinner this week to stay on pace." This flip is the single most important interaction in the prototype — it must work.

### S2 — Considered (medium) — triggered by "$140 running shoes"
Two-column answer (stacks on mobile):
**Left column:**
1. Verdict banner (turquoise tint): "**Fine, with a caveat.** $612 of discretionary room left before your next paycheck (Fri) after rent and subscriptions."
2. **Card ranking — full component, all 5 cards** (see §4). Winner: SoFi 2% ($2.80 back). Badges: Citi Custom Cash grayed with gold badge "5% cap reached — $13 of $500 left"; Freedom Unlimited with salmon badge "Would hit 34% utilization — pay before statement close (the 12th)".
3. **Benefits check row:** icons + text — "Purchase protection: 120 days (Amex Gold) · Return protection: 90 days (Amex Gold) · No extended-warranty relevance."
**Right column:**
4. **Impulse panel** (card, neutral): "3rd apparel purchase this quarter ($95 sneakers, $120 boots)." Cost-per-use line: "Your boots have worked out to ≈ $8/wear so far. At that rate these are fine; at 3 wears they're $47/wear."
5. **Hold button:** outlined turquoise button "Hold it for 24 hours — I'll re-ask you tomorrow." On tap: card flips to a held state: "Held. Ask me tomorrow." with a small dashed demo control beneath: `⏭ demo: skip to tomorrow`. Tapping that shows the re-ask card: "Still want the $140 running shoes? Nothing about the answer changed — still fine, SoFi 2% still the card." Buttons: "Buy it" / "Let it go" (Let it go → confetti-free, quiet toast: "Saved $140. Lisbon says thanks." if goal exists, else "Saved $140.").
6. One consequence line: "This is a want, not a leak — your shopping category is under usual even with it."

### S3 — Plan (large) — triggered by "$1,200 flight to Lisbon in March"
Full-width answer, planning tone, no verdict banner. Header: "**Not today — but here's the path.**" with `$1,200` hero.
1. **Timeline strip** (horizontal, turquoise progress): today → paydays marked biweekly → "Affordable in full: ~Apr 18" flag. Second flag in purple: "By Mar 27 if you redirect $180/mo from dining + entertainment."
2. **Two path cards side by side:** "Save on pace" ($125/wk from checking, arrives mid-April, $0 interest, no changes) vs "Tighten &amp; make March" (dining to $460 + entertainment to $80 = $180/mo redirected). Each with a one-line honest tradeoff.
3. **Points &amp; credits offset card** (gold accents): "48,000 Chase UR → transfer to Iberia ≈ covers a $530 leg. Amex $10 dining credits ×2 remaining this quarter. **Real out-of-pocket: ≈ $670**, which moves 'affordable in full' to ~Mar 21."
4. **Card for the purchase itself:** Sapphire Preferred — 2x travel + trip delay/cancellation protection; one line why not the 2% card for this one.
5. **CTA (purple, prominent):** "Track Lisbon as a goal" → saves goal, toast "Lisbon is now a tracked goal — small purchases will check against it.", auto-return to S0 where the purple goal pill is now visible in the input card.

### S4 — Goals
Simple screen in the same card language. Header "Goals". If empty: illustration-free empty state, "Nothing tracked yet," plus a one-tap suggested goal card: "✦ Lisbon trip — $2,400 by [date], $1,150 already in your vault. Track it." Add-goal form: name, target $, target date, optional monthly contribution — teal "Track goal" button. Existing goals render as purple-accented cards with progress bar (vault $1,150 of $2,400), pace line, and "on track / behind" tag. Deleting a goal reverts S1 to its no-goal verdict.

---

### S5 — Financial profile (`/profile`)
Reached from the Coach Insights sub-navigation next to Goals. Headline: **"Your financial picture"**. Two zones on one page with different edit permissions.

**Zone A — Financial profile.** A single white card, 16px radius, soft shadow, pre-filled from the persona and read-only but for one control. One line of slate body copy explains that SoFi it reads this context on every answer. Rows, label left in slate, value right in near-black: Income (annual in hero numerals, cadence and per-check as a subline — "$92,000 · biweekly, $2,610 per check"); Employment ("W2, steady" / "Variable"); Credit posture (total balances over total limits as a percentage, with the shared utilization bar, plus a purple-free informational chip naming the credit event and its timing when one is set); What you optimize for (the `priority` as a readable phrase); SoFi member since.

**The one editable control:** a two-state segmented toggle, "I pay in full each month" / "I carry a balance", turquoise for the active state. It writes to the store, persists to localStorage alongside the profile selection (keyed per persona), and re-derives any answer on screen. Beneath it, one slate line states plainly what changes — carrying a balance makes interest cost outweigh rewards, so SoFi it ranks by what a purchase costs rather than what it earns.

**Zone B — Goals.** Renders the same goals component as S4 (same purple treatment, same add/save flow, unchanged behavior) — not a fork. Zone A reads as context the product already has; Zone B reads as the thing the user authors. Goals stay purple, verdicts stay turquoise/gold/red; the two are never crossed. S4 remains routable.

**Answer screen footnote.** At the foot of every answer, one slate line — "Based on your accounts, spending, and financial profile" — with "financial profile" a turquoise link to `/profile`. Not a card: no layout change and no effect on the 7-card cap.

## 4. Shared components

**Card ranking (used in S1 expander, S2, S3):** vertical list, winner on top with turquoise left glow and reason line + $ back; each other card shows delta vs winner ("−$1.40 vs best") and, where relevant, a badge: gold "cap reached", salmon "utilization warning", gray "no bonus category". Card art: simple rounded rectangles in brand colors with the card name — do not use bank logos, just styled text.

**Verdict banner:** full-width tinted strip, verdict word bold first ("Fine." / "Tight." / "Over."), one clause after it, amount right-aligned in hero numerals. Never more than one sentence of judgment — the tone is one honest line, zero lectures.

**Post-purchase state footer (all three modes):** thin strip at the bottom of every answer: "If you buy: checking $3,180 · [card] balance → $X · [category] $Y of usual · Lisbon [unchanged / −2 days]" — the last segment only when a goal exists.

---

## 5. Motion
The transition from query → answer is the product's signature ("the query is the mode"): shimmer ~600ms, then the answer layout slides/fades in with slight vertical stagger per card. Verdict banner tint animates in last. Keep everything else calm — no bouncing, no confetti. Mode-to-home back-navigation is instant.

## 6. What NOT to do
- No tabs, no mode switcher, no settings — the typed query is the only mode selector.
- No lecturing copy ("you should consider…"), no emoji in verdicts, no generic fintech gradients.
- Don't invent extra accounts, cards, or categories beyond the data above.
- Don't show the -$2,674 net worth from any reference material — Anna's numbers only.
