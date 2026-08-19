import Link from 'next/link';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { Container } from '@/components/layout/container';
import { fetchSports } from '@/lib/api';
import { SITE_NAME, SITE_TAGLINE, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  path: '/',
});

/**
 * The homepage: a way into each sport.
 *
 * Deliberately plain. The product's value is in the entity pages, and a landing
 * page that delays reaching them is in the way. Editorial content will earn a
 * richer homepage once it exists.
 */
export default async function HomePage() {
  // Swallowing the error keeps the page usable during an API outage, but it has
  // a sharp edge worth naming: this route is statically prerendered, so a build
  // that runs without a reachable API bakes the fallback into the HTML and
  // serves it until the next revalidation. That is exactly what happened the
  // first time this shipped.
  //
  // `unstable_noStore` on the failure path forces this render to be dynamic, so
  // a failed fetch is never the thing that gets cached. The success path stays
  // static and cheap, which is the point of prerendering it.
  const sports = await fetchSports()
    .then((result) => result.data)
    .catch(() => {
      noStore();
      return [];
    });

  return (
    <Container className="py-16 sm:py-20">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{SITE_NAME}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{SITE_TAGLINE}.</p>
      </div>

      {sports.length > 0 ? (
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sports.map((sport) => (
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
              <span>
                <span className="block font-semibold">{sport.name}</span>
                <span className="block text-xs text-muted-foreground">
                  Teams, players and competitions
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-12 rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
          Sports are unavailable right now. The API may be starting up.
        </p>
      )}
    </Container>
  );
}
