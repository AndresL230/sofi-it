import { buildUser } from './plaidAdapter'
import { PROFILES, DEFAULT_PROFILE_ID, profileById } from './profiles'
export { buildUser } from './plaidAdapter'
export { SERVICE_CATALOG } from './subscriptions'
export { REDIRECT_PLAN } from './baselines'
export { PROFILES, DEFAULT_PROFILE_ID, profileById }
/** Built once at module load, relative to Date.now() (arch spec). Screens should prefer useUser() so profile switches re-derive without a reload. */
export const NOW = new Date()
export const USER = buildUser(NOW)
