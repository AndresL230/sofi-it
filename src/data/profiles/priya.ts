import type { Profile } from '@/types'
import { buildUser } from '../plaidAdapter'
import { withBrand } from './withBrand'
import { priyaSpec as data } from './priya.spec.ts'

/** Profile 3 — Priya Nair, Seattle. Numbers live in ./priya.spec.ts; history in ./priya.transactions.csv. */
export const priyaSpec = withBrand(data)

export const priya: Profile = { id: priyaSpec.id, name: 'Priya Nair', blurb: priyaSpec.blurb, initials: priyaSpec.persona.initials, starters: priyaSpec.starters, build: (now) => buildUser(priyaSpec, now) }
