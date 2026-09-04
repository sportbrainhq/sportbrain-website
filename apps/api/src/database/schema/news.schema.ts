import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { sport } from './sport.schema';

/**
 * The News Engine's canonical model, independent of RSS.
 *
 * The organising rule mirrors `provider.schema.ts`: everything a feed calls
 * its own (its field names, its category strings, its raw XML) is confined to
 * `news_feed_fetches`. From `news_articles` outward, an article looks the same
 * whether it arrived as an RSS `<item>`, an Atom `<entry>`, or, later, a paid
 * API response. That is what lets a source be swapped or a new fetch protocol
 * added without touching a single downstream table, a query, or a page.
 *
 * A second rule specific to news: a source's publication terms decide what we
 * are permitted to *display*, not what we are permitted to *store*. The
 * `display*Allowed` flags live on `news_sources` and are read at the API layer
 * (see `apps/api/src/modules/news`), never baked into the stored article, so a
 * change of terms takes effect immediately rather than requiring re-ingestion.
 */

/** How a source is polled. RSS today; the enum leaves room for a paid API or Atom-only feed later. */
export const newsSourceTypeEnum = pgEnum('news_source_type', ['rss', 'atom', 'api']);

/**
 * Whether a source's feed can currently be trusted to fetch cleanly.
 *
 * Separate from `isActive`, which is an editorial decision to poll a source at
 * all. `healthStatus` is the fetcher's own running verdict, so an operator can
 * tell "we chose to stop polling this" apart from "this is failing and we
 * should look at it". `disabled` is set automatically once
 * `consecutiveFailures` crosses `NEWS_AUTO_DISABLE_FAILURE_THRESHOLD` (see
 * `config/env.schema.ts`), which exists because a feed that has moved or gone
 * offline will otherwise be retried forever at cost with no operator aware.
 */
export const newsSourceHealthStatusEnum = pgEnum('news_source_health_status', [
  'healthy',
  'degraded',
  'failing',
  'disabled',
]);

/**
 * A feed we ingest from.
 *
 * One row per outlet's feed, not per outlet: a publisher with separate
 * football and cricket RSS feeds is two rows, because `defaultSportId` and the
 * fetch cadence genuinely differ between them.
 */
export const newsSources = pgTable(
  'news_sources',
  {
    id: primaryId(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    type: newsSourceTypeEnum('type').notNull().default('rss'),
    feedUrl: text('feed_url').notNull(),
    websiteUrl: text('website_url'),

    /** Null for a cross-sport outlet (a general news wire's sport section, an aggregator). */
    defaultSportId: entityRef('default_sport_id').references(() => sport.id, {
      onDelete: 'set null',
    }),

    /** Lower sorts first. Tie-break when clustering picks which account of a story to lead with. */
    priority: integer('priority').notNull().default(100),

    /** 0 to 1. How much weight this source's account of a story gets during clustering. */
    trustScore: numeric('trust_score', { precision: 4, scale: 3 }).notNull().default('0.500'),

    fetchIntervalSeconds: integer('fetch_interval_seconds').notNull().default(900),

    /** Editorial decision to poll this source at all. See `healthStatus` for the fetcher's own verdict. */
    isActive: boolean('is_active').notNull().default(true),

    /**
     * Publication-terms flags, read by the API layer to decide what part of a
     * stored article may be shown. See the module doc comment above: storing
     * is not the same permission as displaying, so these never gate ingestion.
     */
    displayHeadlineAllowed: boolean('display_headline_allowed').notNull().default(true),
    displaySummaryAllowed: boolean('display_summary_allowed').notNull().default(false),
    displayImageAllowed: boolean('display_image_allowed').notNull().default(false),

    /**
     * Free-text note on what the source's terms actually permit commercially
     * ("headline + link only", "full RSS excerpt permitted", "unclear, treat
     * as headline-only"). Kept as prose rather than an enum because licence
     * terms rarely reduce cleanly to a fixed set of cases, and a reviewer
     * needs to read the actual reasoning, not a category that hides it.
     */
    commercialUsageStatus: text('commercial_usage_status'),

    /** Where the terms were read, so a reviewer can re-check them without searching. */
    termsUrl: text('terms_url'),

    lastFetchAt: timestamp('last_fetch_at', { withTimezone: true }),
    lastSuccessAt: timestamp('last_success_at', { withTimezone: true }),

    /** Reset to zero on any success. Drives the auto-disable in `healthStatus`. */
    consecutiveFailures: integer('consecutive_failures').notNull().default(0),

    healthStatus: newsSourceHealthStatusEnum('health_status').notNull().default('healthy'),

    /** Conditional-GET bookkeeping, so an unchanged feed costs one small response rather than a full re-parse. */
    etag: text('etag'),
    lastModified: text('last_modified'),

    ...timestamps,
  },
  (table) => [
    uniqueIndex('news_sources_slug_idx').on(table.slug),
    index('news_sources_default_sport_idx').on(table.defaultSportId),
    index('news_sources_active_idx').on(table.isActive, table.healthStatus),
  ],
);

/** Whether a raw fetch was parsed cleanly, and if not, why. */
export const newsFetchProcessingStatusEnum = pgEnum('news_fetch_processing_status', [
  'pending',
  'processed',
  'failed',
]);

/**
 * A record of one poll of one source's feed.
 *
 * This is the *only* table permitted to hold provider-shaped raw content, and
 * even here it is provisional: `rawBody` is a placeholder for actual blob
 * storage. Both `rawBody` and `rawStorageRef` exist so ingestion can start
 * writing straight into Postgres and move to S3-or-equivalent later by
 * populating `rawStorageRef` and leaving `rawBody` null, without a schema
 * change or a backfill blocking the switch.
 */
export const newsFeedFetches = pgTable(
  'news_feed_fetches',
  {
    id: primaryId(),
    sourceId: entityRef('source_id')
      .notNull()
      .references(() => newsSources.id, { onDelete: 'cascade' }),

    httpStatus: integer('http_status'),
    etag: text('etag'),
    lastModified: text('last_modified'),

    /** SHA-256 of the response body, so an unchanged feed (a 200 with identical bytes) is detected even without a 304. */
    contentHash: text('content_hash'),

    /**
     * The raw feed body, in Postgres. TODO(news-engine-phase-2): move to
     * blob storage (S3 or equivalent) once ingestion volume makes per-row
     * storage costly; at that point write `rawStorageRef` instead and leave
     * this null. Not populated by Phase 1, which builds no fetcher yet.
     */
    rawBody: text('raw_body'),

    /** Pointer into blob storage (bucket key or URL), the Phase 2 replacement for `rawBody`. */
    rawStorageRef: text('raw_storage_ref'),

    fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
    processingStatus: newsFetchProcessingStatusEnum('processing_status')
      .notNull()
      .default('pending'),
    errorMessage: text('error_message'),

    ...timestamps,
  },
  (table) => [
    index('news_feed_fetches_source_idx').on(table.sourceId, table.fetchedAt),
    index('news_feed_fetches_status_idx').on(table.processingStatus),
  ],
);

/** Where an article is in the pipeline: fetched, then progressively enriched, then either published or dropped. */
export const newsArticleProcessingStatusEnum = pgEnum('news_article_processing_status', [
  'ingested',
  'normalized',
  'classified',
  'clustered',
  'published',
  'rejected',
  'failed',
]);

/**
 * A canonical news article, deduplicated across sources.
 *
 * `canonicalUrlHash` is the primary dedupe key: two sources syndicating the
 * same wire story, or the same publisher's URL appearing twice with different
 * tracking parameters, both normalise to one hash (see
 * `apps/api/src/modules/news/lib/canonical-url.ts`). The unique constraint on
 * `(sourceId, canonicalUrlHash)` stops one source's feed from producing
 * duplicate rows on re-fetch; cross-source duplicates are a separate concern,
 * handled by clustering (`news_story_clusters`), not by this constraint,
 * because two different sources legitimately each get their own row for the
 * same real-world story.
 */
export const newsArticles = pgTable(
  'news_articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceId: entityRef('source_id')
      .notNull()
      .references(() => newsSources.id, { onDelete: 'cascade' }),

    /** The feed's own item identifier, when it has one distinct from the GUID. */
    externalId: text('external_id'),

    /** RSS `<guid>` / Atom `<id>`, kept verbatim for troubleshooting a specific feed's misbehaviour. */
    guid: text('guid'),

    headline: text('headline').notNull(),
    summary: text('summary'),

    originalUrl: text('original_url').notNull(),

    /** `originalUrl` with tracking parameters stripped and normalised for comparison. */
    canonicalUrl: text('canonical_url').notNull(),

    /** SHA-256 of `canonicalUrl`. The dedupe key; see the table doc comment. */
    canonicalUrlHash: text('canonical_url_hash').notNull(),

    imageUrl: text('image_url'),

    /** BCP 47 tag ("en", "en-GB"). Not enforced as an enum: the fetcher will meet feeds in languages not yet decided on. */
    language: text('language').notNull().default('en'),

    publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),

    /** When our own pipeline first stored the article. Distinct from `publishedAt`, which the source asserts and cannot be trusted to be accurate or even present. */
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),

    /** Relative ranking used to order a list. Recomputed as classification and clustering add signal; not a stable absolute score. */
    importanceScore: numeric('importance_score', { precision: 6, scale: 3 }).notNull().default('0'),

    processingStatus: newsArticleProcessingStatusEnum('processing_status')
      .notNull()
      .default('ingested'),

    /**
     * Whatever the feed's own item carried beyond the columns above
     * (categories, author, enclosure metadata). JSONB rather than more
     * columns because its shape is per-feed and speculative, and it exists
     * for debugging and future re-processing, not for querying.
     */
    rawMetadata: jsonb('raw_metadata').notNull().default({}),

    /** Best-effort primary sport, set once classification has run. Null before then, and legitimately null for a cross-sport business story. */
    sportId: entityRef('sport_id').references(() => sport.id, { onDelete: 'set null' }),

    ...timestamps,
  },
  (table) => [
    uniqueIndex('news_articles_source_canonical_idx').on(table.sourceId, table.canonicalUrlHash),
    index('news_articles_canonical_hash_idx').on(table.canonicalUrlHash),
    index('news_articles_published_at_idx').on(table.publishedAt),
    index('news_articles_source_idx').on(table.sourceId),
    index('news_articles_processing_status_idx').on(table.processingStatus),
    index('news_articles_sport_idx').on(table.sportId),
  ],
);

/** Which canonical table an entity link's `entityId` points into. */
export const newsArticleEntityTypeEnum = pgEnum('news_article_entity_type', [
  'sport',
  'competition',
  'team',
  'player',
  'country',
]);

/**
 * Entities a classified article is about.
 *
 * `entityId` is untyped and carries no foreign key, the same choice
 * `external_mapping.entityId` makes and for the same reason: one column
 * cannot hold a foreign key into five different tables, and `entityType`
 * disambiguates it at the application layer instead.
 */
export const newsArticleEntities = pgTable(
  'news_article_entities',
  {
    id: primaryId(),
    articleId: entityRef('article_id')
      .notNull()
      .references(() => newsArticles.id, { onDelete: 'cascade' }),
    entityType: newsArticleEntityTypeEnum('entity_type').notNull(),
    entityId: entityRef('entity_id').notNull(),

    /** 0 to 1 confidence from entity resolution. Null for a link asserted with certainty (e.g. the source's own declared sport). */
    confidence: numeric('confidence', { precision: 4, scale: 3 }),

    ...timestamps,
  },
  (table) => [
    index('news_article_entities_article_idx').on(table.articleId),
    index('news_article_entities_entity_idx').on(table.entityType, table.entityId),
    uniqueIndex('news_article_entities_unique_idx').on(
      table.articleId,
      table.entityType,
      table.entityId,
    ),
  ],
);

/**
 * A real-world story, grouped from one or more articles that report it.
 *
 * Exists because a reader does not want five near-identical rows in a list
 * for the same transfer breaking across five outlets in the same hour. The
 * cluster is the unit a "top stories" view reads from; `news_articles` stays
 * the unit ingestion and licensing operate on.
 */
export const newsStoryClusters = pgTable(
  'news_story_clusters',
  {
    id: primaryId(),
    canonicalHeadline: text('canonical_headline').notNull(),

    /** The article judged the best single representative (highest source trust, most complete). Null only in the instant between cluster creation and its first member being attached. */
    primaryArticleId: entityRef('primary_article_id').references(() => newsArticles.id, {
      onDelete: 'set null',
    }),

    importanceScore: numeric('importance_score', { precision: 6, scale: 3 }).notNull().default('0'),

    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
    lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true }).notNull().defaultNow(),

    ...timestamps,
  },
  (table) => [
    index('news_story_clusters_primary_article_idx').on(table.primaryArticleId),
    index('news_story_clusters_last_updated_idx').on(table.lastUpdatedAt),
  ],
);

/** Membership of an article in a cluster, with the similarity score that put it there. */
export const newsStoryClusterArticles = pgTable(
  'news_story_cluster_articles',
  {
    clusterId: entityRef('cluster_id')
      .notNull()
      .references(() => newsStoryClusters.id, { onDelete: 'cascade' }),
    articleId: entityRef('article_id')
      .notNull()
      .references(() => newsArticles.id, { onDelete: 'cascade' }),

    /** 0 to 1 similarity to the cluster's representative at the time it was attached, kept for tuning the clustering threshold later. */
    similarityScore: numeric('similarity_score', { precision: 4, scale: 3 }),

    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.clusterId, table.articleId] }),
    index('news_story_cluster_articles_article_idx').on(table.articleId),
  ],
);

export const newsSourcesRelations = relations(newsSources, ({ one, many }) => ({
  defaultSport: one(sport, { fields: [newsSources.defaultSportId], references: [sport.id] }),
  fetches: many(newsFeedFetches),
  articles: many(newsArticles),
}));

export const newsFeedFetchesRelations = relations(newsFeedFetches, ({ one }) => ({
  source: one(newsSources, { fields: [newsFeedFetches.sourceId], references: [newsSources.id] }),
}));

export const newsArticlesRelations = relations(newsArticles, ({ one, many }) => ({
  source: one(newsSources, { fields: [newsArticles.sourceId], references: [newsSources.id] }),
  sport: one(sport, { fields: [newsArticles.sportId], references: [sport.id] }),
  entities: many(newsArticleEntities),
  clusterMemberships: many(newsStoryClusterArticles),
}));

export const newsArticleEntitiesRelations = relations(newsArticleEntities, ({ one }) => ({
  article: one(newsArticles, {
    fields: [newsArticleEntities.articleId],
    references: [newsArticles.id],
  }),
}));

export const newsStoryClustersRelations = relations(newsStoryClusters, ({ one, many }) => ({
  primaryArticle: one(newsArticles, {
    fields: [newsStoryClusters.primaryArticleId],
    references: [newsArticles.id],
  }),
  members: many(newsStoryClusterArticles),
}));

export const newsStoryClusterArticlesRelations = relations(newsStoryClusterArticles, ({ one }) => ({
  cluster: one(newsStoryClusters, {
    fields: [newsStoryClusterArticles.clusterId],
    references: [newsStoryClusters.id],
  }),
  article: one(newsArticles, {
    fields: [newsStoryClusterArticles.articleId],
    references: [newsArticles.id],
  }),
}));
