'use client';

import { useEffect, useState } from 'react';
import type { SportQuizStats } from '@sportbrain/contracts';
import { fetchSportQuizStats } from '@/lib/quiz-api';
import { useAuth } from '@/components/auth/auth-provider';

/** "YOUR FOOTBALL STATS" (Part 32). Renders nothing signed out or with zero quizzes played — an empty stats block is worse than no block. */
export function SportQuizStatsBlock({ sportId }: { sportId: string }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<SportQuizStats | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchSportQuizStats(sportId).then((result) => {
      if (!cancelled) setStats(result);
    });
    return () => {
      cancelled = true;
    };
  }, [user, sportId]);

  if (!user || !stats || stats.quizzesCompleted === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Your {stats.sportName} stats
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Accuracy</dt>
          <dd className="text-xl font-bold text-card-foreground">{Math.round(stats.accuracy)}%</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Quizzes</dt>
          <dd className="text-xl font-bold text-card-foreground">{stats.quizzesCompleted}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Best</dt>
          <dd className="text-xl font-bold text-card-foreground">
            {stats.bestPercentage !== null ? `${Math.round(stats.bestPercentage)}%` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Questions Answered</dt>
          <dd className="text-xl font-bold text-card-foreground">{stats.questionsAnswered}</dd>
        </div>
      </dl>
    </div>
  );
}
