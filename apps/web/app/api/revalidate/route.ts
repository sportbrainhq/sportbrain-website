import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { serverEnv } from '@/lib/env';

/**
 * Evicts cached pages after an ingestion run.
 *
 * The cache tags were already declared on every fetch and nothing ever called
 * them, so they had no effect: a corrected figure waited out the full
 * hour-long revalidation window. That is how Atlético Madrid went on showing
 * Real Madrid's leaderboards after the rows had been deleted from the
 * database, and the only reliable fix was rebuilding the server.
 *
 * Authenticated with a shared secret, compared in constant time. An open
 * revalidation endpoint lets anyone evict the whole cache in a loop, which
 * turns every request into an origin fetch.
 *
 * ```bash
 * curl -X POST localhost:3000/api/revalidate \
 *   -H "content-type: application/json" \
 *   -H "authorization: Bearer $REVALIDATE_SECRET" \
 *   -d '{"tags":["sport:football"]}'
 * ```
 */
export async function POST(request: Request): Promise<NextResponse> {
  const { REVALIDATE_SECRET } = serverEnv();

  // Closed when unconfigured rather than open. A deployment that forgot to set
  // the secret should refuse revalidation, not accept it from anyone.
  if (!REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Revalidation is not configured' }, { status: 503 });
  }

  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!timingSafeEqual(provided, REVALIDATE_SECRET)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let tags: string[] = [];
  try {
    const body: unknown = await request.json();
    const requested = (body as { tags?: unknown } | null)?.tags;
    if (Array.isArray(requested)) {
      tags = requested.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0);
    }
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body' }, { status: 400 });
  }

  if (tags.length === 0) {
    return NextResponse.json({ error: 'Expected at least one tag' }, { status: 400 });
  }

  for (const tag of tags.slice(0, 50)) revalidateTag(tag);

  return NextResponse.json({ revalidated: tags });
}

/**
 * Compares two strings without leaking their contents through timing.
 *
 * `===` returns as soon as it finds a differing byte, which makes the secret
 * recoverable one character at a time by a caller measuring response latency.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}
