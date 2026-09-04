import type { NewsArticleSummary } from '@sportbrain/contracts';

/**
 * One article in a news list.
 *
 * `summary` and `imageUrl` are nulled server-side when a source's licence does
 * not permit displaying them (see `newsArticleSummarySchema` in
 * `@sportbrain/contracts`). A null here is a deliberate licensing decision, not
 * missing data, so this card omits the slot entirely rather than showing a
 * "summary unavailable" placeholder that would imply something went wrong.
 *
 * The headline does not itself link out. `originalUrl` opens the publisher's
 * own article in a new tab, and that is made an explicit, separately labelled
 * link ("Read on {source} ↗") so a reader always knows before they click that
 * the click leaves SportBrainHQ.
 */
export function NewsCard({ article }: { article: NewsArticleSummary }) {
  return (
    <li className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-foreground/20 hover:bg-muted/50">
      <div className="flex gap-3">
        {article.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- third-party
          // publisher image, not in next.config's remotePatterns.
          <img
            src={article.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-20 w-28 shrink-0 rounded-md bg-muted object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-medium leading-snug">{article.headline}</h3>

          {article.summary && (
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
              {article.summary}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">{article.source.name}</span>
            <span aria-hidden>·</span>
            <time dateTime={article.publishedAt}>{formatPublishedAt(article.publishedAt)}</time>
          </div>

          {(article.sport || article.topics.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {article.sport && <TopicBadge label={article.sport} emphasis />}
              {article.topics.map((topic) => (
                <TopicBadge key={topic} label={topic.replace(/-/g, ' ')} />
              ))}
            </div>
          )}

          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium hover:underline"
          >
            Read on {article.source.name}
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </li>
  );
}

/** Small pill for a sport or topic tag. */
function TopicBadge({ label, emphasis = false }: { label: string; emphasis?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-2xs capitalize ${
        emphasis
          ? 'border-foreground/20 bg-foreground/5 font-medium text-foreground/80'
          : 'border-border text-muted-foreground'
      }`}
    >
      {label}
    </span>
  );
}

/**
 * A short relative time for recent articles, falling back to a plain date once
 * a story is old enough that "3 days ago" stops being more useful than the
 * date itself.
 */
function formatPublishedAt(iso: string): string {
  const published = new Date(iso);
  if (Number.isNaN(published.getTime())) return iso;

  const diffMs = Date.now() - published.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return published.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
