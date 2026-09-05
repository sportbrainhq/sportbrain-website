import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { safeUserSchema, type SafeUser } from '@sportbrain/contracts';
import type { ZodSchema } from 'zod';
import { serverEnv } from './env';

/**
 * Server-side "who is signed in", for Server Components and Server Actions.
 *
 * Deliberately not routed through `apiGet`: that helper is built for public,
 * cacheable reads and never forwards cookies. A `fetch` from a Next.js
 * server context does not automatically carry the browser's cookies to a
 * different origin (the API), so this reads the incoming request's cookie
 * header explicitly and attaches it — the one cookie-forwarding case this
 * app has.
 *
 * `cache()` de-dupes this within a single request/render pass: several
 * Server Components asking "who is the user" during one page render should
 * cost one API call, not one per component.
 */
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  const { API_URL } = serverEnv();

  let response: Response;
  try {
    response = await fetch(`${API_URL}/v1/auth/me`, {
      headers: { cookie: cookieHeader, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // API unreachable: treat as signed out rather than failing the page —
    // public browsing must never break because the auth check couldn't run.
    return null;
  }

  if (!response.ok) return null;

  const parsed = safeUserSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
});

/**
 * For `/profile/*` pages: throws a redirect to the frontend home (or the
 * given path) if nobody is signed in. A per-page call rather than a
 * `middleware.ts` matcher, so gating stays visible on the page itself and
 * every other route is unaffected by construction — see Phase 10's "public
 * browsing stays public" requirement.
 */
export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/');
  return user;
}

/**
 * Authenticated GET against the API from a Server Component, for the
 * `/profile/*` pages — same cookie-forwarding need as `getCurrentUser()`,
 * generalised. Not merged into `apiGet` in `lib/api.ts`: that helper is
 * built for public, cacheable reads with no cookies in play, and every call
 * here must be `no-store` (it's always per-user data), so keeping this
 * separate avoids threading auth-only concerns through the public fetch
 * path.
 */
export async function apiGetAuthed<T>(path: string, schema: ZodSchema<T>): Promise<T | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { API_URL } = serverEnv();

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { cookie: cookieHeader, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const parsed = schema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
}
