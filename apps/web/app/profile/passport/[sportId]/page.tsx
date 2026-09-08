import { notFound } from 'next/navigation';
import { passportSportDetailSchema } from '@sportbrain/contracts';
import { apiGetAuthed } from '@/lib/auth';
import { KnowledgeLevelBadge } from '@/components/passport/knowledge-level-badge';

export const metadata = { title: 'Sport Knowledge' };

/**
 * One sport's knowledge detail (Part 16-18): score/level, then category
 * breakdown. A category below the minimum sample shows "more questions
 * needed" rather than a fabricated level (Part 18).
 */
export default async function PassportSportDetailPage({
  params,
}: {
  params: Promise<{ sportId: string }>;
}) {
  const { sportId } = await params;
  const detail = await apiGetAuthed(`/v1/me/passport/sports/${sportId}`, passportSportDetailSchema);

  if (!detail) notFound();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {detail.sport.sportName} Knowledge
        </p>
        <div className="mt-2 flex items-end gap-3">
          <p className="text-5xl font-black text-foreground">{detail.sport.score}</p>
          <KnowledgeLevelBadge level={detail.sport.level} className="mb-2 text-sm" />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Questions Answered" value={detail.sport.questionsAnswered} />
        <Stat label="Accuracy" value={`${Math.round(detail.sport.accuracy)}%`} />
        <Stat label="Categories" value={detail.sport.categoriesExplored} />
        <Stat
          label="Hard + Expert"
          value={
            detail.sport.hardExpertAccuracy !== null
              ? `${Math.round(detail.sport.hardExpertAccuracy)}%`
              : '—'
          }
        />
      </div>

      {detail.categories.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Category Knowledge
          </h2>
          <ul className="space-y-2">
            {detail.categories.map((c) => (
              <li
                key={c.category}
                className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {formatCategory(c.category)}
                  </p>
                  {c.level === null ? (
                    <p className="text-xs text-muted-foreground">
                      {c.questionsAnswered} questions · more questions needed to establish your
                      level
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {c.questionsAnswered} questions · {Math.round(c.accuracy)}% accuracy
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">{c.score}</span>
                  {c.level && <KnowledgeLevelBadge level={c.level} />}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
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
