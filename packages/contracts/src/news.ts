import { z } from 'zod';

/**
 * The News Engine boundary.
 *
 * The whole point of this file is that nothing downstream of it can tell an
 * RSS feed produced an article. A provider's field names, its category
 * taxonomy, its image CDN quirks: none of that crosses here. What crosses is a
 * canonical article shape with entity links resolved to our own ids, exactly
 * as the sports-data schema keeps provider identifiers out of `person` and
 * `team`. Providers are expected to change; this shape is not.
 *
 * A second rule specific to news: a source's licence controls what the website
 * may *display*, not what it may *store*. `newsSourceSchema` carries the
 * `display*Allowed` flags, and the article schemas here already reflect them
 * (a summary is nulled out rather than surfaced when the source disallows it)
 * so no consumer of this contract has to re-derive licensing logic itself.
 */

/** How a source is fetched. RSS today; the enum leaves room for a paid API or a sitemap crawl later. */
export const newsSourceTypeSchema = z.enum(['rss', 'atom', 'api']);
export type NewsSourceType = z.infer<typeof newsSourceTypeSchema>;

/**
 * Whether a source's feed can currently be trusted to fetch cleanly.
 *
 * Separate from `isActive`: a source can be active (we intend to poll it) and
 * degraded (its last few polls failed) at the same time, and a reader-facing
 * admin view needs to tell those apart from a source that has been switched
 * off on purpose.
 */
export const newsSourceHealthStatusSchema = z.enum(['healthy', 'degraded', 'failing', 'disabled']);
export type NewsSourceHealthStatus = z.infer<typeof newsSourceHealthStatusSchema>;

export const newsSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  type: newsSourceTypeSchema,
  /** The sport this source is generally about. Null for cross-sport outlets. */
  defaultSportSlug: z.string().nullable(),
  /** Lower sorts first. Tie-break for clustering when two sources report the same story. */
  priority: z.number().int(),
  /** 0 to 1. How much weight this source's account of a story gets during clustering. */
  trustScore: z.number(),
  isActive: z.boolean(),
  /** Whether the source's terms let us show its headline verbatim. */
  displayHeadlineAllowed: z.boolean(),
  /** Whether the source's terms let us show its own summary/description text. */
  displaySummaryAllowed: z.boolean(),
  /** Whether the source's terms let us hot-link or mirror its images. */
  displayImageAllowed: z.boolean(),
  healthStatus: newsSourceHealthStatusSchema,
});
export type NewsSource = z.infer<typeof newsSourceSchema>;

/**
 * Editorial topic taxonomy, independent of any single sport or provider
 * category. A story is tagged with as many of these as apply.
 */
export const newsTopicSchema = z.enum([
  'breaking',
  'transfer',
  'injury',
  'match-preview',
  'match-report',
  'result',
  'selection',
  'contract',
  'rumour',
  'interview',
  'analysis',
  'record',
  'milestone',
  'disciplinary',
  'retirement',
  'business',
  'governance',
]);
export type NewsTopic = z.infer<typeof newsTopicSchema>;

/** How far an article has progressed through the ingestion pipeline. */
export const newsProcessingStatusSchema = z.enum([
  'ingested',
  'normalized',
  'classified',
  'clustered',
  'published',
  'rejected',
  'failed',
]);
export type NewsProcessingStatus = z.infer<typeof newsProcessingStatusSchema>;

/** A minimal reference to a canonical entity, shaped identically regardless of entity type. */
export const newsEntityRefSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
});
export type NewsEntityRef = z.infer<typeof newsEntityRefSchema>;

/**
 * A card in a news list. Deliberately small: listings render dozens of these
 * and every extra field is a cost paid on every page view.
 */
export const newsArticleSummarySchema = z.object({
  id: z.string(),
  headline: z.string(),
  /** Null when the source's terms do not allow displaying its summary text. */
  summary: z.string().nullable(),
  source: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  originalUrl: z.string(),
  canonicalUrl: z.string(),
  /** Null when there is no image, or the source's terms do not allow showing one. */
  imageUrl: z.string().nullable(),
  sport: z.string().nullable(),
  competitions: z.array(newsEntityRefSchema),
  teams: z.array(newsEntityRefSchema),
  players: z.array(newsEntityRefSchema),
  topics: z.array(newsTopicSchema),
  /** Relative ranking within a list, not an absolute score comparable across queries. */
  importanceScore: z.number(),
  publishedAt: z.string(),
  /** When our own pipeline first saw the article, which can lag `publishedAt` by seconds to minutes. */
  firstSeenAt: z.string(),
});
export type NewsArticleSummary = z.infer<typeof newsArticleSummarySchema>;

/**
 * The full article, adding pipeline provenance the list view has no need for.
 */
export const newsArticleDetailSchema = newsArticleSummarySchema.extend({
  processingStatus: newsProcessingStatusSchema,
  /** Per-entity link confidence, exposed so a low-confidence tag can be styled or hidden differently. */
  entityLinks: z.array(
    newsEntityRefSchema.extend({
      entityType: z.enum(['sport', 'competition', 'team', 'player', 'country']),
      confidence: z.number().nullable(),
    }),
  ),
});
export type NewsArticleDetail = z.infer<typeof newsArticleDetailSchema>;

/**
 * Cursor pagination for news, distinct from the offset-based `paginated()`
 * envelope used elsewhere.
 *
 * News is an append-mostly, high-churn feed ordered by recency: page 2 of an
 * offset query silently reshuffles under a reader as new articles land between
 * requests, which is exactly the "missed a story" bug cursor pagination
 * exists to avoid. The cursor is opaque to the client (an encoded
 * `publishedAt`/`id` pair) so the encoding can change without breaking it.
 */
export const NEWS_DEFAULT_PAGE_SIZE = 20;
export const NEWS_MAX_PAGE_SIZE = 50;

export const newsListQuerySchema = z.object({
  sport: z.string().optional(),
  competition: z.string().optional(),
  team: z.string().optional(),
  player: z.string().optional(),
  topic: newsTopicSchema.optional(),
  source: z.string().optional(),
  limit: z.coerce.number().int().positive().max(NEWS_MAX_PAGE_SIZE).default(NEWS_DEFAULT_PAGE_SIZE),
  /** Opaque cursor from a previous response's `pagination.nextCursor`. Omitted for the first page. */
  cursor: z.string().optional(),
});
export type NewsListQuery = z.infer<typeof newsListQuerySchema>;

export const newsCursorPaginationMetaSchema = z.object({
  limit: z.number().int().positive(),
  /** Present when another page exists; absent (not null) at the end of the feed, so JSON omits it cleanly. */
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
export type NewsCursorPaginationMeta = z.infer<typeof newsCursorPaginationMetaSchema>;

/** Wraps an item schema into the cursor-paginated envelope news list endpoints use. */
export function cursorPaginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    data: z.array(item),
    pagination: newsCursorPaginationMetaSchema,
  });
}

export type CursorPaginated<T> = {
  data: T[];
  pagination: NewsCursorPaginationMeta;
};
