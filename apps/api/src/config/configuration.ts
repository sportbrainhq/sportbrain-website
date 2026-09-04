import { envSchema, type Env } from './env.schema';

/**
 * Application configuration, grouped by concern.
 *
 * The flat environment is validated and then reshaped into namespaces, so
 * consumers ask for `config.get('database.poolMax')` rather than remembering
 * which raw variable name carries it. Renaming an environment variable then
 * touches this file only.
 */
export interface AppConfig {
  env: Env['NODE_ENV'];
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  port: number;

  database: {
    url: string;
    poolMax: number;
    ssl: boolean;
  };

  http: {
    corsOrigins: string[];
  };

  logging: {
    level: Env['LOG_LEVEL'];
  };

  rateLimit: {
    ttlSeconds: number;
    limit: number;
  };

  swagger: {
    enabled: boolean;
  };

  jobs: {
    enabled: boolean;
  };

  redis: {
    /** Undefined when unconfigured, which is the signal CacheModule uses to fall back to the in-memory cache. */
    url: string | undefined;
  };

  security: {
    /**
     * Shared-secret stopgap for `/internal/news/*`. Undefined when
     * unconfigured, which is the signal `InternalApiKeyGuard` uses to fail
     * closed (reject every request) rather than allow unauthenticated access
     * to operational data. See the guard's file header for the full v1
     * caveat.
     */
    internalApiKey: string | undefined;
  };

  news: {
    rss: {
      timeoutMs: number;
      maxResponseBytes: number;
      retryCount: number;
    };
    clusterSimilarityThreshold: number;
    cacheTtlSeconds: number;
    autoDisableFailureThreshold: number;
    defaultFetchIntervalSeconds: number;
    queue: {
      fetchConcurrency: number;
      processConcurrency: number;
    };
    classification: {
      confidenceThreshold: number;
      batchLimit: number;
    };
    clustering: {
      headlineWeight: number;
      entityWeight: number;
      timeWeight: number;
      /** Reuses the existing `NEWS_CLUSTER_SIMILARITY_THRESHOLD` env var (see `clusterSimilarityThreshold` above) rather than duplicating it under a new name. */
      similarityThreshold: number;
      timeWindowHours: number;
      candidateLimit: number;
    };
    ranking: {
      sourceAuthorityWeight: number;
      recencyWeight: number;
      entityImportanceWeight: number;
      topicImportanceWeight: number;
      sourceCountWeight: number;
      breakingBonus: number;
      recencyHalfLifeHours: number;
    };
  };
}

/**
 * Validates the process environment and builds the config tree.
 *
 * Registered as the sole `load` function on NestJS's ConfigModule, which calls
 * it once during bootstrap.
 */
export function loadConfiguration(): AppConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const report = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');

    // Thrown rather than logged: the logger is not configured yet at this
    // point in bootstrap, and starting with invalid config is never correct.
    throw new Error(`Invalid environment configuration:\n${report}`);
  }

  const env = parsed.data;

  return {
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
    port: env.API_PORT,

    database: {
      url: env.DATABASE_URL,
      poolMax: env.DATABASE_POOL_MAX,
      ssl: env.DATABASE_SSL,
    },

    http: {
      corsOrigins: env.CORS_ORIGINS,
    },

    logging: {
      level: env.LOG_LEVEL,
    },

    rateLimit: {
      ttlSeconds: env.RATE_LIMIT_TTL_SECONDS,
      limit: env.RATE_LIMIT_MAX,
    },

    swagger: {
      enabled: env.SWAGGER_ENABLED,
    },

    jobs: {
      enabled: env.JOBS_ENABLED,
    },

    redis: {
      url: env.REDIS_URL,
    },

    security: {
      internalApiKey: env.INTERNAL_API_KEY,
    },

    news: {
      rss: {
        timeoutMs: env.NEWS_RSS_TIMEOUT_MS,
        maxResponseBytes: env.NEWS_RSS_MAX_RESPONSE_BYTES,
        retryCount: env.NEWS_RSS_RETRY_COUNT,
      },
      clusterSimilarityThreshold: env.NEWS_CLUSTER_SIMILARITY_THRESHOLD,
      cacheTtlSeconds: env.NEWS_CACHE_TTL_SECONDS,
      autoDisableFailureThreshold: env.NEWS_AUTO_DISABLE_FAILURE_THRESHOLD,
      defaultFetchIntervalSeconds: env.NEWS_DEFAULT_FETCH_INTERVAL_SECONDS,
      queue: {
        fetchConcurrency: env.NEWS_QUEUE_FETCH_CONCURRENCY,
        processConcurrency: env.NEWS_QUEUE_PROCESS_CONCURRENCY,
      },
      classification: {
        confidenceThreshold: env.NEWS_CLASSIFICATION_CONFIDENCE_THRESHOLD,
        batchLimit: env.NEWS_CLASSIFICATION_BATCH_LIMIT,
      },
      clustering: {
        headlineWeight: env.NEWS_CLUSTERING_HEADLINE_WEIGHT,
        entityWeight: env.NEWS_CLUSTERING_ENTITY_WEIGHT,
        timeWeight: env.NEWS_CLUSTERING_TIME_WEIGHT,
        similarityThreshold: env.NEWS_CLUSTER_SIMILARITY_THRESHOLD,
        timeWindowHours: env.NEWS_CLUSTERING_TIME_WINDOW_HOURS,
        candidateLimit: env.NEWS_CLUSTERING_CANDIDATE_LIMIT,
      },
      ranking: {
        sourceAuthorityWeight: env.NEWS_RANKING_SOURCE_AUTHORITY_WEIGHT,
        recencyWeight: env.NEWS_RANKING_RECENCY_WEIGHT,
        entityImportanceWeight: env.NEWS_RANKING_ENTITY_IMPORTANCE_WEIGHT,
        topicImportanceWeight: env.NEWS_RANKING_TOPIC_IMPORTANCE_WEIGHT,
        sourceCountWeight: env.NEWS_RANKING_SOURCE_COUNT_WEIGHT,
        breakingBonus: env.NEWS_RANKING_BREAKING_BONUS,
        recencyHalfLifeHours: env.NEWS_RANKING_RECENCY_HALF_LIFE_HOURS,
      },
    },
  };
}
