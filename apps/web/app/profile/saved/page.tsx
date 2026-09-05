import Link from 'next/link';
import { z } from 'zod';
import {
  savedEntitySchema,
  savedEntityTypeSchema,
  type SavedEntityType,
} from '@sportbrain/contracts';
import { apiGetAuthed } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Saved' };

const FILTERS: { label: string; value: SavedEntityType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Articles', value: 'article' },
  { label: 'Explainers', value: 'explainer' },
  { label: 'Stories', value: 'story' },
  { label: 'Players', value: 'player' },
  { label: 'Teams', value: 'team' },
  { label: 'Competitions', value: 'competition' },
];

const listSchema = z.object({ data: z.array(savedEntitySchema) });

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const parsedType = savedEntityTypeSchema.safeParse(type);
  const activeType = parsedType.success ? parsedType.data : undefined;

  const query = activeType ? `?type=${activeType}` : '';
  const result = await apiGetAuthed(`/v1/users/me/saved${query}`, listSchema);
  const items = result?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Saved</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = filter.value === 'all' ? !activeType : activeType === filter.value;
          const href =
            filter.value === 'all' ? '/profile/saved' : `/profile/saved?type=${filter.value}`;
          return (
            <Link
              key={filter.value}
              href={href}
              className={cn(
                'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

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
      <h2 className="text-lg font-semibold text-card-foreground">Nothing saved yet.</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Save stories, explainers, players and competitions to build your SportBrain library.
      </p>
    </div>
  );
}
