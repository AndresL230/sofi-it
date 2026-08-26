import type { ProfileSpec } from '../spec'

/**
 * Profile 3 — Priya Nair, Seattle. High income, cash-rich, a dozen subscriptions that keep creeping; big purchases
 * clear, small ones are guilt-free. Plain data (no app imports) so scripts/gen-data.mjs can load it; the flat
 * house card is renamed from BRAND.flatCard in ./priya.ts.
 */
export const priyaSpec: ProfileSpec = {
  id: 'priya',
  persona: { firstName: 'Priya', lastName: 'Nair', city: 'Seattle', initials: 'PN' },
  blurb: 'Seattle · high income, twelve subscriptions, cash-rich and about to overpay for a trip.',
  starters: ['$8 oat latte', '$1,200 flight to Tokyo in May', '$15/mo Crunchyroll', '$180 concert tickets'],
  accounts: { checking: 7850, savings: 22400, vaults: [{ name: 'Tokyo', balance: 3100 }, { name: 'House', balance: 15000 }], brokerage: 41200, masks: { checking: '1180', savings: '6642', brokerage: '0937' } },
  payroll: { amount: 4420, daysUntilNext: 3, intervalDays: 14, employer: 'Cascade Cloud' },
  rent: { amount: 2650, dayOfMonth: 1, landlord: 'Pike Place Lofts' },
  cash: { bufferFloor: 800, cushion: 400 },
  allowance: { monthly: 400, spent: 90 },
  points: [
    { program: 'UR', balance: 112000, label: 'Chase UR', transferPartner: 'ANA', transferValueCents: 1.4 },
    { program: 'MR', balance: 61000, label: 'Amex MR', transferPartner: 'ANA', transferValueCents: 1.0 },
  ],
  loan: { apr: 0.0899, termMonths: 12 },
  priorTrip: { flight: 640, around: { stay: 980, food: 560, local: 360 }, label: 'Lisbon', monthsAgo: 3, foodMerchants: ['Cervejaria Ramiro', 'Time Out Market', 'A Cevicheria', 'Manteigaria'], localMerchants: ['Metro Lisboa', 'Bolt', 'Uber'] },
  baselines: { dining: { usual: 950, runRate: 880 }, groceries: { usual: 520, runRate: 480 }, transport: { usual: 220, runRate: 200 }, shopping: { usual: 600, runRate: 540 }, entertainment: { usual: 260, runRate: 300 }, housing: { usual: 2650, runRate: 2650 }, travel: { usual: 400, runRate: 0 }, other: { usual: 300, runRate: 280 } },
  subscriptions: [
    { name: 'Netflix', price: 22.99, priceYearAgo: 19.99, raisedAtMonth: 2, kind: 'streaming', covers: ['streaming', 'anime', 'films', 'tv'] },
    { name: 'Hulu', price: 17.99, priceYearAgo: 14.99, raisedAtMonth: 5, kind: 'streaming', covers: ['streaming', 'anime', 'tv'] },
    { name: 'Disney+', price: 13.99, priceYearAgo: 13.99, raisedAtMonth: null, kind: 'streaming', covers: ['streaming', 'films', 'tv'] },
    { name: 'Max', price: 16.99, priceYearAgo: 15.99, raisedAtMonth: 9, kind: 'streaming', covers: ['streaming', 'films', 'tv'] },
    { name: 'Spotify', price: 11.99, priceYearAgo: 10.99, raisedAtMonth: 7, kind: 'music', covers: ['music', 'podcasts'] },
    { name: 'NYT', price: 25.0, priceYearAgo: 17.0, raisedAtMonth: 3, kind: 'news', covers: ['news', 'games'] },
    { name: 'WSJ', price: 38.99, priceYearAgo: 38.99, raisedAtMonth: null, kind: 'news', covers: ['news'] },
    { name: 'Peloton', price: 44.0, priceYearAgo: 44.0, raisedAtMonth: null, kind: 'fitness', covers: ['fitness'] },
    { name: 'iCloud+', price: 9.99, priceYearAgo: 9.99, raisedAtMonth: null, kind: 'storage', covers: ['storage'] },
    { name: 'ClassPass', price: 49.0, priceYearAgo: 49.0, raisedAtMonth: null, kind: 'fitness', covers: ['fitness'] },
    { name: 'Audible', price: 14.95, priceYearAgo: 14.95, raisedAtMonth: null, kind: 'other', covers: ['audiobooks'] },
  ],
  cards: [
    { id: 'sofi2', name: 'SoFi Unlimited 2%', artLabel: '2% EVERYTHING', last4: '1180', art: ['#00A2C7', '#00708A'], balance: 1120, limit: 15000, apr: null, program: 'cash', pointValueCents: 1, base: 2, bonus: {}, credits: [], benefits: { purchaseProtectionDays: 90 }, statementCloseDay: 20, isFlatHouseCard: true },
    { id: 'amexgold', name: 'Amex Gold', artLabel: 'GOLD', last4: '4471', art: ['#E3BE5F', '#A7802B'], balance: 860, limit: null, apr: null, program: 'MR', pointValueCents: 2, base: 1, bonus: { dining: 4 }, credits: [{ label: 'Amex dining credit', amount: 10, category: 'dining', expiresInDays: 6, perMonth: true }], benefits: { purchaseProtectionDays: 120, returnProtectionDays: 90, extendedWarrantyYears: 1 }, statementCloseDay: 3 },
    { id: 'csp', name: 'Chase Sapphire Preferred', artLabel: 'SAPPHIRE', last4: '7725', art: ['#2C2F6E', '#201747'], balance: 1540, limit: 20000, apr: null, program: 'UR', pointValueCents: 1, base: 1, bonus: { dining: 3, travel: 2 }, credits: [{ label: 'CSP hotel credit', amount: 50, category: 'travel', expiresInDays: 118 }], benefits: { tripProtection: true, purchaseProtectionDays: 120, extendedWarrantyYears: 1, transferPartners: true }, statementCloseDay: 8 },
    { id: 'citicc', name: 'Citi Custom Cash', artLabel: 'CUSTOM CASH', last4: '0248', art: ['#9A9DA3', '#5E6166'], balance: 95, limit: 5000, apr: null, program: 'cash', pointValueCents: 1, base: 1, bonus: {}, cap: { category: 'dining', monthlyCap: 500, used: 60, rate: 5 }, credits: [], benefits: {}, statementCloseDay: 25 },
    { id: 'cfu', name: 'Chase Freedom Unlimited', artLabel: 'FREEDOM', last4: '9913', art: ['#4E6E8E', '#2E4258'], balance: 310, limit: 8000, apr: 0.2424, program: 'cash', pointValueCents: 1, base: 1.5, bonus: {}, credits: [], benefits: { purchaseProtectionDays: 120, extendedWarrantyYears: 1 }, statementCloseDay: 12 },
  ],
  habits: {
    coffee: { merchant: 'Blue Bottle Coffee', visitsPerMonth: 9, ticket: [6.2, 8.4] },
    lunch: { merchant: 'Sweetgreen', visitsPerMonth: 8, ticket: [14, 17] },
    apparel: [{ merchant: 'Nordstrom', amount: 240, daysAgo: 21, tags: [] }, { merchant: 'Lululemon', amount: 128, daysAgo: 50, tags: [] }],
    entertainment: [{ merchant: 'Ticketmaster', amount: 210, daysAgo: 35, tags: [] }, { merchant: 'Seattle Symphony', amount: 95, daysAgo: 12, tags: [] }],
  },
  redirectPlan: [{ category: 'dining', to: 780 }, { category: 'entertainment', to: 180 }],
  goals: [{ name: 'House down payment', emoji: '🏠', target: 60000, vaultName: 'House', weekly: 400, weeksOut: 110 }, { name: 'New bike', emoji: '🚲', target: 1800, saved: 640, weekly: 60, weeksOut: 20 }],
  goalTemplate: { name: 'Tokyo trip', emoji: '✈', target: 4500, vaultName: 'Tokyo', weekly: 150, weeksOut: 14 },
  netWorthDelta6m: 4200,
  seed: 11,
  merchants: {
    dining: ['Din Tai Fung', 'Tamarind Tree', 'Salumi', 'Piroshky Piroshky', 'Homegrown', "Musashi's", 'Un Bien', 'Paseo', 'Ba Bar', 'Pike Place Chowder', "Molly Moon's", 'Storyville Coffee', 'Kedai Makan', 'Le Panier'],
    groceries: ['PCC Community Markets', 'Whole Foods', "Trader Joe's", 'Uwajimaya', 'Metropolitan Market', 'QFC'],
    transport: ['Uber', 'Lyft', 'ORCA', 'Lime', 'Shell', 'Washington State Ferries', 'Diamond Parking'],
    shopping: ['Amazon', 'Nordstrom', 'REI', 'Uniqlo', 'Sephora', 'Target', 'Glossier', 'Elliott Bay Book Co'],
    entertainment: ['SIFF Cinema', 'Seattle Symphony', 'Ticketmaster', 'Steam', 'MoPOP', 'Neumos', 'Seattle Art Museum', 'AMC Theatres'],
    other: ['Bartell Drugs', 'CVS', 'USPS', 'Etsy', 'Petco', 'Mud Bay'],
  },
}
