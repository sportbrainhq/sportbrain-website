'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { fetchMyNewsletterStatus } from '@/lib/newsletter-api';
import { NewsletterSubscribe } from './newsletter-subscribe';

/**
 * "Think you can do it again next week?" — the quiz-result → Monday Brief
 * retention loop (org spec Part 52). Secondary to the result itself: mounted
 * below the question review, never above the score.
 *
 * Only checked for a signed-in reader — an anonymous visitor has no account
 * to look a subscription up against, so the CTA simply always shows for
 * them (same trade-off `NewsletterSubscribe` itself already makes: there is
 * no "optional auth" endpoint in this codebase to detect a session without
 * one existing, see `newsletter-me.controller.ts`). Renders nothing while
 * the check is in flight or once it comes back subscribed, so a subscriber
 * never sees a CTA for something they already get.
 */
export function QuizResultNewsletterCta() {
  const { user } = useAuth();
  const [hideForSubscriber, setHideForSubscriber] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchMyNewsletterStatus().then((summary) => {
      if (!cancelled && summary?.status === 'SUBSCRIBED') setHideForSubscriber(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (hideForSubscriber) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-sm font-medium text-card-foreground">
        Think you can do it again next week?
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        The biggest stories of the week, plus a fresh SportBrain Challenge every Monday.
      </p>
      <NewsletterSubscribe source="QUIZ_RESULT" className="mt-3" />
    </div>
  );
}
