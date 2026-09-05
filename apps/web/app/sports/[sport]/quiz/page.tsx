import type { Metadata } from 'next';
import { fetchSport } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { QuizModeCard } from '@/components/quiz/quiz-mode-card';
import { ResumeQuizBanner } from '@/components/quiz/resume-quiz-banner';
import { SportQuizStatsBlock } from '@/components/quiz/sport-quiz-stats';
import { SPORT_QUIZ_MODES } from '@/lib/quiz-config';

const MODE_LABEL: Record<(typeof SPORT_QUIZ_MODES)[number]['mode'], string> = {
  QUICK: 'Quick',
  STANDARD: 'Standard',
  CHALLENGE: 'Challenge',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport } = await params;
  return buildMetadata({ title: 'Quiz', path: `/sports/${sport}/quiz` });
}

/**
 * Sport quiz landing (Part 32). One page serves all nine launched sports —
 * the mode counts, stats block and resume banner are all sport-agnostic,
 * driven entirely by `sport.id`/`sport.name` from the route's own layout
 * data plus client-side auth state.
 */
export default async function QuizPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport: slug } = await params;
  const sport = await fetchSport(slug);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{sport.name} Quiz</h1>
        <p className="mt-2 text-muted-foreground">
          Test your {sport.name.toLowerCase()} knowledge across players, teams, competitions,
          history and the game itself.
        </p>
      </header>

      <ResumeQuizBanner quizType="SPORT" sportId={sport.id} label={`${sport.name} quiz`} />

      <SportQuizStatsBlock sportId={sport.id} />

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Choose a mode
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {SPORT_QUIZ_MODES.map((config) => (
            <QuizModeCard
              key={config.mode}
              title={MODE_LABEL[config.mode]}
              questionCount={config.questionCount}
              minutes={config.minutes}
              quizType="SPORT"
              mode={config.mode}
              sportId={sport.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
