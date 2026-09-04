import type { NewsArticleSummary } from '@sportbrain/contracts';

/**
 * A compact, numbered news feed for a narrow sidebar rail.
 *
 * Mirrors the layout previously used by the archive rail (numbered rows,
 * headline + source/topic line) but sources live articles from `fetchNews`
 * instead of generated highlights. Kept deliberately terse: no image, no
 * summary line, one badge for sport/topic, since the rail's width does not
 * afford `NewsCard`'s fuller layout used lower on the page.
 *
 * `summary` and `imageUrl` are not shown here at all, so the licensing
 * omission rules that govern them in `NewsCard` do not need re-checking: an
 * absent field simply has nothing to omit.
 */
export function NewsRail({
  articles,
  emptyMessage = 'No news yet, check back soon.',
}: {
  articles: NewsArticleSummary[];
  emptyMessage?: string;
}) {
  return (
    <aside className="space-y-3" aria-label="Latest sports news">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Latest news
        </h2>
      </div>

      {articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {articles.map((article, index) => (
            <li key={article.id}>
              <a
                href={article.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 px-3 py-2.5 transition-colors hover:bg-muted/60"
              >
                <span className="w-5 shrink-0 pt-0.5 font-mono text-2xs tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-snug">{article.headline}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-2xs uppercase tracking-wide text-muted-foreground">
                    <span className="font-medium text-foreground/70">{article.source.name}</span>
                    {article.sport && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{article.sport}</span>
                      </>
                    )}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
