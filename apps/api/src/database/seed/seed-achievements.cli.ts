/**
 * Seeds `achievement_definition` (Phase E).
 *
 * ```bash
 * pnpm --filter @sportbrain/api seed:achievements
 * ```
 *
 * Idempotent by design: upserts on `code`, the immutable identity (Part 73).
 * Safe to re-run after every deploy — a definition already earned by real
 * users is only ever updated in its presentation fields
 * (`name`/`description`/`iconKey`/`displayOrder`/`isActive`); this seed never
 * changes `criteriaType`/`criteriaConfig` for a `code` that already exists,
 * only inserts it the first time.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadConfiguration } from '../../config/configuration';
import * as schema from '../schema';
import {
  ACHIEVEMENT_DEFINITIONS,
  buildSportAchievements,
} from '../../modules/passport/achievement-definitions.seed';

for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

async function main(): Promise<void> {
  const config = loadConfiguration();
  const client = postgres(config.database.url, { max: 2, onnotice: () => {} });
  const db = drizzle(client, { schema });

  try {
    const sports = await db
      .select({ slug: schema.sport.slug, name: schema.sport.name })
      .from(schema.sport)
      .where(eq(schema.sport.isLaunched, true));

    const rows = [...ACHIEVEMENT_DEFINITIONS, ...buildSportAchievements(sports)];

    let inserted = 0;
    let updated = 0;
    for (const row of rows) {
      const [existing] = await db
        .select({ id: schema.achievementDefinition.id })
        .from(schema.achievementDefinition)
        .where(eq(schema.achievementDefinition.code, row.code))
        .limit(1);

      if (existing) {
        await db
          .update(schema.achievementDefinition)
          .set({
            name: row.name,
            description: row.description,
            category: row.category,
            tier: row.tier,
            iconKey: row.iconKey,
            isActive: row.isActive ?? true,
            isHidden: row.isHidden ?? false,
            displayOrder: row.displayOrder,
            updatedAt: new Date(),
          })
          .where(eq(schema.achievementDefinition.id, existing.id));
        updated++;
      } else {
        await db.insert(schema.achievementDefinition).values(row);
        inserted++;
      }
    }

    // eslint-disable-next-line no-console
    console.log(
      `Achievement definitions: ${inserted} inserted, ${updated} updated (${rows.length} total).`,
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('seed:achievements failed', error);
  process.exit(1);
});
