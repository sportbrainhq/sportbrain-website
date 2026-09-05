export const metadata = { title: 'Quiz History' };

/**
 * Quiz history is schema-ready on the backend (`quiz_attempts`) but has
 * nothing to show yet: there is no quiz-taking flow in this app producing
 * completed attempts (see `apps/web/app/sports/[sport]/quiz/page.tsx`,
 * which links to a `/quizzes/[slug]` route that doesn't exist). This page
 * renders the intentional empty state from the spec now, so the profile
 * section is complete, and starts showing real data the moment that flow
 * ships — no change needed here when it does.
 */
export default function QuizHistoryPage() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
      <h1 className="text-lg font-semibold text-card-foreground">Your scoreboard is empty.</h1>
      <p className="mt-1 text-sm text-muted-foreground">Take your first quiz.</p>
    </div>
  );
}
