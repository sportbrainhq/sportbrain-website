import { notFound } from 'next/navigation';
import { publicAchievementShareSchema } from '@sportbrain/contracts';
import { apiGet } from '@/lib/api';

/**
 * Shareable achievement card page (Part 53): a simple, link-preview-friendly
 * page whose `opengraph-image` is the actual card (Part 54) — visiting it
 * directly shows the same info as plain text, for anyone without an image
 * preview.
 */
export default async function AchievementSharePage({
  params,
}: {
  params: Promise<{ userAchievementId: string }>;
}) {
  const { userAchievementId } = await params;

  let share;
  try {
    share = await apiGet(
      `/v1/share/achievement/${userAchievementId}`,
      publicAchievementShareSchema,
      {
        noStore: true,
      },
    );
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        SportBrainHQ
      </p>
      <h1 className="text-2xl font-bold text-foreground">{share.achievement.name}</h1>
      <p className="text-sm text-muted-foreground">{share.achievement.description}</p>
      <p className="text-xs text-muted-foreground">Unlocked by {share.displayName}</p>
    </div>
  );
}
