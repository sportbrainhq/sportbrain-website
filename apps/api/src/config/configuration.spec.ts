import { beforeEach, describe, expect, it } from 'vitest';
import { loadConfiguration } from './configuration';

/**
 * Configuration is the one thing that must be right before anything else can
 * run, so it is the piece worth testing at foundation stage.
 */
describe('loadConfiguration', () => {
  const validEnv = {
    NODE_ENV: 'development',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/sportbrain_web',
  };

  beforeEach(() => {
    for (const key of Object.keys(process.env)) {
      if (
        key.startsWith('DATABASE_') ||
        key.startsWith('RATE_LIMIT_') ||
        ['NODE_ENV', 'API_PORT', 'CORS_ORIGINS', 'SWAGGER_ENABLED', 'JOBS_ENABLED'].includes(key)
      ) {
        delete process.env[key];
      }
    }
  });

  it('applies defaults for everything except the database URL', () => {
    Object.assign(process.env, validEnv);

    const config = loadConfiguration();

    expect(config.port).toBe(4000);
    expect(config.database.poolMax).toBe(10);
    expect(config.rateLimit.limit).toBe(120);
    expect(config.jobs.enabled).toBe(false);
  });

  it('refuses to start without DATABASE_URL, rather than defaulting to one', () => {
    process.env.NODE_ENV = 'development';

    expect(() => loadConfiguration()).toThrow(/DATABASE_URL/);
  });

  it('rejects a malformed DATABASE_URL', () => {
    Object.assign(process.env, { ...validEnv, DATABASE_URL: 'not-a-connection-string' });

    expect(() => loadConfiguration()).toThrow(/DATABASE_URL/);
  });

  it('parses CORS_ORIGINS into a trimmed list', () => {
    Object.assign(process.env, {
      ...validEnv,
      CORS_ORIGINS: 'https://a.example , https://b.example',
    });

    expect(loadConfiguration().http.corsOrigins).toEqual([
      'https://a.example',
      'https://b.example',
    ]);
  });

  it('fails closed when Swagger is left enabled in production', () => {
    Object.assign(process.env, {
      ...validEnv,
      NODE_ENV: 'production',
      CORS_ORIGINS: 'https://sportbrainhq.com',
      SWAGGER_ENABLED: 'true',
    });

    expect(() => loadConfiguration()).toThrow(/Swagger must be disabled in production/);
  });

  it('rejects a localhost CORS origin in production', () => {
    Object.assign(process.env, {
      ...validEnv,
      NODE_ENV: 'production',
      SWAGGER_ENABLED: 'false',
      CORS_ORIGINS: 'http://localhost:3000',
    });

    expect(() => loadConfiguration()).toThrow(/must not contain localhost/);
  });

  it('accepts a correct production configuration', () => {
    Object.assign(process.env, {
      ...validEnv,
      NODE_ENV: 'production',
      SWAGGER_ENABLED: 'false',
      CORS_ORIGINS: 'https://sportbrainhq.com',
    });

    const config = loadConfiguration();

    expect(config.isProduction).toBe(true);
    expect(config.swagger.enabled).toBe(false);
  });
});
