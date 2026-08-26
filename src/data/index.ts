import { buildUser } from './plaidAdapter'
import { PROFILES, DEFAULT_PROFILE_ID, profileById } from './profiles'
export { buildUser } from './plaidAdapter'
export { SERVICE_CATALOG } from './subscriptions'
export { REDIRECT_PLAN } from './baselines'
export { PROFILES, DEFAULT_PROFILE_ID, profileById }
/**
 * "Now" for the whole app, fixed at module load (arch spec: all dates relative to Date.now()).
 * Demo/QA override: `?now=YYYY-MM-DD` (or VITE_NOW) time-travels every date, pace and payday — used by the
 * time-travel demo control and the Q4 checks. Invalid values fall back to the real clock.
 */
function resolveNow(): Date {
  const raw = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('now') : null) ?? import.meta.env.VITE_NOW ?? null
  if (raw) { const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T12:00:00` : raw); if (!Number.isNaN(d.getTime())) return d }
  return new Date()
}
export const NOW = resolveNow()
export const USER = buildUser(NOW)
