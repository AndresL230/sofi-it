/**
 * Single source of truth for brand naming. Flip this one object to rename the demo
 * (e.g. for a public post outside the externship context) — no JSX find-and-replace.
 */
export const BRAND = {
  /** Wordmark. Now only the accessible name for the logo image + copy fallback. */
  wordmark: 'SoFi',
  /** Logo lockup shown in the nav and on the share card. Lives in public/, served from root. */
  logoSrc: '/sofi-logo.svg',
  /** Product name used in copy and the document title. */
  product: 'Purchase Coach',
  /** Nav section that is active. */
  navSection: 'Coach Insights',
  /** The user's flat-rate house card. */
  flatCard: 'SoFi Unlimited 2%',
  flatCardShort: 'SoFi 2%',
  /** Personal loan product name used by payment_fork. */
  loan: 'SoFi loan',
  /** Primary call to action on the coach input. */
  checkCta: 'SoFi It',
  /** Premium pill in the nav. */
  plusPill: 'Get ✦ Plus',
  /** Persona initials for the avatar. */
  avatarInitials: 'AA',
  /** Where the app is publicly served (the /qr page encodes this). Override with VITE_PUBLIC_URL. */
  publicUrl: import.meta.env.VITE_PUBLIC_URL ?? 'https://meridian.andresl.dev',
} as const
