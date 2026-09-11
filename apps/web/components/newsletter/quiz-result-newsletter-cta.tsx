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
 * The whole card (not just the form) hides once a signed-in reader is
 * already subscribed — `NewsletterSubscribe` itself now also checks this on
 * mount, but checking it here too means the surrounding "Think you can do
 * it again next week?" copy disappears along with the form, rather than
 * leaving an orphaned card around an empty confirmation message. An
 * anonymous visitor has no account to check, so the card always shows for
 * them.
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
