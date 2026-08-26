/**
 * Per-profile transaction history served from CSV — `src/data/profiles/<id>.transactions.csv`,
 * written by `npm run gen:data` (scripts/gen-data.mjs) and committed as the served data.
 *
 * Rows carry `days_ago` instead of calendar dates, so the history is materialized relative to `now`
 * at load time and the demo stays correct in any week (arch spec: all dates relative to Date.now()).
 * Columns: days_ago,amount,merchant,account,category,detailed,tags
 *   account  stable key: checking | savings | brokerage | <cardId>
 *   category engine SpendCategory; detailed = Plaid PFC detailed; tags = `|`-joined anchor hints.
 * Calendar-anchored rows (payroll, rent, subscriptions) are NOT in the CSV — mockUser.ts generates them.
 */
import { addDays, iso, startOfDay } from '@/lib/dates'
import type { SpendCategory } from '@/types'
import type { ProfileSpec } from './spec'
import { accountIds, PFC, type PlaidTransaction } from './plaid'

export interface CsvRow { daysAgo: number; amount: number; merchant: string; account: string; category: SpendCategory; detailed: string; tags: string[] }

const FILES = import.meta.glob<string>('./profiles/*.transactions.csv', { query: '?raw', import: 'default', eager: true })

/** One CSV line → cells. Handles double-quoted cells (with `""` escapes) so merchants may contain commas. */
export function parseLine(line: string): string[] {
  const cells: string[] = []
  let cell = '', quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"') { if (line[i + 1] === '"') { cell += '"'; i++ } else quoted = false }
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { cells.push(cell); cell = '' }
    else cell += ch
  }
  cells.push(cell)
  return cells
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.length)
  const header = parseLine(lines[0] ?? '')
  const col = (name: string) => { const i = header.indexOf(name); if (i < 0) throw new Error(`csv: missing column "${name}"`); return i }
  const iDays = col('days_ago'), iAmount = col('amount'), iMerchant = col('merchant'), iAccount = col('account'), iCategory = col('category'), iDetailed = col('detailed'), iTags = col('tags')
  const rows: CsvRow[] = []
  for (let n = 1; n < lines.length; n++) {
    const c = parseLine(lines[n])
    const daysAgo = Number(c[iDays]), amount = Number(c[iAmount])
    if (!Number.isFinite(daysAgo) || !Number.isFinite(amount)) continue
    rows.push({ daysAgo, amount, merchant: c[iMerchant], account: c[iAccount], category: c[iCategory] as SpendCategory, detailed: c[iDetailed], tags: c[iTags] ? c[iTags].split('|') : [] })
  }
  return rows
}

const cache = new Map<string, CsvRow[]>()
/** Parsed rows for a profile (parsed once per session; empty when no CSV was generated for it). */
export function csvRows(profileId: string): CsvRow[] {
  let rows = cache.get(profileId)
  if (!rows) {
    const text = FILES[`./profiles/${profileId}.transactions.csv`]
    rows = text ? parseCsv(text) : []
    cache.set(profileId, rows)
  }
  return rows
}

/** Materialize a profile's CSV history as Plaid transactions dated relative to `now`. */
export function loadTransactions(spec: ProfileSpec, now: Date): PlaidTransaction[] {
  const IDS = accountIds(spec)
  const cardIds = new Set(spec.cards.map((c) => c.id))
  const accountFor = (key: string) =>
    key === 'checking' ? IDS.checking : key === 'savings' ? IDS.savings : key === 'brokerage' ? IDS.brokerage : IDS.card(cardIds.has(key) ? key : spec.cards[0].id)
  const today = startOfDay(now)
  return csvRows(spec.id).map((r, i) => {
    const date = iso(addDays(today, -r.daysAgo))
    return {
      transaction_id: `txn_c${(i + 1).toString(36).padStart(5, '0')}`, account_id: accountFor(r.account), amount: r.amount, iso_currency_code: 'USD',
      date, authorized_date: date, merchant_name: r.merchant, name: r.merchant, pending: false,
      personal_finance_category: { primary: PFC[r.category]?.primary ?? 'GENERAL_MERCHANDISE', detailed: r.detailed || PFC[r.category]?.detailed || PFC.other.detailed, confidence_level: 'VERY_HIGH' },
      _tags: r.tags.length ? r.tags : undefined,
    }
  })
}
