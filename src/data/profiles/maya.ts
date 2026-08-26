import type { Profile } from '@/types'
import { buildUser } from '../plaidAdapter'
import { withBrand } from './withBrand'
import { mayaSpec as data } from './maya.spec.ts'

/** Profile 1 — Anna Avalos, Boston. Numbers live in ./maya.spec.ts; history in ./maya.transactions.csv. */
export const mayaSpec = withBrand(data)

export const maya: Profile = { id: mayaSpec.id, name: 'Anna Avalos', blurb: mayaSpec.blurb, initials: mayaSpec.persona.initials, starters: mayaSpec.starters, build: (now) => buildUser(mayaSpec, now) }
