/**
 * Standalone migration runner.
 *
 * Run explicitly (`pnpm db:migrate`) as a deployment step, never automatically
 * on application boot. Booting-and-migrating means N replicas racing to apply
 * the same DDL, and it couples a schema change to a restart.
 *
 * Exits non-zero on failure so a CI or deploy pipeline halts.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { loadConfiguration } from '../config/configuration';

// Runs outside the Nest application, so ConfigModule's .env loading does not
// apply. Load it here, checking the repository root first (where the shared
// .env lives) and then this app's own directory. In production the environment
// is supplied by the host and neither file exists, which is fine.
for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

async function main(): Promise<void> {
  const config = loadConfiguration();

  // drizzle-kit writes meta/_journal.json when the first migration is
  // generated. Until then there is nothing to apply, and that is a valid state
  // for the platform foundation rather than an error: CI runs this on every
  // pull request and should pass on a repository with no tables.
  if (!existsSync(resolve(process.cwd(), 'migrations/meta/_journal.json'))) {
    process.stdout.write('No migrations to apply.\n');
    return;
  }

  // A single connection, and `max: 1` because migrations must be serial.
  const client = postgres(config.database.url, {
    max: 1,
    ssl: config.database.ssl ? 'require' : false,
  });

  try {
    process.stdout.write('Applying migrations...\n');
    await migrate(drizzle(client), { migrationsFolder: './migrations' });
    process.stdout.write('Migrations applied.\n');
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `Migration failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
