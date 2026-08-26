/**
 * Single source of truth for brand naming. Flip this one object to rename the demo
 * (e.g. for a public post outside the externship context) — no JSX find-and-replace.
 */
export const BRAND = {
  /** Wordmark shown in the nav. */
  wordmark: 'SoFi',
  /** Product name used in copy and the document title. */
  product: 'Purchase Coach',
  /** Nav section that is active. */
  navSection: 'Coach Insights',
  /** The user's flat-rate house card. */
  flatCard: 'SoFi Unlimited 2%',
  flatCardShort: 'SoFi 2%',
  /** Personal loan product name used by payment_fork. */
  loan: 'SoFi loan',
  /** Premium pill in the nav. */
  plusPill: 'Get ✦ Plus',
  /** Persona initials for the avatar. */
  avatarInitials: 'MC',
  /** Where the app is publicly served (the /qr page encodes this). Override with VITE_PUBLIC_URL. */
  publicUrl: import.meta.env.VITE_PUBLIC_URL ?? 'https://meridian.andresl.dev',
} as const
