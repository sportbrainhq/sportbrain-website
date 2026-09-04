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
    },
  };
}
