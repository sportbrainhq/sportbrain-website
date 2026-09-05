import type { Metadata } from 'next';
import { fetchSports } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { Container } from '@/components/layout/container';
import { QuizModeCard } from '@/components/quiz/quiz-mode-card';
import { ResumeQuizBanner } from '@/components/quiz/resume-quiz-banner';
import { MasterQuizStatsBlock } from '@/components/quiz/master-quiz-stats';
import { MASTER_QUIZ_MODES } from '@/lib/quiz-config';

const MODE_LABEL: Record<(typeof MASTER_QUIZ_MODES)[number]['mode'], string> = {
  QUICK: 'Quick',
  STANDARD: 'Standard',
  MARATHON: 'Marathon',
};

export function generateMetadata(): Metadata {
  return buildMetadata({ title: 'Master Quiz', path: '/quiz' });
}

/**
 * The Master Quiz landing (Part 33) — one of SportBrainHQ's major product
 * features, per the spec's own framing. Breadth across every launched
 * sport, assembled by `QuizGenerationService`'s allocator rather than any
 * fixed weighting.
 */
export default async function MasterQuizPage() {
  const sports = await fetchSports();

  return (
    <Container className="space-y-8 py-8">
      <header>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Master Quiz</h1>
        <p className="mt-2 text-muted-foreground">How much do you really know about sport?</p>
      </header>

      {sports.data.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {sports.data.map((sport) => (
            <li
              key={sport.id}
              className="rounded-full border border-border px-3 py-1 text-sm font-medium text-muted-foreground"
            >
              {sport.name}
            </li>
          ))}
        </ul>
      )}

      <ResumeQuizBanner quizType="MASTER" label="Master Quiz" />

      <MasterQuizStatsBlock />

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Choose a mode
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {MASTER_QUIZ_MODES.map((config) => (
            <QuizModeCard
              key={config.mode}
              title={MODE_LABEL[config.mode]}
              questionCount={config.questionCount}
              minutes={config.minutes}
              quizType="MASTER"
              mode={config.mode}
            />
          ))}
        </div>
      </div>
    </Container>
  );
}
