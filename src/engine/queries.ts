/** The nine matrix queries (trigger matrix). Chips are the master-spec three plus the recurring one the export added. */
export const MATRIX_QUERIES = [
  { q: '$6 latte', path: 'latte' },
  { q: '$60 dinner', path: 'dinner' },
  { q: '$28 Uber', path: 'uber' },
  { q: '$15/mo Crunchyroll', path: 'crunchyroll' },
  { q: '$140 running shoes', path: 'shoes' },
  { q: '$450 monitor', path: 'monitor' },
  { q: '$180 concert tickets', path: 'tickets' },
  { q: '$1,200 flight to Lisbon in March', path: 'flight' },
  { q: '$2,800 to move apartments', path: 'moving' },
] as const
export const CHIPS = ['$60 dinner', '$140 running shoes', '$1,200 flight to Lisbon in March', '$15/mo Crunchyroll'] as const
/** The demo choreography. */
export const CHOREOGRAPHY = ['$6 latte', '$60 dinner', '$1,200 flight to Lisbon in March', '$60 dinner', '$2,800 to move apartments'] as const
export const NON_PURCHASE_REPLY = 'Tell me a thing and a price — like "$60 dinner".'
