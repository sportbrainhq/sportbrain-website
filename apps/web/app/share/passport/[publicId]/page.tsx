import { notFound } from 'next/navigation';
import { publicPassportSchema } from '@sportbrain/contracts';
import { apiGet } from '@/lib/api';
import { KnowledgeLevelBadge } from '@/components/passport/knowledge-level-badge';

/**
 * Dedicated Passport share surface (Part 51, 54): distinct from
 * `/passport/:publicId` (the full public Passport page) — this is the
 * link-preview-friendly page for the "Share" card specifically, matching
 * the achievement/quiz-result share pages' shape. Same server-fetched,
 * ownership/visibility-checked data (Part 81) as the public Passport route.
 */
export default async function PassportSharePage({
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
    <div className="mx-auto max-w-md space-y-6 px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        SportBrainHQ
      </p>
      <h1 className="text-xl font-bold text-foreground">
        {passport.displayName}&rsquo;s SportBrain
      </h1>
      {passport.overallScore !== null && passport.overallLevel && (
        <div className="flex items-center justify-center gap-3">
          <p className="text-5xl font-black text-foreground">{passport.overallScore}</p>
          <KnowledgeLevelBadge level={passport.overallLevel} className="text-sm" />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {passport.questionsAnswered} questions
        {passport.accuracy !== null ? ` · ${Math.round(passport.accuracy)}% accuracy` : ''}
      </p>
    </div>
  );
}
