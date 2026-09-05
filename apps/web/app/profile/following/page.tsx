import { z } from 'zod';
import { userFollowSchema } from '@sportbrain/contracts';
import { apiGetAuthed } from '@/lib/auth';

export const metadata = { title: 'Following' };

const listSchema = z.object({ data: z.array(userFollowSchema) });

export default async function FollowingPage() {
  const result = await apiGetAuthed('/v1/users/me/following', listSchema);
  const items = result?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Following</h1>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map((item) => (
            <li
              key={`${item.entityType}:${item.entityId}`}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium capitalize text-card-foreground">
                  {item.entityType}
                </p>
                <p className="text-xs text-muted-foreground">{item.entityId}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString('en-GB')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-card-foreground">Build your sports world.</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Follow the teams, players and competitions you care about.
      </p>
    </div>
  );
}
