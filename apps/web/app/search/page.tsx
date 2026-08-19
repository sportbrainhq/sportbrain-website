import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { search } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Search',
  description: 'Search teams, players, competitions and venues across every sport.',
  path: '/search',
  // Search result pages are thin and near-duplicate, which is exactly what
  // crawlers penalise. The entity pages are the ones worth indexing.
  noIndex: true,
});

/**
 * Search, as a plain server-rendered form.
 *
 * A GET form with no client JavaScript, so a query is a shareable URL and the
 * page works before hydration. Type-ahead is a later enhancement and would need
 * a client boundary; it is not worth one yet.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  // The API requires two characters. Checking here avoids a guaranteed 400 and
  // lets the empty state say something useful instead.
  const results =
    query.length >= 2
      ? await search(query)
          .then((r) => r.data)
          .catch(() => [])
      : [];

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight">Search</h1>

        <form action="/search" method="get" role="search" className="mt-6 flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Teams, players, competitions…"
            aria-label="Search query"
            autoFocus
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Search
          </button>
        </form>

        <div className="mt-8">
          {query.length < 2 ? (
            <p className="text-sm text-muted-foreground">Type at least two characters.</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing found for <span className="font-medium text-foreground">{query}</span>.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {results.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <Link
                    href={hrefFor(result)}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-foreground/20 hover:bg-muted/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{result.name}</span>
                      {result.subtitle && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {result.subtitle}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-2xs font-medium uppercase tracking-wide text-muted-foreground">
                      {result.type}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Container>
  );
}

/**
 * Maps a result to its page.
 *
 * Venues have no page yet, so they link to their sport rather than to a 404.
 * They are still worth returning from search, because a visitor searching
 * "Camp Nou" should see that we know what it is.
 */
function hrefFor(result: { type: string; slug: string; sport: { slug: string } | null }): string {
  const sport = result.sport?.slug;
  if (!sport) return '/';

  switch (result.type) {
    case 'player':
      return `/sports/${sport}/players/${result.slug}`;
    case 'team':
      return `/sports/${sport}/teams/${result.slug}`;
    case 'competition':
      return `/sports/${sport}/competitions/${result.slug}`;
    default:
      return `/sports/${sport}`;
  }
}
