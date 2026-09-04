import { z } from 'zod';

/**
 * The complete environment contract for the API.
 *
 * Validated once at start-up. If anything is missing or malformed the process
 * exits immediately with a readable report, rather than failing later at the
 * first request that happens to touch the bad value.
 *
 * No module reads `process.env` directly. Everything goes through
 * `ConfigService` typed by `AppConfig`, which is derived from this schema.
 */

const booleanFromString = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) => value === true || value === 'true');

const csv = z.string().transform((value) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0),
);

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().positive().default(4000),

    // Required in every environment. There is no sensible default for a
    // database connection, and a wrong default is worse than a hard failure.
    DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid connection string' }),
    DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
    DATABASE_SSL: booleanFromString.default(false),

    // Browser origins permitted to call this API. Empty means same-origin only.
    CORS_ORIGINS: csv.default('http://localhost:3000'),

    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

    RATE_LIMIT_TTL_SECONDS: z.coerce.number().int().positive().default(60),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),

    SWAGGER_ENABLED: booleanFromString.default(true),

    // Master switch for scheduled jobs. Off by default because running the
    // same cron on every replica is the standard way to double-process work.
    JOBS_ENABLED: booleanFromString.default(false),

    // Shared cache backend. Optional: leaving it unset keeps the API on the
    // in-memory cache, which is the correct choice until a second replica or
    // a restart-durability requirement makes that a real limitation. See
    // `infrastructure/cache/cache.module.ts` for the fallback.
    REDIS_URL: z.string().url().optional(),

    // News Engine (RSS ingestion). Phase 1 only defines these; nothing reads
    // NEWS_* yet beyond the public read API's cache TTL, since the fetcher
    // that will use the rest is a later phase.
    NEWS_RSS_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
    NEWS_RSS_MAX_RESPONSE_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .default(5 * 1024 * 1024),
    NEWS_RSS_RETRY_COUNT: z.coerce.number().int().nonnegative().default(2),
    NEWS_CLUSTER_SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.82),
    NEWS_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(120),
    // Consecutive failed fetches before a source is auto-flipped to
    // `healthStatus: 'disabled'`. See `news_sources` in the schema.
    NEWS_AUTO_DISABLE_FAILURE_THRESHOLD: z.coerce.number().int().positive().default(10),
    NEWS_DEFAULT_FETCH_INTERVAL_SECONDS: z.coerce.number().int().positive().default(900),

    // News Engine queue (Phase 2). Only meaningful when REDIS_URL is set;
    // see `queue/queue.module.ts` for the no-Redis fallback.
    NEWS_QUEUE_FETCH_CONCURRENCY: z.coerce.number().int().positive().default(5),
    NEWS_QUEUE_PROCESS_CONCURRENCY: z.coerce.number().int().positive().default(3),

    // News Engine classification (Phase 3). Overall confidence below this
    // threshold routes an article to the LLM fallback extension point
    // instead of being marked `classified`; see
    // `modules/news/classification/classification.service.ts`.
    NEWS_CLASSIFICATION_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.6),
    // Batch size cap for the CLI's "reclassify all ingested" command, so a
    // manual run is never unbounded.
    NEWS_CLASSIFICATION_BATCH_LIMIT: z.coerce.number().int().positive().default(100),

    // News Engine clustering (Phase 3.5). Weighted combination of headline
    // similarity, entity overlap and time proximity; see
    // `modules/news/clustering/similarity.ts`. Weights are expected to sum to
    // 1 but are not enforced to, since a deliberate experiment (e.g.
    // temporarily zeroing one signal) should not require also renormalising
    // the others by hand.
    NEWS_CLUSTERING_HEADLINE_WEIGHT: z.coerce.number().min(0).max(1).default(0.5),
    NEWS_CLUSTERING_ENTITY_WEIGHT: z.coerce.number().min(0).max(1).default(0.3),
    NEWS_CLUSTERING_TIME_WEIGHT: z.coerce.number().min(0).max(1).default(0.2),
    // How many hours apart two articles' publishedAt can be and still count
    // as plausibly the same story; see `timeProximity` in similarity.ts for
    // the decay curve. 72h covers a transfer saga breaking over a weekend.
    NEWS_CLUSTERING_TIME_WINDOW_HOURS: z.coerce.number().positive().default(72),
    // How many of a sport's most-recently-updated clusters a newly classified
    // article is compared against, so clustering never scans every cluster
    // ever created for that sport. See ClusteringRepository.findCandidateClusters.
    NEWS_CLUSTERING_CANDIDATE_LIMIT: z.coerce.number().int().positive().default(50),

    // News Engine importance/ranking (Phase 3.5). See
    // `modules/news/ranking/importance-scorer.ts` for the full formula.
    // Weights are point contributions toward the 0-10 score, not fractions of 1.
    NEWS_RANKING_SOURCE_AUTHORITY_WEIGHT: z.coerce.number().nonnegative().default(2.5),
    NEWS_RANKING_RECENCY_WEIGHT: z.coerce.number().nonnegative().default(2.5),
    NEWS_RANKING_ENTITY_IMPORTANCE_WEIGHT: z.coerce.number().nonnegative().default(2),
    NEWS_RANKING_TOPIC_IMPORTANCE_WEIGHT: z.coerce.number().nonnegative().default(1),
    NEWS_RANKING_SOURCE_COUNT_WEIGHT: z.coerce.number().nonnegative().default(1.5),
    NEWS_RANKING_BREAKING_BONUS: z.coerce.number().nonnegative().default(0.5),
    // Recency decays to (about) zero influence after this many hours; see
    // `computeRecencyScore`.
    NEWS_RANKING_RECENCY_HALF_LIFE_HOURS: z.coerce.number().positive().default(18),
  })
  .superRefine((config, ctx) => {
    if (config.NODE_ENV !== 'production') return;

    // Production-only guards. These are the settings that are harmless in
    // development and dangerous in production, so they fail closed rather
    // than relying on the deployer remembering.
    if (config.SWAGGER_ENABLED) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SWAGGER_ENABLED'],
        message: 'Swagger must be disabled in production, or the full API surface is public.',
      });
    }

    if (config.CORS_ORIGINS.some((origin) => origin.includes('localhost'))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGINS'],
        message: 'CORS_ORIGINS must not contain localhost in production.',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;
