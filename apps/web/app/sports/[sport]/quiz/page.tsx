import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchQuizzes, fetchSport } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport } = await params;
  return buildMetadata({ title: 'Quiz', path: `/sports/${sport}/quiz` });
}

export default async function QuizPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport: slug } = await params;
  const [sport, quizzes] = await Promise.all([fetchSport(slug), fetchQuizzes(slug)]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{sport.name} quiz</h1>
        <p className="mt-2 text-muted-foreground">
          Test what you know about {sport.name.toLowerCase()}.
        </p>
      </header>

      {quizzes.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No quizzes written yet.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {quizzes.data.map((quiz) => (
            <li key={quiz.id}>
              <Link
                href={`/quizzes/${quiz.slug}`}
                className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50"
              >
                <span className="block font-medium">{quiz.title}</span>
                {quiz.description && (
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {quiz.description}
                  </span>
                )}
                <span className="mt-2 block text-xs text-muted-foreground">
                  {quiz.questionCount} questions · {quiz.difficulty}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
