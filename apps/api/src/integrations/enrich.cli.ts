/**
 * Deep-enriches individual entities.
 *
 * ```bash
 * pnpm --filter @sportbrain/api enrich teams football --limit=40
 * pnpm --filter @sportbrain/api enrich competitions football --limit=20
 * ```
 *
 * Separate from `ingest` because it works the other way round. Bulk ingestion
 * fetches many entities shallowly; this fetches one entity deeply, at several
 * queries each. That cost only makes sense for entities people actually visit,
 * so it runs against the most notable first and stops at a limit rather than
 * walking the whole catalogue.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadConfiguration } from '../config/configuration';
import type { DatabaseService } from '../database/database.service';
import * as schema from '../database/schema';
import { EnrichmentService } from './ingestion/enrichment.service';
import { WikidataProvider } from './providers/wikidata/wikidata.provider';

for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

async function main(): Promise<void> {
  const [, , entityType, sportSlug, ...flags] = process.argv;

  if (!entityType || !sportSlug) {
    process.stderr.write('Usage: enrich <teams|competitions|players> <sport-slug> [--limit=N]\n');
    process.exitCode = 1;
    return;
  }

  const limitFlag = flags.find((flag) => flag.startsWith('--limit='));
  const limit = limitFlag ? Number.parseInt(limitFlag.split('=')[1] ?? '', 10) : 20;

  // Enriching one named entity, which matters more than it sounds. The default
  // ordering is by how much is already known, and a newly ingested entity has
  // nothing, so it sorts last however high the limit is raised. FC Barcelona sat
  // outside the top forty for exactly that reason despite being among the most
  // searched clubs in the world.
  const slugFlag = flags.find((flag) => flag.startsWith('--slug='));
  const slug = slugFlag?.split('=')[1];

  const config = loadConfiguration();
  const client = postgres(config.database.url, { max: 2, onnotice: () => {} });
  const database = { db: drizzle(client, { schema }) } as unknown as DatabaseService;
  const enrichment = new EnrichmentService(database, new WikidataProvider());

  try {
    // Ordered by how much is already known about an entity, as a proxy for how
    // likely anybody is to visit it. A club with honours recorded is one people
    // have heard of, and enriching it first means a partial run still improves
    // the pages that matter.
    const table =
      entityType === 'competitions' ? 'competition' : entityType === 'players' ? 'person' : 'team';
    const sportColumn = table === 'person' ? 'primary_sport_id' : 'sport_id';

    const rows = await database.db.execute<{ id: string; qid: string; entity_name: string }>(sql`
      SELECT e.id, em.external_id AS qid,
             ${sql.raw(table === 'person' ? 'e.full_name' : 'e.name')} AS entity_name
      FROM ${sql.raw(table)} e
      JOIN external_mapping em
        ON em.entity_id = e.id
       AND em.provider = 'wikidata'
       AND em.entity_type = ${table}
      JOIN sport s ON s.id = e.${sql.raw(sportColumn)}
      ${sql.raw(
        table === 'competition'
          ? // Competitions carry no honours of their own, so counting them
            // orders every competition equally and the limit then selects
            // alphabetically: the first run enriched "1. deild" and four other
            // minor leagues. Tier is the column that actually encodes
            // importance, with the honours awarded *for* the competition as
            // the tiebreak, which is what puts the World Cup ahead of a
            // regional third tier.
            `LEFT JOIN honour h ON h.title ILIKE '%' || e.name || '%'`
          : `LEFT JOIN honour h ON h.${table === 'person' ? 'person_id' : 'team_id'} = e.id`,
      )}
      WHERE s.slug = ${sportSlug}
        AND (${slug ?? null}::text IS NULL OR e.slug = ${slug ?? null})
      GROUP BY e.id, em.external_id, entity_name${sql.raw(table === 'competition' ? ', e.tier' : '')}
      ORDER BY ${sql.raw(table === 'competition' ? 'e.tier ASC, count(h.id) DESC' : 'count(h.id) DESC')}, entity_name ASC
      LIMIT ${limit}
    `);

    process.stdout.write(`Enriching ${rows.length} ${entityType} for ${sportSlug}\n`);

    let facts = 0;
    let rankings = 0;

    for (const [index, row] of rows.entries()) {
      const result =
        entityType === 'competitions'
          ? await enrichment.enrichCompetition(row.id, row.qid)
          : entityType === 'players'
            ? await enrichment.enrichPerson(row.id, row.qid)
            : await enrichment.enrichTeam(row.id, row.qid);

      facts += 'facts' in result ? result.facts : 0;
      rankings += 'rankings' in result ? result.rankings : 0;

      // Progress on one line per entity: these runs take minutes, and silence
      // for minutes is indistinguishable from a hang.
      process.stdout.write(
        `  [${String(index + 1).padStart(3)}/${rows.length}] ${row.entity_name.slice(0, 40)}\n`,
      );
    }

    process.stdout.write(`Done: ${facts} facts, ${rankings} rankings\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  } finally {
    await client.end({ timeout: 5 });
  }
}

void main();
