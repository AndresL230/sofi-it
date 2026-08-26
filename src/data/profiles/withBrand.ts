import type { ProfileSpec } from '../spec'
import { BRAND } from '@/brand'

/** The spec files are plain data (no app imports); the flat house card takes its name from BRAND here. */
export const withBrand = (spec: ProfileSpec): ProfileSpec => ({ ...spec, cards: spec.cards.map((c) => (c.isFlatHouseCard ? { ...c, name: BRAND.flatCard } : c)) })
