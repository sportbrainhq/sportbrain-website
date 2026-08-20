/**
 * Adds the honours Wikidata does not have, from Wikipedia articles.
 *
 * ```bash
 * pnpm --filter @sportbrain/api backfill-honours football 400
 * ```
 *
 * Wikidata is the primary source for honours and is incomplete in a way a
 * reader notices immediately: it holds three of Cristiano Ronaldo's five
 * Ballons d'Or and omits Messi's 2022 World Cup Golden Ball entirely. The
 * article's honours section has both, because it is maintained by people who
 * follow the sport rather than by whoever last edited a structured statement.
 *
 * Additive, and it never removes a Wikidata honour: the two sources disagree by
 * omission rather than by contradiction, so the union is better than either.
 * Duplicates are prevented by the table's own unique index on person, title and
 * year, which means a repeat run is cheap and an honour recorded by both sources
 * lands once.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadConfiguration } from '../config/configuration';
import * as schema from '../database/schema';
import { WikipediaClient } from './providers/wikipedia/wikipedia.client';
import { WikipediaProvider } from './providers/wikipedia/wikipedia.provider';

for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

async function main(): Promise<void> {
  const [, , sportSlug = 'football', rawLimit] = process.argv;
  const limit = Number(rawLimit ?? 400);

  const config = loadConfiguration();
  const client = postgres(config.database.url, { max: 4, onnotice: () => {} });
  const db = drizzle(client, { schema });
  const provider = new WikipediaProvider(new WikipediaClient());

  try {
    // Needs the Wikipedia title, which is what the article is fetched by, so
    // people without one are skipped rather than guessed at from their name.
    const targets = await db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT p.id, m.external_id AS title, p.display_name AS name
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id
      JOIN external_mapping m
        ON m.entity_id = p.id AND m.entity_type = 'person' AND m.provider = 'wikipedia'
      WHERE s.slug = ${sportSlug}
      ORDER BY p.notability DESC NULLS LAST
      LIMIT ${limit}
    `);

    process.stdout.write(`${targets.length} players to read\n`);

    let added = 0;
    let read = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const honours = await provider.fetchFootballHonourList(target.title);
        read += 1;

        for (const honour of honours) {
          const result = await db.execute<{ id: string }>(sql`
            INSERT INTO honour (sport_id, person_id, kind, title, year, source)
            SELECT s.id, ${target.id}, 'award', ${honour.title}, ${honour.year}, 'wikipedia'
            FROM sport s WHERE s.slug = ${sportSlug}
            ON CONFLICT (person_id, title, year) WHERE person_id IS NOT NULL
            DO NOTHING
            RETURNING id
          `);
          if (result.length > 0) added += 1;
        }
      } catch (error) {
        process.stderr.write(
          `  ${target.name}: ${error instanceof Error ? error.message : String(error)}\n`,
        );
      }

      if ((index + 1) % 25 === 0) {
        process.stdout.write(`  ${index + 1}/${targets.length}  ${added} honours added\n`);
      }
    }

    process.stdout.write(
      `Done: ${added} honours added from ${read} articles.\n` + `Run the seed next to tier them.\n`,
    );
  } finally {
    await client.end({ timeout: 5 });
  }
}

void main();
