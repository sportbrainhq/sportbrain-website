import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { NewsRail } from '@/components/news/news-rail';
import { SportSidebar } from '@/components/sports/sport-sidebar';
import { ApiError, fetchNews, fetchSport, fetchSports } from '@/lib/api';

/**
 * The shell every sport page shares: navigation, content, discovery rail.
 *
 * A layout rather than a per-page component, so none of the three is refetched
 * when moving between a sport's tabs. Next.js preserves layouts across
 * navigations within their segment, which is what keeps the sidebar from
 * flickering on every click.
 *
 * The rail collapses below the content on narrow screens rather than
 * disappearing: it is a way into the catalogue, and a phone needs that more
 * than a desktop does.
 */
export default async function SportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sport: string }>;
}) {
  const { sport: sportSlug } = await params;

  // All three in parallel. None depends on the others, and running them in
  // sequence would treble the time to first byte on every sport page.
  const [sportsResult, sportResult, newsResult] = await Promise.allSettled([
    fetchSports(),
    fetchSport(sportSlug),
    fetchNews({ sport: sportSlug, limit: 8 }),
  ]);

  // A wrong slug is a 404, not an error page. Anything else is a real failure
  // and should reach the error boundary rather than being disguised.
  if (sportResult.status === 'rejected') {
    if (sportResult.reason instanceof ApiError && sportResult.reason.status === 404) notFound();
    throw sportResult.reason;
  }

  const sports = sportsResult.status === 'fulfilled' ? sportsResult.value.data : [];

  // The rail is decoration around the content, so its failure degrades the page
  // rather than breaking it.
  const newsArticles = newsResult.status === 'fulfilled' ? newsResult.value.data : [];

  return (
    <Container className="py-8">
      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_20rem]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SportSidebar sports={sports} activeSport={sportSlug} />
        </aside>

        <div className="min-w-0">{children}</div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <NewsRail
            articles={newsArticles}
            emptyMessage="No news yet for this sport, check back soon."
          />
        </div>
      </div>
    </Container>
  );
}
