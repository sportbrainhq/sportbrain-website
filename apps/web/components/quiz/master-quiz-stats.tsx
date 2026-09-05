'use client';

import { useEffect, useState } from 'react';
import type { LifetimeQuizStats } from '@sportbrain/contracts';
import { fetchLifetimeQuizStats } from '@/lib/quiz-api';
import { useAuth } from '@/components/auth/auth-provider';

/** "MASTER QUIZZES / OVERALL ACCURACY / BEST SCORE" (Part 33). Uses lifetime stats (master + sport combined) since a master-only breakdown has no dedicated endpoint — an acceptable simplification for a landing-page stat block. */
export function MasterQuizStatsBlock() {
  const { user } = useAuth();
  const [stats, setStats] = useState<LifetimeQuizStats | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchLifetimeQuizStats().then((result) => {
      if (!cancelled) setStats(result);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || !stats || stats.quizzesCompleted === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Your stats
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Quizzes</dt>
          <dd className="text-xl font-bold text-card-foreground">{stats.quizzesCompleted}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Overall Accuracy</dt>
          <dd className="text-xl font-bold text-card-foreground">
            {Math.round(stats.overallAccuracy)}%
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Best Score</dt>
          <dd className="text-xl font-bold text-card-foreground">
            {stats.bestPercentage !== null ? `${Math.round(stats.bestPercentage)}%` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Current Streak</dt>
          <dd className="text-xl font-bold text-card-foreground">{stats.currentStreakDays}d</dd>
        </div>
      </dl>
    </div>
  );
}
