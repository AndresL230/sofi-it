import type { Category, Classification, Frequency, Size } from './types'

const KEYWORDS: [Category, RegExp][] = [
  ['subscription', /\b(subscription|subscribe|membership|crunchyroll|netflix|spotify|hulu|disney\+?|hbo|max|peacock|paramount|apple (tv|music)|youtube premium|audible|chatgpt|claude|patreon|nyt|wsj)\b|\/\s?mo\b|per month|monthly|a month/],
  ['coffee', /\b(latte|coffee|espresso|cappuccino|cortado|matcha|cold brew|americano|blue bottle|starbucks|dunkin|tatte)\b/],
  ['groceries', /\b(grocer(y|ies)|market|produce|trader joe'?s|whole foods|costco|wegmans|star market|h ?mart)\b/],
  ['dining', /\b(dinner|lunch|brunch|breakfast|drinks?|bar|restaurant|takeout|take-out|delivery|pizza|sushi|omakase|tacos?|burgers?|ramen|pho|wine|cocktails?|sweetgreen|chipotle|doordash|uber ?eats|grubhub|dining|meal|oysters?|steak)\b/],
  ['transport', /\b(uber|lyft|taxi|cab|ride|rideshare|transit|mbta|subway|bus|gas|fuel|parking|bluebikes?|scooter|toll|zipcar|train ticket)\b/],
  ['travel', /\b(flight|flights|airfare|plane|trip|vacation|hotel|airbnb|hostel|lisbon|paris|tokyo|resort|cruise|getaway|weekend away|amtrak|jetblue|delta|united)\b/],
  ['housing_moving', /\b(move|moving|movers|apartment|security deposit|deposit|lease|rent|u-?haul|couch|sofa|mattress|furniture|desk|dresser)\b/],
  ['shopping_electronics', /\b(monitor|laptop|macbook|headphones?|airpods|phone|iphone|pixel|tv|television|camera|keyboard|mouse|ipad|tablet|console|ps5|xbox|switch|kindle|speaker|watch|drone|gpu|pc)\b/],
  ['shopping_apparel', /\b(shoes?|sneakers?|boots?|jacket|coat|jeans|dress|clothes|clothing|shirt|hoodie|sweater|bag|purse|sunglasses|nike|uniqlo|zara|lululemon|socks|hat|scarf|running)\b/],
  ['entertainment', /\b(concert|tickets?|show|movie|cinema|theater|theatre|festival|museum|comedy|game|games|gig|club|karaoke|bowling|arcade|streaming)\b/],
]

/**
 * Amount parsing. A `$`-anchored figure wins; a bare number is only a fallback when no `$` figure
 * matches. Both forms share the same guards: no leading `-` (`$-50` is a credit, not a purchase),
 * no exponent (`$1e9` must not truncate to $1), and a bare number may not start mid-token (so the
 * `9` in `1e9` or the `1` in `alert(1)` never wins). `k` scales ×1000 (`$1.2k`). Anything above
 * MAX_AMOUNT is rejected, mirroring the Worker's sanity cap (worker/index.ts rejects > 1e7).
 */
const MAX_AMOUNT = 1_000_000
const DOLLAR_AMOUNT = /(?<!-)\$ ?(\d[\d,]*(?:\.\d+)?) ?(k\b)?(?![\d.,]*e\d)/i
const BARE_AMOUNT = /(?<![-\w.,$])(\d[\d,]*(?:\.\d+)?) ?(k\b)?(?![\d.,]*e\d)/i

function parseAmount(text: string): number {
  const m = text.match(DOLLAR_AMOUNT) ?? text.match(BARE_AMOUNT)
  if (!m) return NaN
  const n = parseFloat(m[1].replace(/,/g, ''))
  return m[2] ? n * 1000 : n
}

const ROUTINE: Category[] = ['coffee', 'transport', 'groceries']
const OCCASIONAL: Category[] = ['dining', 'entertainment']

/** Regex/keyword classifier — the whole app must work on this alone (no API). */
export function fallbackClassify(input: string): Classification {
  const text = input.trim().slice(0, 200)
  const amount = parseAmount(text)
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) return { is_purchase: false, source: 'fallback' }
  const t = text.toLowerCase()
  const recurring = /\/\s?mo\b|per month|monthly|a month|subscription|membership/.test(t)
  let category: Category = 'other'
  for (const [cat, re] of KEYWORDS) { if (re.test(t)) { category = cat; break } }
  if (recurring && category !== 'subscription' && !/\b(rent|lease)\b/.test(t)) category = 'subscription'
  const frequency: Frequency = recurring ? 'recurring' : ROUTINE.includes(category) ? 'routine' : OCCASIONAL.includes(category) ? 'occasional' : 'one_off'
  let size: Size = amount < 100 ? 'small' : amount <= 600 ? 'medium' : 'large'
  if (category === 'travel' && amount >= 250 && size !== 'large') size = 'large'
  if (category === 'housing_moving' && amount >= 300 && size === 'medium') size = 'large'
  if (recurring) size = 'small'
  const merchant = t.match(/\b(blue bottle|starbucks|sweetgreen|chipotle|trader joe'?s|whole foods|uber|lyft|nike|uniqlo|amazon|apple|ticketmaster|jetblue|airbnb|crunchyroll|netflix|spotify|hulu)\b/)?.[1] ?? null
  const normalized = text.replace(/\s+/g, ' ').trim()
  return { is_purchase: true, amount: Math.round(amount * 100) / 100, currency: 'USD', normalized, category, frequency, size, merchant_guess: merchant ? merchant.replace(/\b\w/g, (c) => c.toUpperCase()) : null, confidence: category === 'other' ? 0.4 : 0.7, source: 'fallback' }
}
