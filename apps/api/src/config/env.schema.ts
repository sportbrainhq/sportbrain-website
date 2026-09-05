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

    // Internal/admin API stopgap auth (see
    // `common/guards/internal-api-key.guard.ts`). Protects only
    // `/internal/news/*`. Optional in the schema, but the guard FAILS CLOSED
    // when it is unset: every request to a protected route is rejected
    // rather than silently allowed through. This is a v1 shared-secret
    // stopgap, not a real auth/authz system.
    INTERNAL_API_KEY: z.string().min(1).optional(),

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

    // Contact & feedback. Public-facing addresses are configured here rather
    // than hard-coded, and only rendered on the frontend when set — see
    // `CONTACT_EMAILS` config below and `GET /v1/contact/config`. Unset means
    // "does not exist yet", not "empty string", so an address is never
    // displayed before it is real.
    CONTACT_EMAIL_GENERAL: z.string().email().optional(),
    CONTACT_EMAIL_CORRECTIONS: z.string().email().optional(),
    CONTACT_EMAIL_PARTNERSHIPS: z.string().email().optional(),
    CONTACT_EMAIL_PRESS: z.string().email().optional(),
    // Where the internal notification for every submission is sent. Falls
    // back to CONTACT_EMAIL_GENERAL when unset, so a deployment only has to
    // configure one address to get notifications flowing.
    CONTACT_INTERNAL_NOTIFY_EMAIL: z.string().email().optional(),
    CONTACT_RATE_LIMIT_TTL_SECONDS: z.coerce.number().int().positive().default(60),
    CONTACT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(3),

    // Accounts (Google OAuth + sessions). The only identity provider — see
    // `modules/auth/google-oauth.service.ts`. No sensible default exists for
    // any of these; an unconfigured auth system must fail to start, not run
    // half-configured.
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CALLBACK_URL: z.string().url(),

    // HMAC key that signs the session cookie value, so a tampered cookie is
    // rejected before it ever reaches the database. Generate with
    // `openssl rand -hex 32`. No default: a guessable or shared secret here
    // is a full account-takeover vector.
    SESSION_SECRET: z.string().min(32),
    SESSION_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(60 * 60 * 24 * 30),
    // Shared parent domain for the session cookie, e.g. `.sportbrainhq.com`,
    // so the web and API origins can both read it. Unset means host-only,
    // which is correct for local development (same host, different ports
    // don't need cookie sharing beyond what SameSite already allows).
    COOKIE_DOMAIN: z.string().optional(),

    // The web app's origin. Required, and the only value `next`/`resume`
    // redirect targets are ever allowed to point at — see
    // `common/security/safe-redirect.ts`. A wrong or missing value here is an
    // open-redirect risk, not just a broken redirect.
    FRONTEND_URL: z.string().url(),

    // Quiz platform (Phase C). Question counts per mode: config-driven per
    // Part 2's explicit instruction ("do not scatter constants through
    // components"). Defaults match the spec exactly; override only to
    // experiment.
    QUIZ_SPORT_QUICK_COUNT: z.coerce.number().int().positive().default(5),
    QUIZ_SPORT_STANDARD_COUNT: z.coerce.number().int().positive().default(10),
    QUIZ_SPORT_CHALLENGE_COUNT: z.coerce.number().int().positive().default(20),
    QUIZ_MASTER_QUICK_COUNT: z.coerce.number().int().positive().default(10),
    QUIZ_MASTER_STANDARD_COUNT: z.coerce.number().int().positive().default(20),
    QUIZ_MASTER_MARATHON_COUNT: z.coerce.number().int().positive().default(50),

    // Target difficulty distribution for sport quizzes (Part 24). Expected
    // to sum to 1 but not enforced to, same reasoning as the news clustering
    // weights above: a deliberate experiment with the mix shouldn't require
    // hand-renormalising the rest.
    QUIZ_DIFFICULTY_EASY_WEIGHT: z.coerce.number().min(0).max(1).default(0.3),
    QUIZ_DIFFICULTY_MEDIUM_WEIGHT: z.coerce.number().min(0).max(1).default(0.4),
    QUIZ_DIFFICULTY_HARD_WEIGHT: z.coerce.number().min(0).max(1).default(0.25),
    QUIZ_DIFFICULTY_EXPERT_WEIGHT: z.coerce.number().min(0).max(1).default(0.05),

    // No-repetition policy cooldowns (Part 27). A question answered correctly
    // is eligible to repeat after the longer window; answered incorrectly,
    // the shorter one — a wrong answer is exactly the thing worth
    // re-testing sooner.
    QUIZ_CORRECT_COOLDOWN_DAYS: z.coerce.number().int().positive().default(90),
    QUIZ_INCORRECT_COOLDOWN_DAYS: z.coerce.number().int().positive().default(14),

    // An IN_PROGRESS attempt untouched for this long is treated as expired on
    // next read (Part 29's EXPIRED status) rather than resumable forever.
    QUIZ_ATTEMPT_EXPIRY_HOURS: z.coerce.number().int().positive().default(48),

    // Minimum answered-question sample size before a category/monthly
    // "strongest category" insight is shown at all (Part 50) — never label
    // someone from two data points.
    QUIZ_STATS_MIN_CATEGORY_SAMPLE: z.coerce.number().int().positive().default(10),

    // Reports a question needs to accumulate before it's auto-flagged
    // REVIEW_REQUIRED for an editor to look at (Part 45-46) — never
    // auto-unpublished, only flagged.
    QUESTION_REPORT_FLAG_THRESHOLD: z.coerce.number().int().positive().default(5),
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

    if (config.FRONTEND_URL.includes('localhost')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['FRONTEND_URL'],
        message: 'FRONTEND_URL must not be localhost in production.',
      });
    }

    if (!config.COOKIE_DOMAIN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COOKIE_DOMAIN'],
        message: 'COOKIE_DOMAIN must be set in production, or the session cookie is host-only.',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;
