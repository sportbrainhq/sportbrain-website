import Link from 'next/link';
import {
  passportActivitySchema,
  passportProgressSchema,
  passportSummarySchema,
} from '@sportbrain/contracts';
import { apiGetAuthed } from '@/lib/auth';
import { ActivityCalendar } from '@/components/passport/activity-calendar';
import { KnowledgeLevelBadge } from '@/components/passport/knowledge-level-badge';
import { ProgressGraph } from '@/components/passport/progress-graph';
import { SharePassportButton } from '@/components/passport/share-passport-button';

export const metadata = { title: 'SportBrain Passport' };

/**
 * The Passport (Part 2-4, 22, 75): a curated sports-knowledge identity, not
 * the detailed stats page (`/profile/quizzes`). New/lightly-established
 * accounts get an encouraging empty state rather than "Score: 0 / NEWCOMER"
 * (Part 59-61) — that reads as a punishment, not an invitation.
 */
export default async function PassportPage() {
  const summary = await apiGetAuthed('/v1/me/passport', passportSummarySchema);
  const [progress, activity] = await Promise.all([
    apiGetAuthed('/v1/me/passport/progress?range=6m', passportProgressSchema),
    apiGetAuthed('/v1/me/passport/activity?days=90', passportActivitySchema),
  ]);

  if (!summary) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          We couldn’t load your SportBrain Passport right now. Try again shortly.
        </p>
      </div>
    );
  }

  if (!summary.hasEstablishedPassport) {
    return (
      <div className="space-y-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            SportBrain Passport
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Your SportBrain is waiting</h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Take quizzes to build your sports knowledge profile. Answer at least 15 questions in a
            sport to establish your first knowledge level.
          </p>
          <Link
            href="/quiz"
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Take the Master Quiz
          </Link>
        </header>

        {summary.questionsAnswered > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              So far
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <SummaryStat label="Questions Answered" value={summary.questionsAnswered} />
              {summary.accuracy !== null && (
                <SummaryStat label="Accuracy" value={`${Math.round(summary.accuracy)}%`} />
              )}
              <SummaryStat label="Sports Explored" value={summary.sportsExplored} />
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="rounded-xl border border-border bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          SportBrain Passport
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-5xl font-black text-foreground">{summary.overallScore}</p>
            <p className="text-xs text-muted-foreground">SportBrain Score</p>
          </div>
          {summary.overallLevel && (
            <KnowledgeLevelBadge level={summary.overallLevel} className="text-sm" />
          )}
        </div>
        <div className="mt-6">
          <SharePassportButton isPublic={summary.isPublic} publicId={summary.publicId} />
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your SportBrain
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat label="Questions" value={summary.questionsAnswered} />
          <SummaryStat
            label="Accuracy"
            value={summary.accuracy !== null ? `${Math.round(summary.accuracy)}%` : '—'}
          />
          <SummaryStat label="Sports" value={summary.sportsExplored} />
          <SummaryStat label="Achievements" value={summary.achievementCount} />
        </div>
      </section>

      {summary.topSports.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Sport Knowledge
            </h2>
            <Link
              href="/profile/passport/sports"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {summary.topSports.map((sport) => (
              <Link
                key={sport.sportId}
                href={`/profile/passport/${sport.sportId}`}
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <p className="text-sm font-semibold text-card-foreground">{sport.sportName}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">{sport.score}</span>
                  <KnowledgeLevelBadge level={sport.level} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {sport.questionsAnswered} questions · {Math.round(sport.accuracy)}% accuracy
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {summary.strengths.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Your Strongest Areas
          </h2>
          <ul className="space-y-2">
            {summary.strengths.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-2.5 text-sm"
              >
                <span className="text-card-foreground">
                  {s.sportName} · {formatCategory(s.category)}
                </span>
                <span className="font-semibold text-foreground">{s.score}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {summary.areasToExplore.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Areas to Explore
          </h2>
          <ul className="space-y-2">
            {summary.areasToExplore.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-2.5 text-sm"
              >
                <span className="text-card-foreground">
                  {s.sportName} · {formatCategory(s.category)}
                </span>
                <span className="font-semibold text-muted-foreground">{s.score}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/quiz"
            className="mt-3 inline-flex items-center text-xs font-medium text-primary hover:underline"
          >
            Take a quiz
          </Link>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Master Quiz
        </h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Tests your knowledge across multiple sports.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <SummaryStat label="Accuracy" value={`${Math.round(summary.masterQuiz.accuracy)}%`} />
            <SummaryStat label="Sports" value={summary.masterQuiz.sportsCovered} />
            <SummaryStat
              label="Best"
              value={
                summary.masterQuiz.bestPercentage !== null
                  ? `${Math.round(summary.masterQuiz.bestPercentage)}%`
                  : '—'
              }
            />
          </div>
          <Link
            href="/quiz/master"
            className="mt-4 inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            Take Master Quiz
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Streak
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <SummaryStat
            label="Current Weekly Streak"
            value={`${summary.streak.currentWeeklyStreak} wk`}
          />
          <SummaryStat
            label="Best Weekly Streak"
            value={`${summary.streak.longestWeeklyStreak} wk`}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          A week counts when you complete at least one qualifying quiz.
        </p>
      </section>

      {summary.recentAchievements.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Achievements
            </h2>
            <Link
              href="/profile/passport/achievements"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all achievements
            </Link>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {summary.recentAchievements.map((a) => (
              <li
                key={a.achievement.id}
                className="rounded-md border border-border bg-card px-4 py-3"
              >
                <p className="text-sm font-semibold text-card-foreground">{a.achievement.name}</p>
                <p className="text-xs text-muted-foreground">{a.achievement.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {progress && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Your Progress
          </h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <ProgressGraph progress={progress} />
          </div>
        </section>
      )}

      {activity && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Your Activity
          </h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <ActivityCalendar activity={activity} />
          </div>
        </section>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/profile/passport/methodology" className="hover:underline">
          How your SportBrain Score works
        </Link>
      </p>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
