import type { ProfileSpec } from '../spec'
import { SUBSCRIPTIONS } from '../subscriptions.ts'

/**
 * Profile 1 — Anna Avalos, Boston (MASTER spec §2 + cards spec appendix, verbatim numbers).
 * Plain data with no app imports: scripts/gen-data.mjs loads this file with Node's native TS support
 * to write maya.transactions.csv. The flat house card is renamed from BRAND.flatCard in ./maya.ts.
 */
export const mayaSpec: ProfileSpec = {
  id: 'maya',
  persona: { firstName: 'Anna', lastName: 'Avalos', city: 'Boston', initials: 'AA' },
  blurb: 'Boston · biweekly paycheck, five cards, a Lisbon vault that is not a goal yet.',
  starters: ['$60 dinner', '$140 running shoes', '$1,200 flight to Lisbon in March', '$15/mo Crunchyroll'],
  accounts: { checking: 3240, savings: 8900, vaults: [{ name: 'Lisbon', balance: 1150 }, { name: 'Emergency', balance: 6000 }], brokerage: 8952, masks: { checking: '4021', savings: '7788', brokerage: '2201' } },
  financial: { employmentType: 'w2', payCadence: 'biweekly', netPerCheck: 2610, annualIncome: 92000, paymentHabit: 'pays_in_full', creditEvent: null, priority: 'points', memberSince: '2021' },
  payroll: { daysUntilNext: 3, employer: 'Acme Analytics' },
  rent: { amount: 1850, dayOfMonth: 1, landlord: 'Beacon Hill Realty' },
  cash: { bufferFloor: 450, cushion: 300 },
  allowance: { monthly: 150, spent: 65 },
  points: [
    { program: 'UR', balance: 48000, label: 'Chase UR', transferPartner: 'Iberia', transferValueCents: 1.104 },
    { program: 'MR', balance: 22000, label: 'Amex MR', transferPartner: 'Air France', transferValueCents: 1.0 },
  ],
  loan: { apr: 0.1099, termMonths: 12 },
  priorTrip: { flight: 380, around: { stay: 206, food: 136, local: 78 }, label: 'Montréal', monthsAgo: 4, foodMerchants: ["Schwartz's", 'Olive et Gourmando', 'Joe Beef', 'La Banquise'], localMerchants: ['STM Métro', 'Bixi', 'Uber'] },
  baselines: { dining: { usual: 550, runRate: 525 }, groceries: { usual: 480, runRate: 360 }, transport: { usual: 160, runRate: 150 }, shopping: { usual: 250, runRate: 230 }, entertainment: { usual: 120, runRate: 82 }, housing: { usual: 1850, runRate: 1850 }, travel: { usual: 120, runRate: 0 }, other: { usual: 150, runRate: 140 } },
  subscriptions: SUBSCRIPTIONS,
  cards: [
    { id: 'sofi2', name: 'SoFi Unlimited 2%', artLabel: '2% EVERYTHING', last4: '4021', art: ['#00A2C7', '#00708A'], balance: 340, limit: 10000, apr: null, program: 'cash', pointValueCents: 1, base: 2, bonus: {}, credits: [], benefits: { purchaseProtectionDays: 90 }, statementCloseDay: 20, isFlatHouseCard: true },
    { id: 'amexgold', name: 'Amex Gold', artLabel: 'GOLD', last4: '1005', art: ['#E3BE5F', '#A7802B'], balance: 290, limit: null, apr: null, program: 'MR', pointValueCents: 2, base: 1, bonus: { dining: 4 }, credits: [{ label: 'Amex dining credit', amount: 10, category: 'dining', expiresInDays: 6, perMonth: true }], benefits: { purchaseProtectionDays: 120, returnProtectionDays: 90, extendedWarrantyYears: 1 }, statementCloseDay: 3 },
    { id: 'citicc', name: 'Citi Custom Cash', artLabel: 'CUSTOM CASH', last4: '8834', art: ['#9A9DA3', '#5E6166'], balance: 210, limit: 3000, apr: null, program: 'cash', pointValueCents: 1, base: 1, bonus: {}, cap: { category: 'dining', monthlyCap: 500, used: 487, rate: 5 }, credits: [], benefits: {}, statementCloseDay: 25 },
    { id: 'csp', name: 'Chase Sapphire Preferred', artLabel: 'SAPPHIRE', last4: '5512', art: ['#2C2F6E', '#201747'], balance: 620, limit: 12000, apr: null, program: 'UR', pointValueCents: 1, base: 1, bonus: { dining: 3, travel: 2 }, credits: [{ label: 'CSP hotel credit', amount: 50, category: 'travel', expiresInDays: 118 }], benefits: { tripProtection: true, purchaseProtectionDays: 120, extendedWarrantyYears: 1, transferPartners: true }, statementCloseDay: 8 },
    { id: 'cfu', name: 'Chase Freedom Unlimited', artLabel: 'FREEDOM', last4: '7290', art: ['#4E6E8E', '#2E4258'], balance: 1220, limit: 4000, apr: 0.2424, program: 'cash', pointValueCents: 1, base: 1.5, bonus: {}, credits: [], benefits: { purchaseProtectionDays: 120, extendedWarrantyYears: 1 }, statementCloseDay: 12 },
  ],
  habits: {
    coffee: { merchant: 'Blue Bottle Coffee', visitsPerMonth: 4, ticket: [5.9, 7.1] },
    lunch: { merchant: 'Sweetgreen', visitsPerMonth: 4, ticket: [12.2, 14.4] },
    apparel: [{ merchant: 'Nike', amount: 95, daysAgo: 42, tags: ['sneakers'] }, { merchant: 'Blundstone', amount: 120, daysAgo: 70, tags: ['boots'] }],
    entertainment: [{ merchant: 'Ticketmaster', amount: 85, daysAgo: 49, tags: [] }, { merchant: 'Sunset Cinema', amount: 52, daysAgo: 22, tags: [] }],
  },
  redirectPlan: [{ category: 'dining', to: 460 }, { category: 'entertainment', to: 80 }],
  goalTemplate: { name: 'Lisbon trip', emoji: '✈', target: 2400, vaultName: 'Lisbon', weekly: 125, weeksOut: 10 },
  netWorthDelta6m: 1240,
  seed: 42,
  merchants: {
    dining: ['Toro', 'Pho Pasteur', 'Tatte Bakery', 'Mei Mei', 'Neptune Oyster', 'Dumpling House', "El Jefe's Taqueria", 'Row 34', 'Flour Bakery', 'Clover Food Lab', 'Bon Me', 'Life Alive', 'Pavement Coffeehouse', 'El Pelón Taqueria'],
    groceries: ["Trader Joe's", 'Whole Foods', 'Star Market', 'H Mart', 'Harvest Co-op', 'Stop & Shop'],
    transport: ['Uber', 'Lyft', 'MBTA', 'Bluebikes', 'Shell', 'Logan Parking'],
    shopping: ['Amazon', 'Uniqlo', 'Target', 'Sephora', 'Nike', 'Newbury Comics', 'Madewell'],
    entertainment: ['AMC Theatres', 'Sunset Cinema', 'MFA Boston', 'Ticketmaster', 'Steam', 'Coolidge Corner Theatre', 'Brattle Theatre'],
    other: ['CVS', 'USPS', 'Walgreens', 'Etsy', 'Boston Public Library', 'Bluebikes'],
  },
}
