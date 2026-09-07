'use client';

import { useState } from 'react';
import type { NewsletterSubscriptionSummary } from '@sportbrain/contracts';
import { clientEnv } from '@/lib/env';

/** Static for V1 — see the API task's note that a static sport list is fine until Phase C's sport list is easily reachable from here. */
const SPORTS: { slug: string; label: string }[] = [
  { slug: 'football', label: 'Football' },
  { slug: 'cricket', label: 'Cricket' },
  { slug: 'basketball', label: 'Basketball' },
  { slug: 'tennis', label: 'Tennis' },
  { slug: 'formula-1', label: 'Formula 1' },
  { slug: 'golf', label: 'Golf' },
  { slug: 'mma', label: 'MMA' },
  { slug: 'boxing', label: 'Boxing' },
];

interface MondayBriefSectionProps {
  /** Null when the account has never subscribed (or the initial fetch failed). */
  initial: NewsletterSubscriptionSummary | null;
}

/**
 * "The Monday Brief" block on `/profile/preferences`: subscribe status plus,
 * once subscribed, which sports to prioritise in the send.
 *
 * All calls go to `me/newsletter/*` (session-cookie authenticated, via
 * `credentials: 'include'`), never the public `/newsletter/*` endpoints —
 * this is the one place in the app where subscribing links to the signed-in
 * account, by design (see `NewsletterMeController`'s file header).
 */
export function MondayBriefSection({ initial }: MondayBriefSectionProps) {
  const [subscription, setSubscription] = useState(initial);
  const [sports, setSports] = useState<string[]>(initial?.preferences?.sports ?? []);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const apiUrl = clientEnv.NEXT_PUBLIC_API_URL;
  const isSubscribed = subscription?.status === 'SUBSCRIBED';
  const isPending = subscription?.status === 'PENDING';

  async function subscribe() {
    setStatus('saving');
    try {
      const response = await fetch(new URL('/v1/me/newsletter/subscribe', apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        setStatus('error');
        return;
      }
      const refreshed = await fetch(new URL('/v1/me/newsletter', apiUrl), {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (refreshed.ok) setSubscription(await refreshed.json());
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  async function unsubscribe() {
    setStatus('saving');
    try {
      const response = await fetch(new URL('/v1/me/newsletter/unsubscribe', apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      setStatus(response.ok ? 'saved' : 'error');
      if (response.ok && subscription) {
        setSubscription({ ...subscription, status: 'UNSUBSCRIBED' });
      }
    } catch {
      setStatus('error');
    }
  }

  function toggleSport(slug: string) {
    setSports((current) =>
      current.includes(slug) ? current.filter((value) => value !== slug) : [...current, slug],
    );
  }

  async function savePreferences() {
    setStatus('saving');
    try {
      const response = await fetch(new URL('/v1/me/newsletter/preferences', apiUrl), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ sports }),
      });
      setStatus(response.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="newsletter">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        The Monday Brief
      </h2>

      <div className="rounded-lg border border-border bg-card p-4">
        {!subscription || subscription.status === 'UNSUBSCRIBED' ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-card-foreground">
              Not subscribed. Get the week in sport every Monday.
            </p>
            <button
              type="button"
              onClick={() => void subscribe()}
              disabled={status === 'saving'}
              className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              Subscribe
            </button>
          </div>
        ) : isPending ? (
          <p className="text-sm text-card-foreground">
            Check your email to confirm your subscription.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-card-foreground">
                Subscribed since{' '}
                {new Date(subscription.subscribedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
                .
              </p>
              <button
                type="button"
                onClick={() => void unsubscribe()}
                disabled={status === 'saving'}
                className="shrink-0 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground disabled:opacity-60"
              >
                Unsubscribe
              </button>
            </div>

            {isSubscribed && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Prioritise these sports in my Monday Brief
                </p>
                <div className="flex flex-wrap gap-2">
                  {SPORTS.map((sport) => {
                    const selected = sports.includes(sport.slug);
                    return (
                      <button
                        key={sport.slug}
                        type="button"
                        onClick={() => toggleSport(sport.slug)}
                        aria-pressed={selected}
                        className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {sport.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => void savePreferences()}
                  disabled={status === 'saving'}
                  className="mt-3 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {status === 'saving' ? 'Saving…' : 'Save sport preferences'}
                </button>
              </div>
            )}
          </div>
        )}

        {status === 'saved' && <p className="mt-2 text-sm text-success">Saved.</p>}
        {status === 'error' && (
          <p className="mt-2 text-sm text-destructive">Couldn&apos;t save. Try again.</p>
        )}
      </div>
    </section>
  );
}
