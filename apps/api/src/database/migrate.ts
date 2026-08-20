/**
 * Standalone migration runner.
 *
 * Run explicitly (`pnpm db:migrate`) as a deployment step, never automatically
 * on application boot. Booting-and-migrating means N replicas racing to apply
 * the same DDL, and it couples a schema change to a restart.
 *
 * Exits non-zero on failure so a CI or deploy pipeline halts.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
    // Checked before applying, because the failure this catches is silent.
    // drizzle applies migrations in journal order but decides what is
    // outstanding by comparing timestamps, so an entry whose `when` is earlier
    // than one already applied is treated as done and skipped without a word.
    //
    // That is not hypothetical: 0013 and 0014 were hand-written with round
    // future timestamps, which put 0015 apparently in the past, and
    // `db:migrate` reported success while its column never existed. A skipped
    // migration that reports success surfaces much later and somewhere worse.
    assertJournalOrdered();

    process.stdout.write('Applying migrations...\n');
    await migrate(drizzle(client), { migrationsFolder: './migrations' });
    process.stdout.write('Migrations applied.\n');

    await assertNothingOutstanding(client);
  } finally {
    await client.end();
  }
}

/**
 * Fails if the journal's timestamps do not increase with its order.
 *
 * The two must agree. `idx` decides the order migrations run in and `when`
 * decides which are considered outstanding, so an entry that is later by one
 * measure and earlier by the other is invisible to the migrator.
 */
function assertJournalOrdered(): void {
  const journalPath = resolve(process.cwd(), 'migrations/meta/_journal.json');
  const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as {
    entries: { idx: number; when: number; tag: string }[];
  };

  const entries = [...journal.entries].sort((a, b) => a.idx - b.idx);

  for (let index = 1; index < entries.length; index += 1) {
    const previous = entries[index - 1]!;
    const current = entries[index]!;

    if (current.when <= previous.when) {
      throw new Error(
        `Journal timestamps are out of order: "${current.tag}" (when=${current.when}) is not ` +
          `after "${previous.tag}" (when=${previous.when}). drizzle would skip it silently. ` +
          `Raise the later migration's "when" in migrations/meta/_journal.json.`,
      );
    }
  }
}

/**
 * Fails if any migration file is still unapplied after the run.
 *
 * The belt to the braces above. Whatever the reason a migration was skipped,
 * this notices, because it compares the folder against the ledger rather than
 * trusting the migrator's own account of what it did.
 */
async function assertNothingOutstanding(client: ReturnType<typeof postgres>): Promise<void> {
  const rows = await client<{ hash: string }[]>`SELECT hash FROM drizzle.__drizzle_migrations`;
  const applied = new Set(rows.map((row) => row.hash));

  const folder = resolve(process.cwd(), 'migrations');
  const files = readdirSync(folder)
    .filter((name) => name.endsWith('.sql'))
    .sort();

  const missing = files.filter((name) => {
    const hash = createHash('sha256')
      .update(readFileSync(resolve(folder, name), 'utf8'))
      .digest('hex');
    return !applied.has(hash);
  });

  if (missing.length > 0) {
    throw new Error(
      `Migrations reported as applied but are absent from the ledger: ${missing.join(', ')}. ` +
        `The database does not have their changes.`,
    );
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `Migration failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
