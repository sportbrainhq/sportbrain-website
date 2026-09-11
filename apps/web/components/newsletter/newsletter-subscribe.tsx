'use client';

import { useEffect, useId, useState } from 'react';
import type { NewsletterSubscriptionSource } from '@sportbrain/contracts';
import { useAuth } from '@/components/auth/auth-provider';
import { fetchMyNewsletterStatus } from '@/lib/newsletter-api';
import { clientEnv } from '@/lib/env';

interface NewsletterSubscribeProps {
  /** Where this instance of the form is mounted, stored on the subscription row for provenance. */
  source: NewsletterSubscriptionSource;
  className?: string;
}

type Status =
  | 'checking'
  | 'idle'
  | 'submitting'
  | 'subscribed'
  | 'pending_confirmation'
  | 'already_subscribed'
  | 'error';

/**
 * The Monday Brief sign-up form. Reused across the footer, the newsletter
 * landing page, article pages and the quiz-result screen — every mount just
 * passes a different `source` so the subscription row remembers where it
 * came from.
 *
 * Signed-in vs. anonymous behave differently, so the same "you already
 * subscribed, why is this asking again" CTA doesn't chase a user around the
 * site (a real bug found by manually testing the Passport work — the footer
 * form and the account-linked status used to be entirely separate tracks):
 *
 *   - Signed out: posts to the public `POST /v1/newsletter/subscribe` with
 *     a typed-in email, same as always.
 *   - Signed in: skips the email field (the account's own verified address
 *     is used server-side) and posts to `POST /v1/me/newsletter/subscribe`
 *     instead, which links the subscription to the account. On mount it
 *     also checks `GET /v1/me/newsletter` and renders nothing but the
 *     confirmation state if the account is already subscribed — so once a
 *     signed-in user subscribes anywhere, every mount of this form
 *     everywhere else immediately reflects it.
 */
export function NewsletterSubscribe({ source, className }: NewsletterSubscribeProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>(user ? 'checking' : 'idle');
  const inputId = useId();

  useEffect(() => {
    if (!user) {
      setStatus('idle');
      return;
    }
    let cancelled = false;
    setStatus('checking');
    fetchMyNewsletterStatus().then((summary) => {
      if (cancelled) return;
      setStatus(summary?.status === 'SUBSCRIBED' ? 'already_subscribed' : 'idle');
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    try {
      const response = user
        ? await fetch(new URL('/v1/me/newsletter/subscribe', clientEnv.NEXT_PUBLIC_API_URL), {
            method: 'POST',
            credentials: 'include',
            headers: { Accept: 'application/json' },
          })
        : await fetch(new URL('/v1/newsletter/subscribe', clientEnv.NEXT_PUBLIC_API_URL), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ email, source }),
          });

      if (!response.ok) {
        setStatus('error');
        return;
      }

      const body = (await response.json()) as { status: Status };
      setStatus(body.status);
    } catch {
      setStatus('error');
    }
  }

  if (status === 'checking') return null;

  if (
    status === 'subscribed' ||
    status === 'pending_confirmation' ||
    status === 'already_subscribed'
  ) {
    return (
      <div className={className} role="status">
        <p className="text-sm font-semibold">
          {status === 'pending_confirmation'
            ? 'Almost there — check your email to confirm.'
            : status === 'already_subscribed'
              ? "You're already on the list."
              : "You're subscribed."}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Every Monday. No spam. Unsubscribe anytime.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <label htmlFor={inputId} className="text-xs font-bold tracking-widest text-muted-foreground">
        GET THE MONDAY BRIEF
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        {!user && (
          <input
            id={inputId}
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-foreground/40 focus:ring-2 focus:ring-primary/20"
          />
        )}
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="shrink-0 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Every Monday. No spam. Unsubscribe anytime.
      </p>
      {status === 'error' && (
        <p role="alert" className="mt-2 text-xs font-medium text-destructive">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
