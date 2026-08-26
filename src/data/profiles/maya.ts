import type { Profile } from '@/types'
import { buildUser } from '../plaidAdapter'

/** Profile 1 — Maya Chen, Boston (MASTER spec §2). The other two profiles come from ADDENDUM-profiles-demo-controls.md. */
export const maya: Profile = {
  id: 'maya',
  name: 'Maya Chen',
  blurb: 'Boston · biweekly paycheck, five cards, a Lisbon vault she hasn\'t made a goal yet.',
  initials: 'MC',
  build: (now) => buildUser(now),
  starters: ['$60 dinner', '$140 running shoes', '$1,200 flight to Lisbon in March'],
}
