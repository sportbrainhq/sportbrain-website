'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { passportImpactSchema, type PassportImpact } from '@sportbrain/contracts';
import { clientEnv } from '@/lib/env';
import { KnowledgeLevelBadge } from './knowledge-level-badge';

/**
 * Quiz-result "SportBrain Impact" (Part 44): recomputed synchronously for
 * this one attempt via `GET /me/passport/impact/:quizAttemptId` — the async
 * `passport-recalc` queue job stays the source of truth for the persisted
 * cache, this call just gives the result page the same-session number.
 * Renders nothing while loading and nothing on failure/no-change (Part 44:
 * "do not force +0 display") — this is a bonus, not a load-bearing part of
 * the result page.
 */
export function SportBrainImpact({ quizAttemptId }: { quizAttemptId: string }) {
  const [impact, setImpact] = useState<PassportImpact | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch(new URL(`/v1/me/passport/impact/${quizAttemptId}`, clientEnv.NEXT_PUBLIC_API_URL), {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (cancelled) return;
        const parsed = passportImpactSchema.nullable().safeParse(body?.data ?? null);
        setImpact(parsed.success ? parsed.data : null);
      })
      .catch(() => {
        if (!cancelled) setImpact(null);
      });
    return () => {
      cancelled = true;
    };
  }, [quizAttemptId]);

  if (!impact) return null;

  const hasOverallChange = impact.overall.delta !== 0 || impact.overall.levelChanged;
  const hasSportChange = impact.sport && (impact.sport.delta !== 0 || impact.sport.levelChanged);

  if (
    !hasOverallChange &&
    !hasSportChange &&
    impact.newAchievements.length === 0 &&
    !impact.streak.streakChanged
  ) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        SportBrain Impact
      </h2>

      <div className="mt-3 space-y-3">
        {hasSportChange && impact.sport && (
          <ImpactRow
            label={impact.sport.sportName}
            previous={impact.sport.previousScore}
            current={impact.sport.currentScore}
            delta={impact.sport.delta}
            levelChanged={impact.sport.levelChanged}
            previousLevel={impact.sport.previousLevel}
            currentLevel={impact.sport.currentLevel}
          />
        )}

        {hasOverallChange && (
          <ImpactRow
            label="Overall SportBrain Score"
            previous={impact.overall.previousScore}
            current={impact.overall.currentScore}
            delta={impact.overall.delta}
            levelChanged={impact.overall.levelChanged}
            previousLevel={impact.overall.previousLevel}
            currentLevel={impact.overall.currentLevel}
          />
        )}

        {impact.streak.streakChanged && (
          <p className="text-sm text-foreground">
            Weekly streak now{' '}
            <span className="font-semibold">{impact.streak.currentWeeklyStreak}</span>
          </p>
        )}
      </div>

      {impact.newAchievements.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          {impact.newAchievements.length === 1 ? (
            <p className="text-sm font-semibold text-foreground">
              Achievement unlocked: {impact.newAchievements[0]?.achievement.name}
            </p>
          ) : (
            <p className="text-sm font-semibold text-foreground">
              {impact.newAchievements.length} achievements unlocked
            </p>
          )}
          <Link
            href="/profile/passport/achievements"
            className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
          >
            View achievements
          </Link>
        </div>
      )}
    </section>
  );
}

function ImpactRow({
  label,
  previous,
  current,
  delta,
  levelChanged,
  previousLevel,
  currentLevel,
}: {
  label: string;
  previous: number | null;
  current: number;
  delta: number;
  levelChanged: boolean;
  previousLevel: PassportImpact['overall']['previousLevel'];
  currentLevel: PassportImpact['overall']['currentLevel'];
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">
          {previous !== null ? `${previous} → ` : ''}
          {current}
          {delta !== 0 && (
            <span className={delta > 0 ? 'ml-1 text-primary' : 'ml-1 text-destructive'}>
              {delta > 0 ? '+' : ''}
              {delta}
            </span>
          )}
        </span>
      </div>
      {levelChanged && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          {previousLevel && <KnowledgeLevelBadge level={previousLevel} />}
          {previousLevel && <span className="text-muted-foreground">→</span>}
          <KnowledgeLevelBadge level={currentLevel} />
        </div>
      )}
    </div>
  );
}
