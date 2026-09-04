import type { Metadata } from 'next';
import { FixtureGroup } from '@/components/sports/fixture-card';
import { ApiError, fetchFixturesToday, fetchSport } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport: slug } = await params;
  try {
    const sport = await fetchSport(slug);
    return buildMetadata({
      title: `Today's ${sport.name} matches`,
      description: `Live scores, upcoming fixtures and results for ${sport.name.toLowerCase()} today.`,
      path: `/sports/${slug}/today`,
    });
  } catch {
    return buildMetadata({ title: 'Today', path: `/sports/${slug}/today` });
  }
}

/**
 * A sport's live/upcoming/finished fixtures for today.
 *
 * Backed by an external provider rather than our own database (see
 * `FixturesService` on the API side) — the one page on the site whose data
 * did not come through ingestion. `today.possiblyIncomplete` is shown as a
 * caveat rather than silently trusted, because neither provider can promise
 * completeness: SportScore caps at 50 rows with no pagination, and
 * TheSportsDB is scoped to a single league per call. A sport with no fixtures
 * provider configured (nothing implemented for it in `FixturesService` yet)
 * gets an honest "not available" message instead of an empty page that looks
 * broken.
 *
 * Never 404s on an unrecognised sport slug the way the overview page does:
 * `fetchSport` is still called (for the page title), but a fixtures fetch
 * failing is not treated as the page itself being missing, since the sport
 * page may exist perfectly well with no live-data coverage.
 */
export default async function TodayPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport: slug } = await params;

  const [sport, today] = await Promise.all([
    fetchSport(slug).catch((error) => {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }),
    fetchFixturesToday(slug),
  ]);

  const hasFixtures =
    today.live.length > 0 || today.upcoming.length > 0 || today.finished.length > 0;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Today
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
          {sport ? `${sport.name} today` : 'Today'}
        </h1>
      </header>

      {!hasFixtures ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No fixtures available for this sport right now.
        </p>
      ) : (
        <div className="space-y-6">
          <FixtureGroup label="Live" fixtures={today.live} />
          <FixtureGroup label="Upcoming" fixtures={today.upcoming} />
          <FixtureGroup label="Finished" fixtures={today.finished} />
        </div>
      )}

      {today.possiblyIncomplete && (
        <p className="text-xs text-muted-foreground">
          This list may not include every match today. Coverage depends on the data source for this
          sport.
        </p>
      )}
    </div>
  );
}
