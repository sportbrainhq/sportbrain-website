import { z } from 'zod';
import { userActivitySchema, userSnapshotSchema, type UserSnapshot } from '@sportbrain/contracts';
import { apiGetAuthed, requireUser } from '@/lib/auth';

const activityListSchema = z.object({ data: z.array(userActivitySchema) });

const ACTIVITY_COPY: Record<string, (metadata: Record<string, unknown>) => string> = {
  quiz_completed: (m) =>
    `Completed a quiz${typeof m.score === 'number' ? ` scoring ${m.score}` : ''}`,
  content_saved: (m) => `Saved ${typeof m.entityType === 'string' ? m.entityType : 'an item'}`,
  entity_followed: (m) =>
    `Followed ${typeof m.entityType === 'string' ? m.entityType : 'an entity'}`,
};

export const metadata = { title: 'Profile' };

const EMPTY_SNAPSHOT: UserSnapshot = {
  quizzesPlayed: 0,
  correctAnswers: 0,
  accuracyPercent: 0,
  currentQuizStreak: 0,
  bestQuizScore: null,
  sportsExplored: 0,
  savedItems: 0,
  following: 0,
};

export default async function ProfilePage() {
  const user = await requireUser();
  const snapshot =
    (await apiGetAuthed('/v1/users/me/snapshot', userSnapshotSchema)) ?? EMPTY_SNAPSHOT;
  const activity = (await apiGetAuthed('/v1/users/me/activities', activityListSchema))?.data ?? [];

  const memberSince = new Date(user.memberSince).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-secondary text-xl font-semibold text-secondary-foreground">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external Google avatar URL
            <img
              src={user.avatarUrl}
              alt=""
              className="size-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            user.displayName.trim().charAt(0).toUpperCase() || '?'
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user.displayName}</h1>
          <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          SportBrain Snapshot
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SnapshotStat label="Quizzes Played" value={snapshot.quizzesPlayed} />
          <SnapshotStat label="Correct Answers" value={snapshot.correctAnswers} />
          <SnapshotStat label="Accuracy" value={`${snapshot.accuracyPercent}%`} />
          <SnapshotStat label="Quiz Streak" value={snapshot.currentQuizStreak} />
          <SnapshotStat label="Best Quiz Score" value={snapshot.bestQuizScore ?? '—'} />
          <SnapshotStat label="Sports Explored" value={snapshot.sportsExplored} />
          <SnapshotStat label="Saved Items" value={snapshot.savedItems} />
          <SnapshotStat label="Following" value={snapshot.following} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent Activity
        </h2>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing yet — save something or follow a team to see it here.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {activity.map((item) => (
              <li key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-card-foreground">
                  {(ACTIVITY_COPY[item.activityType] ?? (() => item.activityType))(item.metadata)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString('en-GB')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SnapshotStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
