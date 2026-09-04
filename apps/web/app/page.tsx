import Link from 'next/link';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import type { NewsArticleSummary } from '@sportbrain/contracts';
import { Container } from '@/components/layout/container';
import { NewsRail } from '@/components/news/news-rail';
import { fetchNews, fetchSports } from '@/lib/api';
import { SITE_NAME, SITE_TAGLINE, buildMetadata } from '@/lib/seo';

/**
 * Interleaves articles round-robin by sport, then truncates to `limit`.
 *
 * `fetchNews` sorts purely by `publishedAt`, which is correct for a
 * sport-scoped page but produces a homepage rail dominated by whichever
 * sport's publisher happened to post the most in the last hour - not a bug
 * in the data, just not what a cross-sport "latest news" rail should show.
 * This keeps each sport's articles in their own recency order while
 * guaranteeing the rail doesn't read as single-sport whenever one source is
 * unusually active. Articles without a resolved sport go in their own
 * "bucket" so they still get a turn rather than being silently dropped.
 */
function interleaveBySport(articles: NewsArticleSummary[], limit: number): NewsArticleSummary[] {
  const bySport = new Map<string, NewsArticleSummary[]>();
  for (const article of articles) {
    const key = article.sport ?? '__unsported__';
    const bucket = bySport.get(key);
    if (bucket) bucket.push(article);
    else bySport.set(key, [article]);
  }

  const buckets = [...bySport.values()];
  const result: NewsArticleSummary[] = [];
  for (let round = 0; result.length < limit; round++) {
    let tookAny = false;
    for (const bucket of buckets) {
      const article = bucket[round];
      if (!article) continue;
      result.push(article);
      tookAny = true;
      if (result.length >= limit) break;
    }
    if (!tookAny) break;
  }
  return result;
}

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
  const [sports, news] = await Promise.all([
    fetchSports()
      .then((result) => result.data)
      .catch(() => {
        noStore();
        return [];
      }),
    // Fetched wider than the rail's display size (8) so interleaveBySport has
    // enough per-sport depth to draw from; see its doc comment for why a
    // plain limit:8 isn't enough on its own.
    fetchNews({ limit: 40 })
      .then((result) => result.data)
      .catch(() => []),
  ]);

  const launched = sports.filter((sport) => sport.traits.hasTeams !== undefined || true);
  const rail = interleaveBySport(news, 8);

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

        <NewsRail articles={rail} />
      </div>
    </Container>
  );
}
