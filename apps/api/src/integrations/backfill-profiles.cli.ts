/**
 * Fills in the profile detail the top players are missing.
 *
 * ```bash
 * pnpm --filter @sportbrain/api backfill-profiles football 300
 * ```
 *
 * The bulk person ingestion writes a name, a notability score and a handful of
 * attributes, which is enough for a list and not enough for a page. Measured
 * across the top 300 football players: 148 had any facts, 85 had any honours,
 * 208 had any club history. Zidane had none of the three, so his profile showed
 * a height, a position and a stale "Current club" that he left in 2001.
 *
 * This walks the priority order and fills all three from Wikidata, which is the
 * same source and the same queries the enrichment service already uses; what was
 * missing was anything that applied them to people rather than to teams.
 *
 * Ordered by priority and idempotent, so an interrupted run resumes usefully and
 * a repeat run is cheap: every write upserts on a natural key.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadConfiguration } from '../config/configuration';
import * as schema from '../database/schema';
import { WikidataProvider } from './providers/wikidata/wikidata.provider';

for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

/** Batch size for the Wikidata queries, which accept a VALUES list. */
const BATCH = 40;

async function main(): Promise<void> {
  const [, , sportSlug = 'football', rawLimit] = process.argv;
  const limit = Number(rawLimit ?? 300);

  const config = loadConfiguration();
  const client = postgres(config.database.url, { max: 4, onnotice: () => {} });
  const db = drizzle(client, { schema });
  const provider = new WikidataProvider();

  try {
    const targets = await db.execute<{ id: string; qid: string; name: string }>(sql`
      SELECT p.id, m.external_id AS qid, p.display_name AS name
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id
      JOIN external_mapping m
        ON m.entity_id = p.id AND m.entity_type = 'person' AND m.provider = 'wikidata'
      WHERE s.slug = ${sportSlug}
      ORDER BY p.notability DESC NULLS LAST
      LIMIT ${limit}
    `);

    process.stdout.write(`${targets.length} players to enrich\n`);

    let facts = 0;
    let honours = 0;
    let spells = 0;

    for (let index = 0; index < targets.length; index += BATCH) {
      const batch = targets.slice(index, index + BATCH);
      const byQid = new Map(batch.map((row) => [row.qid, row]));
      const qids = batch.map((row) => row.qid);

      // Honours and memberships are batched; profile facts are per person,
      // because the provider's profile query returns one entity at a time.
      const [honourMap, membershipMap] = await Promise.all([
        provider.fetchHonours(qids).catch((error: unknown) => {
          process.stderr.write(`  honours batch ${index} failed: ${message(error)}\n`);
          return new Map<string, { title: string; year?: number }[]>();
        }),
        provider.fetchMemberships(qids).catch((error: unknown) => {
          process.stderr.write(`  memberships batch ${index} failed: ${message(error)}\n`);
          return new Map<
            string,
            { teamExternalId: string; teamName: string; start?: string; end?: string }[]
          >();
        }),
      ]);

      for (const [qid, entries] of honourMap) {
        const target = byQid.get(qid);
        if (!target) continue;

        for (const entry of entries) {
          // Keyed on the natural key the unique index uses, so a re-run updates
          // rather than duplicating. Prestige is left to the seed, which applies
          // the curated tiers in one pass.
          await db.execute(sql`
            INSERT INTO honour (sport_id, person_id, kind, title, year)
            SELECT s.id, ${target.id}, 'award', ${entry.title}, ${entry.year ?? null}
            FROM sport s WHERE s.slug = ${sportSlug}
            ON CONFLICT (person_id, title, year) WHERE person_id IS NOT NULL
            DO NOTHING
          `);
          honours += 1;
        }
      }

      for (const [qid, entries] of membershipMap) {
        const target = byQid.get(qid);
        if (!target) continue;

        for (const entry of entries) {
          // Only clubs already in the database. Creating a team from a
          // membership would import every youth and reserve side a player has
          // been attached to, which is noise on a profile and pollutes the
          // Teams tab.
          const [team] = await db.execute<{ id: string }>(sql`
            SELECT t.id FROM team t
            JOIN external_mapping m
              ON m.entity_id = t.id AND m.entity_type = 'team' AND m.provider = 'wikidata'
            WHERE m.external_id = ${entry.teamExternalId}
            LIMIT 1
          `);
          if (!team) continue;

          await db.execute(sql`
            INSERT INTO person_team (person_id, team_id, role, start_date, end_date)
            VALUES (${target.id}, ${team.id}, 'player',
                    ${entry.start ?? null}, ${entry.end ?? null})
            -- Must mirror person_team_unique_idx exactly, sentinel dates
            -- included, or Postgres cannot match the constraint. The role
            -- column is an enum and appears bare in the index; coalescing it to
            -- an empty string casts that to the enum and fails the statement.
            ON CONFLICT (
              person_id, team_id, role,
              coalesce(start_date, '1000-01-01'::date),
              coalesce(end_date, '9999-12-31'::date)
            ) DO NOTHING
          `);
          spells += 1;
        }
      }

      // Profile facts, one request each. Failures are per person so one bad
      // entity does not cost the batch.
      for (const target of batch) {
        try {
          const profile = await provider.fetchPlayerProfile(target.qid);
          for (const fact of profile) {
            if (!fact.value) continue;
            await db.execute(sql`
              INSERT INTO entity_fact (
                entity_type, entity_id, key, label, value, category, display_order, source
              ) VALUES (
                'person', ${target.id}, ${fact.key}, ${fact.label}, ${fact.value},
                ${fact.category}, ${fact.order}, 'wikidata'
              )
              -- The unique index covers the value as well as the key, so the
              -- same fact with a changed value is a new row rather than an
              -- update. Nothing to set here beyond touching the timestamp;
              -- superseded values are left for a later cleanup rather than
              -- deleted blind, since some keys legitimately hold several values.
              ON CONFLICT (entity_type, entity_id, key, value) DO UPDATE SET
                label = EXCLUDED.label,
                category = EXCLUDED.category,
                display_order = EXCLUDED.display_order,
                updated_at = now()
            `);
            facts += 1;
          }
        } catch (error) {
          process.stderr.write(`  ${target.name}: ${message(error)}\n`);
        }
      }

      process.stdout.write(
        `  ${Math.min(index + BATCH, targets.length)}/${targets.length}  ` +
          `${facts} facts, ${honours} honours, ${spells} spells\n`,
      );
    }

    process.stdout.write(
      `Done: ${facts} facts, ${honours} honours, ${spells} spells.\n` +
        `Run the seed next to tier the honours and set career statuses.\n`,
    );
  } finally {
    await client.end({ timeout: 5 });
  }
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

void main();
