import { createHash } from 'node:crypto';
import { canonicalUrlHash } from './canonical-url';
import type { RawFeedItem } from './feed-parser';

/**
 * Normalises a `RawFeedItem` (a feed's own item shape) into something close
 * to `news_articles`' insertable columns.
 *
 * Not part of `@sportbrain/contracts` for the same reason `RawFeedItem`
 * isn't: it is an internal ingestion-pipeline shape. `news_articles.schema`
 * is the actual downstream contract, and the processor that inserts a row
 * maps `NormalizedArticle` onto it directly.
 */
export interface NormalizedArticle {
  headline: string;
  summary: string | null;
  originalUrl: string;
  canonicalUrl: string;
  canonicalUrlHash: string;
  imageUrl: string | null;
  language: string;
  publishedAt: Date;
  guid: string | null;
  externalId: string | null;
  rawMetadata: Record<string, unknown>;
}

/**
 * A minimal source shape the adapter needs. Kept narrow (rather than
 * accepting the full Drizzle row) so a unit test can construct one trivially.
 */
export interface AdapterSourceContext {
  id: string;
  feedUrl: string;
}

export interface FeedAdapter {
  /** Whether this adapter should handle items from the given source. `GenericRssAdapter` always returns true. */
  supports(source: AdapterSourceContext): boolean;
  /** Normalizes one raw item. Must not throw: on unrecoverable input, return the best-effort shape it can. */
  normalize(item: RawFeedItem, source: AdapterSourceContext, fetchedAt: Date): NormalizedArticle;
}

/**
 * The fallback adapter: extracts what it can from any RSS/Atom item,
 * defensively. Missing fields fall back to sensible defaults rather than
 * throwing, because a malformed or sparse feed item must not fail the whole
 * batch (see the `news-process` worker, which relies on that).
 */
export class GenericRssAdapter implements FeedAdapter {
  supports(): boolean {
    return true;
  }

  normalize(item: RawFeedItem, source: AdapterSourceContext, fetchedAt: Date): NormalizedArticle {
    const headline = firstNonEmpty(item.title) ?? '(untitled)';
    const summary = firstNonEmpty(item.description) ?? null;
    const originalUrl = firstNonEmpty(item.link) ?? source.feedUrl;

    let canonicalUrl = originalUrl;
    let hash: string;
    try {
      const result = canonicalUrlHash(originalUrl);
      canonicalUrl = result.canonicalUrl;
      hash = result.hash;
    } catch {
      // originalUrl was not a parseable URL (a malformed feed item). Fall
      // back to hashing the feed URL plus whatever identifies this item
      // (guid, or title), so the item can still be stored under a stable,
      // deterministic key rather than being dropped outright; a human can
      // fix the source data later. canonicalUrl is left as the raw
      // (unparseable) string for debugging visibility.
      const fallbackKey = `${source.feedUrl}#${item.guid ?? item.title ?? ''}`;
      hash = createHash('sha256').update(fallbackKey).digest('hex');
    }

    const publishedAt = item.publishedAt ?? fetchedAt;

    return {
      headline,
      summary,
      originalUrl,
      canonicalUrl,
      canonicalUrlHash: hash,
      imageUrl: firstNonEmpty(item.imageUrl) ?? null,
      language: 'en',
      publishedAt,
      guid: firstNonEmpty(item.guid) ?? null,
      externalId: firstNonEmpty(item.guid) ?? null,
      rawMetadata: {
        author: item.author ?? null,
        categories: item.categories ?? [],
        content: item.content ?? null,
      },
    };
  }
}

function firstNonEmpty(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Extension point for future provider-specific adapters (ESPN, BBC, …).
 *
 * Order matters: adapters are tried in array order, and the first whose
 * `supports()` returns true wins, so a more specific adapter registered
 * ahead of `GenericRssAdapter` overrides it for the sources it recognises.
 * `GenericRssAdapter` is deliberately last, as the catch-all.
 *
 * No provider-specific adapters exist yet (Phase 2 scope is generic-only);
 * this array is the seam a later phase extends rather than a registry that
 * needs building from scratch.
 */
export const FEED_ADAPTERS: FeedAdapter[] = [new GenericRssAdapter()];

export function resolveAdapter(source: AdapterSourceContext): FeedAdapter {
  return FEED_ADAPTERS.find((adapter) => adapter.supports(source)) ?? new GenericRssAdapter();
}
