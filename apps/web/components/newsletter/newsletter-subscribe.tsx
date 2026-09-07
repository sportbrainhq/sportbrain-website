'use client';

import { useId, useState } from 'react';
import type { NewsletterSubscriptionSource } from '@sportbrain/contracts';
import { clientEnv } from '@/lib/env';

interface NewsletterSubscribeProps {
  /** Where this instance of the form is mounted, stored on the subscription row for provenance. */
  source: NewsletterSubscriptionSource;
  className?: string;
}

type Status =
  'idle' | 'submitting' | 'subscribed' | 'pending_confirmation' | 'already_subscribed' | 'error';

/**
 * The Monday Brief sign-up form. Reused across the footer, the newsletter
 * landing page, article pages and the quiz-result screen — every mount just
 * passes a different `source` so the subscription row remembers where it
 * came from.
 *
 * Posts directly to the public `POST /v1/newsletter/subscribe` endpoint from
 * the browser (like `PreferencesForm`'s save call), rather than through a
 * Server Action: this form has no server-only secret to protect and no
 * field-level validation worth a round trip before submit, unlike the
 * contact form's `whatIsIncorrect`/`sourceUrl` fields.
 *
 * Always calls the anonymous endpoint, even for a signed-in visitor: linking
 * a subscription to an account happens explicitly on `/profile/preferences`
 * via `POST /me/newsletter/subscribe` instead (see
 * `apps/api/src/modules/newsletter/newsletter-me.controller.ts`'s reasoning
 * for why this codebase has no "optional auth" endpoint to detect a session
 * here without adding one).
 */
export function NewsletterSubscribe({ source, className }: NewsletterSubscribeProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const inputId = useId();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    try {
      const response = await fetch(
        new URL('/v1/newsletter/subscribe', clientEnv.NEXT_PUBLIC_API_URL),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email, source }),
        },
      );

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
