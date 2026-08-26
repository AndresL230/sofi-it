import type { Profile } from '@/types'
import { buildUser } from '../plaidAdapter'
import { withBrand } from './withBrand'
import { devonSpec as data } from './devon.spec.ts'

/** Profile 2 — Devon Reyes, Austin. Numbers live in ./devon.spec.ts; history in ./devon.transactions.csv. */
export const devonSpec = withBrand(data)

export const devon: Profile = { id: devonSpec.id, name: 'Devon Reyes', blurb: devonSpec.blurb, initials: devonSpec.persona.initials, starters: devonSpec.starters, build: (now) => buildUser(devonSpec, now) }
