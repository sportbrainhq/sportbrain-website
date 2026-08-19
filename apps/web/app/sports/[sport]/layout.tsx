import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { SportSidebar } from '@/components/sports/sport-sidebar';
import { ApiError, fetchSport, fetchSports } from '@/lib/api';

/**
 * The shell every sport page shares: sidebar on the left, content on the right.
 *
 * A layout rather than a per-page component, so the sidebar is not re-rendered
 * or re-fetched when moving between a sport's tabs. Next.js preserves layouts
 * across navigations within their segment.
 */
export default async function SportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sport: string }>;
}) {
  const { sport: sportSlug } = await params;

  // Both in parallel: the sidebar needs every sport, the page needs this one,
  // and neither depends on the other.
  const [sportsResult, sportResult] = await Promise.allSettled([
    fetchSports(),
    fetchSport(sportSlug),
  ]);

  // A wrong slug is a 404, not an error page. Anything else is a real failure
  // and should reach the error boundary rather than being disguised.
  if (sportResult.status === 'rejected') {
    if (sportResult.reason instanceof ApiError && sportResult.reason.status === 404) notFound();
    throw sportResult.reason;
  }

  const sports = sportsResult.status === 'fulfilled' ? sportsResult.value.data : [];

  return (
    <Container className="py-8">
      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SportSidebar sports={sports} activeSport={sportSlug} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
