import { buildUser } from './plaidAdapter'
export { buildUser } from './plaidAdapter'
export { SERVICE_CATALOG } from './subscriptions'
export { REDIRECT_PLAN } from './baselines'
/** Built once at module load, relative to Date.now() (arch spec: "all dates generated relative to Date.now() at module load"). */
export const NOW = new Date()
export const USER = buildUser(NOW)
