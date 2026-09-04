import type { NewsArticleSummary } from '@sportbrain/contracts';
import { NewsCard } from './news-card';

/**
 * A headed section of news cards.
 *
 * The empty state is not an error state: `news_sources` seeds every source as
 * `isActive: false` until licensing is verified (see
 * `apps/api/src/database/seed/news-sources.ts`), so an empty list is the
 * expected, honest result right now, not a bug. The copy says so plainly
 * rather than implying something failed, and nothing here fabricates a
 * placeholder article to look populated.
 */
export function NewsList({
  heading,
  articles,
  emptyMessage = 'No news yet, check back soon.',
}: {
  heading: string;
  articles: NewsArticleSummary[];
  emptyMessage?: string;
}) {
  return (
    <section aria-label={heading}>
      <h2 className="text-xl font-bold tracking-tight">{heading}</h2>

      {articles.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </ul>
      )}
    </section>
  );
}
