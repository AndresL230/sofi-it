/**
 * Engine type contract. This is the ONLY engine module /src/cards may import
 * (enforced by eslint import/no-restricted-paths). Cards receive props built
 * from an EngineContext; they never touch /src/data.
 */

// ---------- Classification (what the Worker/LLM or fallback produces) ----------
export const CATEGORIES = [
  'dining', 'coffee', 'groceries', 'transport', 'shopping_apparel', 'shopping_electronics',
  'entertainment', 'travel', 'subscription', 'housing_moving', 'other',
] as const
export type Category = (typeof CATEGORIES)[number]
export type Frequency = 'routine' | 'occasional' | 'one_off' | 'recurring'
export type Size = 'small' | 'medium' | 'large'
export type ClassificationSource = 'api' | 'cache' | 'fallback' | 'chip'

export interface PurchaseClassification {
  is_purchase: true
  amount: number
  currency: 'USD'
  normalized: string
  category: Category
  frequency: Frequency
  size: Size
  merchant_guess: string | null
  confidence: number
  source: ClassificationSource
}
export interface NonPurchase { is_purchase: false; source: ClassificationSource }
export type Classification = PurchaseClassification | NonPurchase

// ---------- Engine entities (output of plaidAdapter) ----------
export type SpendCategory =
  | 'dining' | 'groceries' | 'transport' | 'shopping' | 'entertainment'
  | 'subscriptions' | 'housing' | 'travel' | 'other' | 'income' | 'transfer'

export interface Account {
  id: string
  name: string
  officialName: string
  type: 'depository' | 'credit' | 'investment'
  subtype: 'checking' | 'savings' | 'credit card' | 'brokerage'
  mask: string
  /** Positive = money you have; for credit accounts = what you owe. */
  balance: number
  limit: number | null
  /** Savings sub-buckets (SoFi vaults). */
  vaults?: { name: string; balance: number }[]
}

export interface Txn {
  id: string
  accountId: string
  date: Date
  /** Positive = outflow, negative = inflow (Plaid convention). */
  amount: number
  merchant: string
  category: SpendCategory
  /** Plaid detailed category, kept for the adapter story. */
  detailed: string
  tags?: string[]
}

export type RewardCategory = 'dining' | 'groceries' | 'travel' | 'transport' | 'entertainment' | 'shopping' | 'other'
export type PointsProgram = 'MR' | 'UR' | 'cash'

export interface CreditCardRule {
  id: string
  name: string
  /** Short label printed on the mini card art. */
  artLabel: string
  last4: string
  /** Two gradient stops for the card art (brand-palette derived). */
  art: [string, string]
  balance: number
  limit: number | null
  /** Only Freedom's APR is given in the spec; unknown APRs stay null rather than invented. */
  apr: number | null
  program: PointsProgram
  /** Cents of value per point when earning. */
  pointValueCents: number
  /** Base earn multiplier (x points or % cash back as multiplier of 1%). */
  base: number
  bonus: Partial<Record<RewardCategory, number>>
  /** 5%-style capped bonus (Citi Custom Cash). */
  cap?: { category: RewardCategory; monthlyCap: number; used: number; rate: number }
  /** Unused statement credits. */
  credits: { label: string; amount: number; category: RewardCategory; expires: Date; perMonth?: boolean }[]
  benefits: { purchaseProtectionDays?: number; returnProtectionDays?: number; extendedWarrantyYears?: number; tripProtection?: boolean; transferPartners?: boolean }
  /** Next statement close date. */
  statementClose: Date
  isFlatHouseCard?: boolean
}

export interface Baseline {
  category: SpendCategory
  label: string
  /** Typical monthly total. */
  usual: number
  /** Projected month-end at the current burn rate, before any new purchase. */
  runRate: number
  essential: boolean
}

export interface Subscription {
  name: string
  price: number
  priceYearAgo: number
  /** Month offset (0..11 from a year ago) when the price changed, null if unchanged. */
  raisedAtMonth: number | null
  kind: 'streaming' | 'music' | 'news' | 'fitness' | 'storage' | 'other'
  /** Content tags used by overlap_check. */
  covers: string[]
}

// ---------- Financial profile (posture, not mechanics — engine input, never classifier input) ----------
export type PaymentHabit = 'pays_in_full' | 'revolves'
export type PayCadence = 'biweekly' | 'semimonthly' | 'monthly'
export type MoneyPriority = 'points' | 'cash_back' | 'simplicity' | 'lowest_cost'

/**
 * What the mechanics *mean* for this person. The engine reads this on every answer; the Worker's
 * classification prompt never sees it (the model emits classification only).
 */
export interface FinancialProfile {
  employmentType: 'w2' | 'variable'
  payCadence: PayCadence
  /** Net take-home per paycheck — the single source for every paycheck figure. */
  netPerCheck: number
  annualIncome: number
  /** The one user-editable field (segmented toggle on /profile). */
  paymentHabit: PaymentHabit
  creditEvent: { label: string; monthsAway: number } | null
  priority: MoneyPriority
  /** Display only, e.g. "2021". */
  memberSince: string
}

/**
 * The five profile rules as constants, so the engine, the card metas and the /profile screen all
 * quote the same numbers. Behaviour lives in src/engine/profile.ts.
 */
/** Months within which an upcoming credit event tightens the utilization line. */
export const CREDIT_EVENT_HORIZON_MONTHS = 6
/** How hard a near credit event promotes utilization_watch in the deal. */
export const CREDIT_EVENT_BOOST = 1.75
export const UTILIZATION_LINE = { normal: 0.3, creditEvent: 0.2 } as const
/** Variable income has to clear this much more buffer before an answer can read "fine". */
export const VARIABLE_BUFFER_MULTIPLIER = 1.5
/** Two top cards inside this fraction of each other are a near-tie — and only then does `priority` decide. */
export const TIE_BAND = 0.05

export interface UserModel {
  persona: { firstName: string; lastName: string; city: string; initials: string }
  accounts: Account[]
  cards: CreditCardRule[]
  txns: Txn[]
  baselines: Record<SpendCategory, Baseline>
  subscriptions: Subscription[]
  points: { program: PointsProgram; balance: number; label: string; transferPartner: string; transferValueCents: number }[]
  payroll: { amount: number; nextPayday: Date; intervalDays: number; cadence: PayCadence }
  /** Financial posture — see FinancialProfile. Flows into EngineContext as ctx.financialProfile. */
  financialProfile: FinancialProfile
  cash: { bufferFloor: number; cushion: number }
  allowance: { monthly: number; spent: number }
  priorTrip: { flight: number; around: { stay: number; food: number; local: number }; label: string; when: Date }
  loan: { apr: number; termMonths: number }
  rent: { amount: number; dayOfMonth: number }
  netWorthHistory: { date: Date; value: number }[]
  redirectPlan: { category: SpendCategory; to: number }[]
  serviceCatalog: Record<string, string[]>
  /** The goal the app suggests for this persona (vault balance looked up by name). */
  goalTemplate: { name: string; emoji: string; target: number; vaultName: string; weekly: number; weeksOut: number }
  /** Anchor merchants for the behavior lens. */
  habits: { coffeeMerchant: string; lunchMerchant: string }
  /** Goals the persona already has in their data (shown on the Goals page; only the one the user tracks checks purchases). */
  seededGoals: Goal[]
}

// ---------- Goals ----------
export interface Goal {
  id: string
  name: string
  emoji?: string
  target: number
  saved: number
  deadline: Date
  weekly: number
  createdAt: Date
}

// ---------- Rich text: sentences with live numbers (rendered via <Money>/<Num>) ----------
export type RichPart =
  | string
  | { money: number; cents?: 'auto' | 'decimal' | 'never'; signed?: boolean; prefix?: string; suffix?: string; approx?: boolean }
  | { num: number; suffix?: string; prefix?: string; fraction?: number; signed?: boolean }
  | { date: Date; fmt?: 'md' | 'weekday' | 'weekdayLong' | 'ordinal' | 'month' }
  | { b: RichText }
  | { tone: 'salmon' | 'teal' | 'purple' | 'green' | 'gold' | 'navy' | 'red'; t: RichText }
export type RichText = RichPart[]

export type RankBadge =
  | { kind: 'cap'; left: number; cap: number; rate: number; tone: 'gold' }
  | { kind: 'utilization'; pct: number; payBy: Date; tone: 'salmon' }
  | { kind: 'noBonus'; tone: 'gray' }

// ---------- Computed context ----------
export type VerdictWord = 'Fine.' | 'Fine, with a caveat.' | 'Tight.' | 'Over.'
export type VerdictTone = 'fine' | 'tight' | 'over'
export interface Verdict { word: VerdictWord; tone: VerdictTone; clause: RichText }

export interface CategoryPace {
  category: SpendCategory
  label: string
  spent: number
  usual: number
  runRate: number
  projectedWith: number
  overshoot: number
  daysLeft: number
  daysInMonth: number
  elapsedDays: number
  /** Day-of-month at which the projection crosses usual (null if it doesn't). */
  crossesUsualOnDay: number | null
}

export interface Runway {
  checking: number
  bills: { label: string; amount: number; due: Date }[]
  essentialsRemaining: number
  bufferFloor: number
  cushion: number
  /** Discretionary room before the next paycheck after bills, essentials and the buffer. */
  room: number
  roomAfter: number
  nextPayday: Date
  daysToPayday: number
  paydayWeekday: string
  paycheck: number
}

export interface RankedCard {
  card: CreditCardRule
  /** Dollar value earned on this purchase. */
  back: number
  multiplier: number
  reason: RichText
  delta: number
  deltaLabel: RichText
  badge?: RankBadge
  disqualified: boolean
  winner: boolean
  utilizationAfter: number | null
  /** Projected one month of interest on this purchase at this card's APR (0 when the APR is unknown or it can't carry). */
  interest: number
  /** back − interest. Equals `back` for a payer-in-full; the ranking objective for a revolver. */
  netValue: number
  /** Set when this row costs more in interest than it earns back (revolver ranking only). */
  costNote?: RichText
}

export interface CardRanking {
  ranked: RankedCard[]
  winner: RankedCard
  flat: RankedCard
  deltaVsFlat: number
  /** What the ranking optimised for: rewards (pays in full) or true cost (revolves). */
  objective: 'rewards' | 'cost'
  /** Set when `priority` decided a near-tie between the top two. */
  tieBreak: { by: MoneyPriority; winner: string; runnerUp: string; gap: number } | null
}

export interface UtilizationWatch { card: CreditCardRule; before: number; after: number; threshold: number; payBy: Date; event: { label: string; monthsAway: number } | null }

export interface GoalImpact {
  goal: Goal
  daysPushed: number
  landsBefore: Date
  landsAfter: Date
  paceFix: RichText
  onTrack: boolean
  weeksLeft: number
  pctSaved: number
}

export interface Collision {
  goal: Goal
  amount: number
  /** Date the goal lands if fully protected. */
  goalProtected: Date
  /** Date the purchase is affordable if the goal is fully protected. */
  purchaseWaits: Date
  /** Goal landing date if the purchase happens now. */
  goalPushed: Date
  purchaseNow: Date
  /** Balanced default (0..1). */
  balancedT: number
  /** Function of t ∈ [0,1] → both dates. */
  at: (t: number) => { goalDate: Date; purchaseDate: Date }
  weeklyFreeCash: number
}

export interface PaymentOption { key: 'cash' | 'loan' | 'card'; label: string; total: number; monthly: number | null; note: RichText; apr: number | null; months: number | null; winner: boolean; cardName?: string }

export interface CarryingCost {
  card: CreditCardRule
  months: { label: string; date: Date; balance: number; interest: number }[]
  totalInterest: number
}

export interface Affordability {
  /** Cash available toward this purchase right now. */
  availableNow: number
  shortfall: number
  weeklyPace: number
  affordableInFull: Date
  redirectMonthly: number
  redirectSources: { label: string; from: number; to: number }[]
  accelerated: Date
  paydays: Date[]
  /** With points/credits applied. */
  outOfPocket: number
  affordableWithPoints: Date
}

export interface PointsOffset {
  rows: { label: string; value: number }[]
  outOfPocket: number
  amount: number
}

export interface EventCost {
  flight: number
  ratio: number
  stay: number
  food: number
  local: number
  allIn: number
}

export interface CreditItem { label: string; amount: number; expires: Date; daysLeft: number; cardName: string; category: RewardCategory }

export interface QueryFacts {
  amount: number
  category: Category
  spendCategory: SpendCategory
  size: Size
  frequency: Frequency
  normalized: string
  merchant: string | null
  isRestaurant: boolean
  isDiscretionary: boolean
  /** Human noun for copy without the amount, e.g. "running shoes". */
  thing: string
  serviceName: string | null
  /** groceries/housing — over-usual is not a discretionary problem. */
  spendCategoryEssentialLike: boolean
}

export interface MerchantHabit { merchant: string; visitsThisMonth: number; ytdSpend: number; ytdVisits: number; avgTicket: number }

export interface ImpulseHistory {
  weeks: number
  past: { txn: Txn; weekIndex: number }[]
  todayWeekIndex: number
  countThisQuarter: number
}

export interface DuplicateFind { prior: Txn; weeksAgo: number; label: string; thisLabel: string }

export interface SubscriptionView {
  rows: Subscription[]
  total: number
  totalYearAgo: number
  raises: { name: string; delta: number; monthIndex: number }[]
  monthly: number[]
  newTotal: number
  overlap: { mine: string[]; candidate: string; shared: string[] } | null
}

/** One of the five deterministic profile effects, recorded when it actually changed this answer. */
export type ProfileEffectKey = 'cost_ranking' | 'credit_event' | 'priority_tiebreak' | 'variable_buffer' | 'pay_cadence'
export interface ProfileEffect { key: ProfileEffectKey; label: string; detail: string }

export interface EngineContext {
  now: Date
  q: QueryFacts
  user: UserModel
  /** Financial posture for this answer (the store's live paymentHabit override is already applied). */
  financialProfile: FinancialProfile
  /** Which of the five profile effects fired — surfaced in the demo score table. */
  profileEffects: ProfileEffect[]
  verdict: Verdict
  pace: CategoryPace
  runway: Runway
  ranking: CardRanking
  utilization: UtilizationWatch | null
  goal: Goal | null
  goalImpact: GoalImpact | null
  collision: Collision | null
  affordability: Affordability
  paymentOptions: PaymentOption[]
  carrying: CarryingCost | null
  points: PointsOffset
  eventCost: EventCost | null
  credits: CreditItem[]
  merchantHabit: MerchantHabit | null
  impulse: ImpulseHistory
  duplicate: DuplicateFind | null
  subs: SubscriptionView
  allowance: { monthly: number; left: number; covers: number; remainder: number }
  consequence: RichText
  ledger: { label: string; before: number; after: number; unit?: string; goal?: boolean }[]
  goalLedger: { label: string; delta: number } | null
  netWorth: number
  costPerUse: { unit: string; anchor: { label: string; perUse: number } | null; defaultUses: number; good: number; ok: number }
  /** Per-person share at or above which split_check's pill reads "tight". */
  splitTightAt: number
  suggestedGoal: Goal
  benefits: { key: string; label: string; days: number | null; active: boolean; cardName: string }[]
}

// ---------- Card system ----------
export const CARD_TYPES = [
  'verdict_banner', 'plan_header', 'green_light', 'consequence_line', 'post_purchase_footer',
  'category_pulse', 'pace_projection', 'discretionary_runway', 'carrying_cost', 'cashflow_timeline', 'payday_proximity',
  'best_card_row', 'card_ranking', 'utilization_watch', 'credit_sweep', 'credit_expiry', 'points_offset', 'benefits_check',
  'merchant_habit', 'impulse_frequency', 'cost_per_use', 'duplicate_check', 'split_check', 'hold_24h',
  'annualized', 'subscription_stack', 'overlap_check', 'price_creep',
  'goal_impact_chip', 'goal_collision', 'track_goal_cta',
  'payment_fork', 'total_cost_of_event', 'guilt_free_balance',
] as const
export type CardType = (typeof CARD_TYPES)[number]

export const INTERACTIVE_CARDS: readonly CardType[] = ['split_check', 'cost_per_use', 'goal_collision', 'hold_24h']
export const SHOWPIECE_CARDS: readonly CardType[] = ['credit_expiry', 'payday_proximity', 'price_creep', 'payment_fork', 'total_cost_of_event', 'guilt_free_balance']

export type CardSection = 'Verdict & framing' | 'Money context' | 'Cards & rewards' | 'Behavior lens' | 'Recurring' | 'Goals' | 'Large-purchase showpieces'

export interface StackEntry { type: CardType; priority: number; required?: boolean; width?: 'full' | 'half' }
export interface CardStack {
  path: string
  layout: 'quick' | 'considered' | 'plan' | 'recurring'
  cards: CardType[]
  dropped: CardType[]
}

// ---------- Profiles (ADDENDUM-profiles-demo-controls.md) ----------
export interface Profile {
  id: string
  /** Display name, e.g. "Anna Avalos". */
  name: string
  /** One-line who-this-is for the picker / share page. */
  blurb: string
  initials: string
  /** Builds the Plaid-shaped mock + adapter output for this persona relative to `now`. */
  build: (now: Date) => UserModel
  /** Starter queries shown for this profile. */
  starters: string[]
}

// ---------- Card contract (one folder per card: src/cards/<id>/{index.tsx, meta.ts, graphic.tsx?}) ----------
export type CardKind = 'core' | 'interactive' | 'showpiece'
export interface GallerySample { query: string; goal?: boolean; label?: string; override?: (p: unknown) => unknown }
/**
 * Self-description exported from each card's meta.ts. The registry is an import.meta.glob over
 * src/cards/*\/index.tsx, so adding a card touches zero shared files.
 */
export interface CardMeta {
  id: CardType
  group: CardSection
  kind: CardKind
  /** Static base priority (higher = kept first when the stack is over the cap). */
  priority: number
  /** Data condition — false ⇒ the card silently doesn't render. */
  condition: (ctx: EngineContext) => boolean
  /** 0..1 — how much this card matters for THIS purchase; the composer sorts by relevance × priority. */
  relevance: (ctx: EngineContext) => number
  /**
   * Profile-driven multiplier (default 1). >1 raises the card's score AND its position in the deal, and
   * widens its group cap by one so a promoted card adds to the answer instead of evicting its neighbour.
   */
  boost?: (ctx: EngineContext) => number
  /** Framing cards that must sit first/last and are never dropped (verdict/plan header, consequence, footer). */
  anchor?: 'first' | 'last'
  /** Layout hints. */
  span?: 'full' | 'auto'
  column?: 'left' | 'right'
  bare?: boolean
  /** Gallery samples (which matrix query / goal state to build props from). */
  samples: GallerySample[]
  label?: string
}
/** Every card component receives engine-computed props plus app actions. */
export type CardProps<T> = T & { actions: CardActions }
export interface CardActions {
  toast: (msg: string) => void
  goHome: () => void
  trackGoal: (g: Goal) => void
  remindLater: (when: string) => void
}
