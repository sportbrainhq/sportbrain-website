import Link from 'next/link';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { Container } from '@/components/layout/container';
import { HighlightRail } from '@/components/sports/highlight-rail';
import { fetchHighlights, fetchSports } from '@/lib/api';
import { SITE_NAME, SITE_TAGLINE, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  path: '/',
});

/**
 * The homepage: a way into each sport, with the discovery rail alongside.
 *
 * Deliberately plain. The product's value is in the entity pages, and a landing
 * page that delays reaching them is in the way.
 */
export default async function HomePage() {
  // Swallowing the error keeps the page usable during an API outage, but it has
  // a sharp edge worth naming: this route is statically prerendered, so a build
  // that runs without a reachable API bakes the fallback into the HTML and
  // serves it until the next revalidation. `noStore` on the failure path forces
  // that render to be dynamic, so a failed fetch is never what gets cached.
  const [sports, highlights] = await Promise.all([
    fetchSports()
      .then((result) => result.data)
      .catch(() => {
        noStore();
        return [];
      }),
    fetchHighlights()
      .then((result) => result.data)
      .catch(() => []),
  ]);

  const launched = sports.filter((sport) => sport.traits.hasTeams !== undefined || true);

  return (
    <Container className="py-12 sm:py-16">
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <header className="max-w-2xl">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{SITE_NAME}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{SITE_TAGLINE}.</p>
          </header>

          {launched.length > 0 ? (
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {launched.map((sport) => (
                <Link
                  key={sport.id}
                  href={`/sports/${sport.slug}`}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50"
                >
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-xs font-bold uppercase text-muted-foreground"
                  >
                    {sport.shortCode}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{sport.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {sport.summary
                        ? sport.summary.split('.')[0]
                        : 'Teams, players and competitions'}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-10 rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
              Sports are unavailable right now. The API may be starting up.
            </p>
          )}
        </div>

        <HighlightRail highlights={highlights} />
      </div>
    </Container>
  );
}
