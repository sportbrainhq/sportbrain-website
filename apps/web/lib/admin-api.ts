'use client';

import { clientEnv } from '@/lib/env';

/**
 * Client-side fetch helper for `/admin/*` pages (Phase D2).
 *
 * Mirrors `preferences-form.tsx`'s established pattern for client-component
 * writes: a direct `fetch` against `NEXT_PUBLIC_API_URL` with
 * `credentials: 'include'`, since a client component cannot read the
 * server-only `API_URL`/forward the incoming request's cookie header the way
 * `apiGetAuthed` does. Not merged into `lib/api.ts`: that file is built for
 * public, cacheable server-side reads with no cookies in play at all.
 *
 * Every admin route the API returns is envelope-shaped (`{ data: ... }`, and
 * `markReady` additionally carries `validation`), so this returns the parsed
 * JSON body untyped and lets each call site pick the field it needs —
 * introducing per-endpoint Zod parsing here would duplicate
 * `@sportbrain/contracts`' schemas with none of `apiGet`'s cache-policy
 * benefit, since these calls are never cached.
 */
async function adminFetch(path: string, init: RequestInit = {}): Promise<unknown> {
  const response = await fetch(new URL(path, clientEnv.NEXT_PUBLIC_API_URL), {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...init.headers },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string; error?: { message?: string } };
      message = body.error?.message ?? body.message ?? message;
    } catch {
      // Body wasn't JSON; keep the generic message.
    }
    throw new Error(message);
  }

  return response.json();
}

export function adminGet(path: string): Promise<unknown> {
  return adminFetch(path);
}

export function adminPost(path: string, body?: unknown): Promise<unknown> {
  return adminFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

export function adminPatch(path: string, body: unknown): Promise<unknown> {
  return adminFetch(path, { method: 'PATCH', body: JSON.stringify(body) });
}
