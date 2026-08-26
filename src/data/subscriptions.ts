import type { Subscription } from '@/engine/types'

/**
 * Subscription rows (cards spec appendix). `priceYearAgo` + `raisedAtMonth` let price_creep
 * rebuild the 12-month series from data instead of a hand-drawn path.
 * Only the two raises the spec names are encoded; everything else held flat.
 */
export const SUBSCRIPTIONS: Subscription[] = [
  { name: 'Netflix', price: 15.49, priceYearAgo: 12.99, raisedAtMonth: 2, kind: 'streaming', covers: ['streaming', 'anime', 'films', 'tv'] },
  { name: 'Hulu', price: 7.99, priceYearAgo: 7.99, raisedAtMonth: null, kind: 'streaming', covers: ['streaming', 'anime', 'tv'] },
  { name: 'Spotify', price: 11.99, priceYearAgo: 10.99, raisedAtMonth: 7, kind: 'music', covers: ['music', 'podcasts'] },
  { name: 'iCloud+', price: 2.99, priceYearAgo: 2.99, raisedAtMonth: null, kind: 'storage', covers: ['storage'] },
  { name: 'NYT', price: 17.0, priceYearAgo: 17.0, raisedAtMonth: null, kind: 'news', covers: ['news', 'games'] },
  { name: 'ClassPass', price: 19.0, priceYearAgo: 19.0, raisedAtMonth: null, kind: 'fitness', covers: ['fitness'] },
  { name: 'Gym', price: 45.0, priceYearAgo: 45.0, raisedAtMonth: null, kind: 'fitness', covers: ['fitness'] },
]

/** What a candidate service would cover, keyed by lowercase name. Used by overlap_check. */
export const SERVICE_CATALOG: Record<string, string[]> = {
  crunchyroll: ['anime', 'streaming'],
  netflix: ['streaming', 'anime', 'films', 'tv'],
  hulu: ['streaming', 'anime', 'tv'],
  'disney+': ['streaming', 'films', 'tv'],
  disney: ['streaming', 'films', 'tv'],
  max: ['streaming', 'films', 'tv'],
  'hbo max': ['streaming', 'films', 'tv'],
  peacock: ['streaming', 'tv'],
  paramount: ['streaming', 'tv'],
  'apple tv': ['streaming', 'tv'],
  'apple music': ['music', 'podcasts'],
  spotify: ['music', 'podcasts'],
  tidal: ['music'],
  youtube: ['streaming', 'music'],
  audible: ['audiobooks'],
  kindle: ['books'],
  peloton: ['fitness'],
  strava: ['fitness'],
  dropbox: ['storage'],
  'google one': ['storage'],
  chatgpt: ['ai'],
  claude: ['ai'],
  nyt: ['news', 'games'],
  wsj: ['news'],
}
