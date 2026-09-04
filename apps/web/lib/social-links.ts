import { clientEnv } from './env';

/**
 * Social links, centralised so both /about and /contact render the same set
 * from one source. Sourced from `NEXT_PUBLIC_SOCIAL_*` — see `lib/env.ts`.
 * An empty `href` means the account doesn't exist yet; consumers render a
 * "coming soon" state for it instead of a dead link.
 */
export const SOCIAL_LINKS = [
  { name: 'Instagram', href: clientEnv.NEXT_PUBLIC_SOCIAL_INSTAGRAM },
  { name: 'X', href: clientEnv.NEXT_PUBLIC_SOCIAL_X },
  { name: 'YouTube', href: clientEnv.NEXT_PUBLIC_SOCIAL_YOUTUBE },
  { name: 'Reddit', href: clientEnv.NEXT_PUBLIC_SOCIAL_REDDIT },
] as const;
