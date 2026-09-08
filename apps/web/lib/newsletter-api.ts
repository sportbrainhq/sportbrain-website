'use client';

import {
  newsletterSubscriptionSummarySchema,
  type NewsletterSubscriptionSummary,
} from '@sportbrain/contracts';
import { clientEnv } from './env';

/**
 * The signed-in reader's own Monday Brief status, straight from the browser
 * with the session cookie — same `credentials: 'include'` pattern as
 * `quiz-api.ts`'s `fetchLifetimeQuizStats`. Returns null both when the
 * account has never subscribed (a valid `GET /me/newsletter` response) and
 * when the caller is signed out or the request fails, so a component using
 * this to decide "should I show a subscribe CTA" never has to distinguish
 * those cases — either way, the answer is "yes, show it".
 */
export async function fetchMyNewsletterStatus(): Promise<NewsletterSubscriptionSummary | null> {
  const response = await fetch(new URL('/v1/me/newsletter', clientEnv.NEXT_PUBLIC_API_URL), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;

  // Nest sends an empty body for a handler that returns `null` (never
  // subscribed) rather than the JSON literal `"null"` — `response.json()`
  // throws on an empty body, so it must never be called before this check.
  const text = await response.text();
  if (!text) return null;

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return null;
  }

  const parsed = newsletterSubscriptionSummarySchema.nullable().safeParse(body);
  return parsed.success ? parsed.data : null;
}
