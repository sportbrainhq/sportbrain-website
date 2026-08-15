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
