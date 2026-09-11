import { notFound } from 'next/navigation';
import Link from 'next/link';
import { publicPassportSchema } from '@sportbrain/contracts';
import { apiGet } from '@/lib/api';
import { KnowledgeLevelBadge } from '@/components/passport/knowledge-level-badge';

/**
 * Public Passport (Part 47-49, 80): no authentication, addressed only by
 * the random `publicId` token — never a real user id. `robots` is NOINDEX
 * unless the owner explicitly opted into search indexing (Part 80).
 */
export async function generateMetadata({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  try {
    const passport = await apiGet(`/v1/passports/${publicId}`, publicPassportSchema, {
      noStore: true,
    });
    return {
      title: `${passport.displayName}’s SportBrain Passport | SportBrainHQ`,
      description: `${passport.displayName}’s sports knowledge profile on SportBrainHQ.`,
      robots: passport.allowSearchIndexing
        ? { index: true, follow: true }
        : { index: false, follow: false },
    };
  } catch {
    return { title: 'SportBrain Passport' };
  }
}

export default async function PublicPassportPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  let passport;
  try {
    passport = await apiGet(`/v1/passports/${publicId}`, publicPassportSchema, { noStore: true });
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        SportBrainHQ
      </p>

      <header className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          SportBrain Passport
        </p>
        <h1 className="mt-2 text-xl font-bold text-foreground">{passport.displayName}</h1>
        {passport.overallScore !== null && passport.overallLevel && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <p className="text-5xl font-black text-foreground">{passport.overallScore}</p>
            <KnowledgeLevelBadge level={passport.overallLevel} className="text-sm" />
          </div>
        )}
      </header>

      {passport.sports.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Sports Knowledge
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {passport.sports.map((sport) => (
              <div key={sport.sportId} className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-semibold text-card-foreground">{sport.sportName}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">{sport.score}</span>
                  <KnowledgeLevelBadge level={sport.level} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-3 gap-3 text-center">
        <PublicStat label="Achievements" value={passport.achievementCount} />
        <PublicStat label="Questions Answered" value={passport.questionsAnswered} />
        {passport.currentWeeklyStreak !== null && (
          <PublicStat label="Weekly Streak" value={passport.currentWeeklyStreak} />
        )}
      </div>

      <footer className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-semibold text-foreground">Think you know sport?</p>
        <p className="mt-1 text-sm text-muted-foreground">Build your SportBrain.</p>
        <Link
          href="/quiz/master"
          className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Take the Master Quiz
        </Link>
      </footer>
    </div>
  );
}

function PublicStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
