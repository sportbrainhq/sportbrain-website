import { defineConfig } from 'drizzle-kit';

/**
 * drizzle-kit configuration.
 *
 * Used by `pnpm db:generate` (diff the schema against the migration history and
 * emit SQL) and `pnpm db:studio`. The application itself never reads this file.
 *
 * Generated SQL is committed and reviewed by hand. drizzle-kit is good at
 * producing a diff, but only a person can tell whether a column rename should
 * have been a drop-and-add or a data-preserving migration.
 */
export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Read directly here rather than through the config layer: drizzle-kit is
    // a CLI that runs outside the Nest application context.
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  // Never let the CLI apply a destructive change without being asked.
  strict: true,
});
