import type { ProfileSpec } from '../spec'

/**
 * Profile 2 — Devon Reyes, Austin. Paycheck-to-paycheck: thin cushion, one card near its limit, dining already
 * over pace. Verdicts skew tight. Plain data (no app imports) so scripts/gen-data.mjs can load it; the flat
 * house card is renamed from BRAND.flatCard in ./devon.ts.
 */
export const devonSpec: ProfileSpec = {
  id: 'devon',
  persona: { firstName: 'Devon', lastName: 'Reyes', city: 'Austin', initials: 'DR' },
  blurb: 'Austin · paycheck-to-paycheck renter, one card near its limit, no cushion yet.',
  starters: ['$52 team dinner', '$140 running shoes', '$450 monitor', '$12/mo Hulu'],
  accounts: { checking: 2380, savings: 1200, vaults: [{ name: 'Denver', balance: 180 }, { name: 'Emergency', balance: 900 }], brokerage: 640, masks: { checking: '3312', savings: '9081', brokerage: '5570' } },
  payroll: { amount: 1890, daysUntilNext: 3, intervalDays: 14, employer: 'Lonestar Logistics' },
  rent: { amount: 1450, dayOfMonth: 1, landlord: 'Barton Creek Apartments' },
  cash: { bufferFloor: 150, cushion: 300 },
  allowance: { monthly: 60, spent: 48 },
  points: [],
  loan: { apr: 0.1499, termMonths: 12 },
  priorTrip: { flight: 220, around: { stay: 140, food: 90, local: 60 }, label: 'Denver', monthsAgo: 5, foodMerchants: ['Snooze', 'Illegal Pete\'s', 'Voodoo Doughnut'], localMerchants: ['RTD', 'Lyft'] },
  baselines: { dining: { usual: 260, runRate: 300 }, groceries: { usual: 400, runRate: 420 }, transport: { usual: 150, runRate: 140 }, shopping: { usual: 120, runRate: 95 }, entertainment: { usual: 90, runRate: 110 }, housing: { usual: 1450, runRate: 1450 }, travel: { usual: 60, runRate: 0 }, other: { usual: 120, runRate: 130 } },
  subscriptions: [
    { name: 'Netflix', price: 15.49, priceYearAgo: 12.99, raisedAtMonth: 2, kind: 'streaming', covers: ['streaming', 'anime', 'films', 'tv'] },
    { name: 'Spotify', price: 11.99, priceYearAgo: 10.99, raisedAtMonth: 7, kind: 'music', covers: ['music', 'podcasts'] },
    { name: 'Xbox Game Pass', price: 16.99, priceYearAgo: 14.99, raisedAtMonth: 4, kind: 'other', covers: ['games'] },
    { name: 'iCloud+', price: 2.99, priceYearAgo: 2.99, raisedAtMonth: null, kind: 'storage', covers: ['storage'] },
  ],
  cards: [
    { id: 'sofi2', name: 'SoFi Unlimited 2%', artLabel: '2% EVERYTHING', last4: '3312', art: ['#00A2C7', '#00708A'], balance: 780, limit: 5000, apr: null, program: 'cash', pointValueCents: 1, base: 2, bonus: {}, credits: [], benefits: { purchaseProtectionDays: 90 }, statementCloseDay: 20, isFlatHouseCard: true },
    { id: 'cfu', name: 'Chase Freedom Unlimited', artLabel: 'FREEDOM', last4: '6604', art: ['#4E6E8E', '#2E4258'], balance: 2150, limit: 3000, apr: 0.2424, program: 'cash', pointValueCents: 1, base: 1.5, bonus: {}, credits: [], benefits: { purchaseProtectionDays: 120, extendedWarrantyYears: 1 }, statementCloseDay: 12 },
    { id: 'citicc', name: 'Citi Custom Cash', artLabel: 'CUSTOM CASH', last4: '2189', art: ['#9A9DA3', '#5E6166'], balance: 410, limit: 2000, apr: null, program: 'cash', pointValueCents: 1, base: 1, bonus: { groceries: 5 }, cap: { category: 'groceries', monthlyCap: 500, used: 120, rate: 5 }, credits: [], benefits: {}, statementCloseDay: 25 },
  ],
  habits: {
    coffee: { merchant: 'Starbucks', visitsPerMonth: 6, ticket: [4.8, 6.4] },
    lunch: { merchant: "Torchy's Tacos", visitsPerMonth: 5, ticket: [11, 14] },
    apparel: [{ merchant: 'Target', amount: 48, daysAgo: 30, tags: [] }, { merchant: 'Nike', amount: 110, daysAgo: 65, tags: ['sneakers'] }],
    entertainment: [{ merchant: 'AMC Theatres', amount: 34, daysAgo: 20, tags: [] }, { merchant: 'Ticketmaster', amount: 68, daysAgo: 55, tags: [] }],
  },
  redirectPlan: [{ category: 'dining', to: 200 }, { category: 'entertainment', to: 60 }],
  goals: [{ name: 'Emergency cushion', emoji: '🛟', target: 1500, vaultName: 'Emergency', weekly: 25, weeksOut: 24 }, { name: 'Pay down Freedom', emoji: '💳', target: 2150, saved: 0, weekly: 60, weeksOut: 36 }],
  goalTemplate: { name: 'Denver weekend', emoji: '🏔', target: 600, vaultName: 'Denver', weekly: 40, weeksOut: 8 },
  netWorthDelta6m: -310,
  seed: 7,
  merchants: {
    dining: ["P. Terry's", 'Veracruz All Natural', 'Home Slice Pizza', 'Kerbey Lane Cafe', 'Juan in a Million', 'Cuantos Tacos', 'Thai Fresh', 'Whataburger', 'Chipotle', 'Franklin Barbecue', 'Tacodeli', "Amy's Ice Creams"],
    groceries: ['H-E-B', 'Central Market', "Trader Joe's", 'Fiesta Mart', 'Costco', 'Walmart Neighborhood Market'],
    transport: ['Uber', 'Lyft', 'CapMetro', 'Shell', "Buc-ee's", 'H-E-B Fuel'],
    shopping: ['Amazon', 'Target', 'Walmart', 'Old Navy', 'Academy Sports', 'Five Below'],
    entertainment: ['Alamo Drafthouse', 'Steam', 'Mohawk Austin', 'Ticketmaster', 'Bowlero', 'Cinemark', 'Xbox Store'],
    other: ['CVS', 'Walgreens', 'USPS', 'Dollar Tree', 'Etsy', 'Petco'],
  },
}
