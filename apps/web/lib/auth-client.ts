'use client';

import { logoutResponseSchema, safeUserSchema, type SafeUser } from '@sportbrain/contracts';
import { clientEnv } from './env';

/**
 * Client-side auth calls: the handful of requests a browser makes directly
 * to the API rather than through a Server Component. Every call uses
 * `credentials: 'include'` so the session cookie is sent — the API's CORS
 * config already allows this (`credentials: true`) for exactly this
 * purpose.
 *
 * Sign-in itself is not a call here: `/auth/google` is a full-page redirect
 * (`<a href>`, not `fetch`), since a `fetch` cannot navigate the browser to
 * Google and back.
 */

/** Builds the sign-in URL. `next` should be the current path, so login returns the user where they were. */
export function googleSignInUrl(next?: string): string {
  const url = new URL('/v1/auth/google', clientEnv.NEXT_PUBLIC_API_URL);
  if (next) url.searchParams.set('next', next);
  return url.toString();
}

export async function logout(): Promise<void> {
  const response = await fetch(new URL('/v1/auth/logout', clientEnv.NEXT_PUBLIC_API_URL), {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return;
  logoutResponseSchema.safeParse(await response.json());
}

/** Re-fetches the current user client-side, e.g. right after the OAuth redirect lands back on the site. */
export async function fetchCurrentUserClient(): Promise<SafeUser | null> {
  const response = await fetch(new URL('/v1/auth/me', clientEnv.NEXT_PUBLIC_API_URL), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;
  const parsed = safeUserSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
}
