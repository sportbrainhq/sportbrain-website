/**
 * Seeds the statistic registry and derives what statistics the current data can
 * actually support.
 *
 * ```bash
 * pnpm --filter @sportbrain/api seed
 * ```
 *
 * Idempotent by design: run it after every deploy or ingestion. Definitions are
 * upserted on their natural key, and derived statistics are recomputed from the
 * base data rather than incremented, so running twice changes nothing.
 *
 * ## What "derived" means here, and its limits
 *
 * Wikidata holds no match statistics, so most registry keys have no values and
 * will not until a paid feed arrives. Two things can honestly be computed from
 * what is already stored, and only two:
 *
 *   - **Honours won**, counted from the honour table.
 *   - **Career span**, from a person's team memberships.
 *
 * Everything else is left absent rather than estimated. A statistics panel that
 * shows two real numbers is worth more than one showing twenty invented ones,
 * and an invented number is impossible to distinguish from a real one once it
 * is in the database.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadConfiguration } from '../../config/configuration';
import * as schema from '../schema';
import { EXPLAINERS, SPORT_OVERVIEWS } from './editorial';
import { COMPETITION_SECTIONS, TEAM_SECTIONS } from './entity-editorial';
import {
  FOOTBALL_GOVERNANCE,
  FOOTBALL_SECTIONS,
  FOOTBALL_SOURCES,
  FOOTBALL_TIMELINE,
} from './football-overview';
import { STATISTIC_REGISTRY } from './statistic-registry';

for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

async function main(): Promise<void> {
  const config = loadConfiguration();
  const client = postgres(config.database.url, { max: 2, onnotice: () => {} });
  const db = drizzle(client, { schema });

  try {
    const definitions = await seedRegistry(db);
    process.stdout.write(`Registry: ${definitions} definitions upserted\n`);

    const honours = await deriveHonourCounts(db);
    process.stdout.write(`Derived:  ${honours} honour counts written\n`);

    const spans = await deriveCareerSpans(db);
    process.stdout.write(`Derived:  ${spans} career spans written\n`);

    const overviews = await seedOverviews(db);
    process.stdout.write(`Content:  ${overviews} sport overviews written\n`);

    const explainers = await seedExplainers(db);
    process.stdout.write(`Content:  ${explainers} explainers published\n`);

    const entitySections = await seedEntitySections(db);
    process.stdout.write(`Content:  ${entitySections} entity sections published\n`);

    const overview = await seedFootballOverview(db);
    process.stdout.write(
      `Overview: ${overview.sources} sources, ${overview.timeline} timeline events, ` +
        `${overview.bodies} governing bodies, ${overview.sections} sections\n`,
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  } finally {
    await client.end({ timeout: 5 });
  }
}

type Db = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Upserts every definition.
 *
 * Conflict targets differ by whether the definition is sport-wide, because the
 * schema guards those two cases with different partial unique indexes: Postgres
 * treats nulls as distinct, so one index cannot cover both.
 */
async function seedRegistry(db: Db): Promise<number> {
  let count = 0;

  for (const [sportSlug, definitions] of Object.entries(STATISTIC_REGISTRY)) {
    const [sportRow] = await db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = ${sportSlug} LIMIT 1`,
    );
    if (!sportRow) {
      process.stdout.write(`  skipped ${sportSlug}: not in the database\n`);
      continue;
    }

    for (const definition of definitions) {
      // Resolved per definition rather than cached, because a missing
      // discipline should skip only its own row and not the whole sport.
      let disciplineId: string | null = null;
      if (definition.discipline) {
        const [row] = await db.execute<{ id: string }>(
          sql`SELECT id FROM discipline
              WHERE sport_id = ${sportRow.id} AND key = ${definition.discipline}
              LIMIT 1`,
        );
        if (!row) {
          process.stdout.write(
            `  skipped ${sportSlug}.${definition.key}: no discipline "${definition.discipline}"\n`,
          );
          continue;
        }
        disciplineId = row.id;
      }

      const conflictTarget = disciplineId
        ? sql`(sport_id, discipline_id, key)`
        : sql`(sport_id, key) WHERE discipline_id IS NULL`;

      await db.execute(sql`
        INSERT INTO statistic_definition (
          sport_id, discipline_id, key, label, short_label, applies_to, category,
          aggregation, format, precision, higher_is_better, display_order,
          is_headline, description, formula
        ) VALUES (
          ${sportRow.id}, ${disciplineId}, ${definition.key}, ${definition.label},
          ${definition.shortLabel ?? null}, ${definition.appliesTo}, ${definition.category},
          ${definition.aggregation}, ${definition.format}, ${definition.precision ?? 0},
          ${definition.higherIsBetter ?? true}, ${definition.displayOrder},
          ${definition.isHeadline ?? false}, ${definition.description},
          ${definition.formula ? JSON.stringify(definition.formula) : null}
        )
        ON CONFLICT ${conflictTarget} DO UPDATE SET
          label = EXCLUDED.label,
          short_label = EXCLUDED.short_label,
          applies_to = EXCLUDED.applies_to,
          category = EXCLUDED.category,
          aggregation = EXCLUDED.aggregation,
          format = EXCLUDED.format,
          precision = EXCLUDED.precision,
          higher_is_better = EXCLUDED.higher_is_better,
          display_order = EXCLUDED.display_order,
          is_headline = EXCLUDED.is_headline,
          description = EXCLUDED.description,
          formula = EXCLUDED.formula,
          updated_at = now()
      `);
      count += 1;
    }
  }

  return count;
}

/**
 * Counts honours per person and per team into their statistics rows.
 *
 * One of only two statistics the current data genuinely supports. Written to
 * the `career` scope with a null discipline, because an honour belongs to a
 * career rather than to a format.
 *
 * The JSONB payload is merged rather than replaced, so this cannot destroy
 * values a future feed has written alongside it.
 */
async function deriveHonourCounts(db: Db): Promise<number> {
  const people = await db.execute<{ count: string }>(sql`
    WITH counts AS (
      SELECT person_id, sport_id, count(*) AS honours
      FROM honour WHERE person_id IS NOT NULL
      GROUP BY person_id, sport_id
    )
    INSERT INTO person_statistic (person_id, sport_id, scope, discipline_id, stats, computed_at)
    SELECT person_id, sport_id, 'career', NULL,
           jsonb_build_object('honours_won', honours), now()
    FROM counts
    -- Must mirror the index expressions exactly, coalescing included, or
    -- Postgres cannot match the constraint and the statement fails.
    ON CONFLICT (
      person_id, scope,
      coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
      coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
      coalesce(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
      coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
    )
    DO UPDATE SET
      stats = person_statistic.stats || EXCLUDED.stats,
      computed_at = now()
    RETURNING 1 AS count
  `);

  const teams = await db.execute<{ count: string }>(sql`
    WITH counts AS (
      SELECT team_id, sport_id, count(*) AS honours
      FROM honour WHERE team_id IS NOT NULL
      GROUP BY team_id, sport_id
    )
    INSERT INTO team_statistic (team_id, sport_id, scope, discipline_id, stats, computed_at)
    SELECT team_id, sport_id, 'career', NULL,
           jsonb_build_object('titles_won', honours), now()
    FROM counts
    ON CONFLICT (
      team_id, scope,
      coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
      coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
      coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
    )
    DO UPDATE SET
      stats = team_statistic.stats || EXCLUDED.stats,
      computed_at = now()
    RETURNING 1 AS count
  `);

  return people.length + teams.length;
}

/**
 * Records the first and last year a person is known to have been at a club.
 *
 * Written into `person.attributes` rather than into a statistics row, because a
 * career span is biographical rather than statistical: it is not a quantity
 * anybody aggregates or ranks by.
 */
async function deriveCareerSpans(db: Db): Promise<number> {
  const rows = await db.execute<{ count: string }>(sql`
    WITH spans AS (
      SELECT person_id,
             min(extract(year from start_date))::int AS first_year,
             max(coalesce(extract(year from end_date), extract(year from now())))::int AS last_year
      FROM person_team
      WHERE start_date IS NOT NULL
      GROUP BY person_id
    )
    UPDATE person p
    SET attributes = p.attributes || jsonb_build_object(
          'careerStart', s.first_year,
          'careerEnd', s.last_year
        ),
        updated_at = now()
    FROM spans s
    WHERE p.id = s.person_id
    RETURNING 1 AS count
  `);

  return rows.length;
}

/**
 * Writes each sport's overview prose.
 *
 * Stored twice on purpose: on `sport.summary`, where the Overview tab and page
 * metadata read it, and as a `content` row of type `overview`, so it sits in the
 * same table as everything else editorial and can be edited through the same
 * tooling when that exists.
 */
async function seedOverviews(db: Db): Promise<number> {
  let count = 0;

  for (const [slug, summary] of Object.entries(SPORT_OVERVIEWS)) {
    const [sportRow] = await db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = ${slug} LIMIT 1`,
    );
    if (!sportRow) continue;

    // Only written when absent, never overwritten: this is a starting point for
    // an editor, and a seed run must not discard their revisions.
    await db.execute(sql`
      UPDATE sport SET summary = ${summary}, updated_at = now()
      WHERE id = ${sportRow.id} AND summary IS NULL
    `);

    await db.execute(sql`
      INSERT INTO content (sport_id, type, slug, title, excerpt, body, status, published_at)
      VALUES (
        ${sportRow.id}, 'overview', ${`${slug}-overview`},
        ${`About ${slug.replace('-', ' ')}`}, ${summary}, ${summary}, 'published', now()
      )
      ON CONFLICT (type, slug) DO UPDATE SET
        excerpt = EXCLUDED.excerpt, updated_at = now()
    `);
    count += 1;
  }

  return count;
}

/** Publishes the starter explainers. */
async function seedExplainers(db: Db): Promise<number> {
  let count = 0;

  for (const [sportSlug, explainers] of Object.entries(EXPLAINERS)) {
    const [sportRow] = await db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = ${sportSlug} LIMIT 1`,
    );
    if (!sportRow) continue;

    for (const explainer of explainers) {
      await db.execute(sql`
        INSERT INTO content (
          sport_id, type, slug, title, excerpt, body, category,
          display_order, status, published_at
        ) VALUES (
          ${sportRow.id}, 'explainer', ${explainer.slug}, ${explainer.title},
          ${explainer.excerpt}, ${explainer.body}, ${explainer.category},
          ${explainer.displayOrder}, 'published', now()
        )
        ON CONFLICT (type, slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          body = EXCLUDED.body,
          category = EXCLUDED.category,
          display_order = EXCLUDED.display_order,
          updated_at = now()
      `);
      count += 1;
    }
  }

  return count;
}

/**
 * Publishes the authored sections for flagship entities.
 *
 * Written to `entity_section`, which enrichment never touches, so an ingestion
 * run cannot overwrite a paragraph somebody wrote.
 */
async function seedEntitySections(db: Db): Promise<number> {
  let count = 0;

  const groups: [string, Record<string, (typeof TEAM_SECTIONS)[string]>][] = [
    ['team', TEAM_SECTIONS],
    ['competition', COMPETITION_SECTIONS],
  ];

  for (const [entityType, bySlug] of groups) {
    for (const [slug, sections] of Object.entries(bySlug)) {
      const [row] = await db.execute<{ id: string }>(
        sql`SELECT id FROM ${sql.raw(entityType)} WHERE slug = ${slug} LIMIT 1`,
      );
      if (!row) {
        process.stdout.write(`  skipped ${entityType} "${slug}": not in the database\n`);
        continue;
      }

      for (const section of sections) {
        await db.execute(sql`
          INSERT INTO entity_section (
            entity_type, entity_id, kind, heading, body, status, display_order
          ) VALUES (
            ${entityType}, ${row.id}, ${section.kind}, ${section.heading},
            ${section.body}, 'published', ${section.order}
          )
          ON CONFLICT (entity_type, entity_id, kind) DO UPDATE SET
            heading = EXCLUDED.heading,
            body = EXCLUDED.body,
            display_order = EXCLUDED.display_order,
            updated_at = now()
        `);
        count += 1;
      }
    }
  }

  return count;
}

/**
 * The football overview: sources, timeline, governance and authored sections.
 *
 * Idempotent throughout. Every write is an upsert on a natural key, so running
 * the seeder twice refreshes content rather than duplicating it, and a source
 * that temporarily returns nothing cannot wipe good rows.
 */
/**
 * Renders a string list as a Postgres text array literal.
 *
 * Drizzle expands a bound JS array into a comma-separated record list, which is
 * right for `VALUES` and wrong for `= ANY (...)`. Building the literal keeps the
 * quoting in one place; every caller passes values this file owns, and the
 * escaping below is what stops a stray quote from breaking the statement.
 */
function pgTextArray(values: string[]): string {
  const escaped = values.map((value) => `'${value.replaceAll("'", "''")}'`);
  return `ARRAY[${escaped.join(', ')}]::text[]`;
}

async function seedFootballOverview(db: Db): Promise<{
  sources: number;
  timeline: number;
  bodies: number;
  sections: number;
}> {
  const [sportRow] = await db.execute<{ id: string }>(
    sql`SELECT id FROM sport WHERE slug = 'football' LIMIT 1`,
  );
  if (!sportRow) return { sources: 0, timeline: 0, bodies: 0, sections: 0 };

  // Sources first: the timeline and governance rows reference them.
  const sourceIds = new Map<string, string>();
  for (const source of FOOTBALL_SOURCES) {
    const [row] = await db.execute<{ id: string }>(sql`
      INSERT INTO content_source (provider, title, url, external_id, license, retrieved_at)
      VALUES (${source.provider}, ${source.title}, ${source.url},
              ${source.externalId ?? null}, ${source.license ?? null}, now())
      ON CONFLICT (provider, url) DO UPDATE SET
        title = EXCLUDED.title,
        external_id = EXCLUDED.external_id,
        license = EXCLUDED.license,
        retrieved_at = now(),
        updated_at = now()
      RETURNING id
    `);
    if (row) sourceIds.set(source.key, row.id);
  }

  let timeline = 0;
  for (const [index, event] of FOOTBALL_TIMELINE.entries()) {
    await db.execute(sql`
      INSERT INTO sport_timeline_event (
        sport_id, year, end_year, title, short_description, category,
        is_major_milestone, certainty, source_id, display_order, status
      ) VALUES (
        ${sportRow.id}, ${event.year}, ${event.endYear ?? null}, ${event.title},
        ${event.shortDescription}, ${event.category},
        ${event.isMajorMilestone ? 'true' : 'false'}, ${event.certainty ?? 'established'},
        ${event.sourceKey ? (sourceIds.get(event.sourceKey) ?? null) : null},
        ${event.order ?? (index + 1) * 10}, 'published'
      )
      ON CONFLICT (sport_id, year, title) DO UPDATE SET
        end_year = EXCLUDED.end_year,
        short_description = EXCLUDED.short_description,
        category = EXCLUDED.category,
        is_major_milestone = EXCLUDED.is_major_milestone,
        certainty = EXCLUDED.certainty,
        source_id = EXCLUDED.source_id,
        display_order = EXCLUDED.display_order,
        updated_at = now()
    `);
    timeline += 1;
  }

  // Re-dating an event changes part of its natural key, so the upsert above
  // writes a new row and leaves the old one behind. Deleting what the seed no
  // longer defines is what makes this genuinely idempotent: without it the
  // timeline only ever grows, and a corrected date shows up twice.
  // Matched on the whole natural key, not the title alone: re-dating an event
  // keeps its title, so a title-only check would find the stale row still
  // "seeded" and leave both copies in place.
  // Separated by a control character rather than NUL: Postgres rejects NUL in
  // text values outright, and a printable separator could occur in a title.
  const seededKeys = FOOTBALL_TIMELINE.map((event) => `${event.year}\u001f${event.title}`);
  await db.execute(sql`
    DELETE FROM sport_timeline_event
    WHERE sport_id = ${sportRow.id}
      AND NOT (year::text || chr(31) || title = ANY (${sql.raw(pgTextArray(seededKeys))}))
  `);

  // Two passes: the world body must exist before a confederation can point at
  // it, and a single pass would leave the first parent reference unresolved.
  const bodyIds = new Map<string, string>();
  let bodies = 0;
  for (const pass of ['world', 'continental'] as const) {
    for (const body of FOOTBALL_GOVERNANCE.filter((entry) => entry.level === pass)) {
      const [row] = await db.execute<{ id: string }>(sql`
        INSERT INTO governing_body (
          sport_id, parent_id, slug, short_name, name, level, region,
          founded_year, member_count, headquarters, website_url, display_order
        ) VALUES (
          ${sportRow.id},
          ${body.parentSlug ? (bodyIds.get(body.parentSlug) ?? null) : null},
          ${body.slug}, ${body.shortName}, ${body.name}, ${body.level},
          ${body.region ?? null}, ${body.foundedYear ?? null}, ${body.memberCount ?? null},
          ${body.headquarters ?? null}, ${body.websiteUrl ?? null}, ${body.order ?? 100}
        )
        ON CONFLICT (sport_id, slug) DO UPDATE SET
          parent_id = EXCLUDED.parent_id,
          name = EXCLUDED.name,
          region = EXCLUDED.region,
          founded_year = EXCLUDED.founded_year,
          member_count = EXCLUDED.member_count,
          headquarters = EXCLUDED.headquarters,
          website_url = EXCLUDED.website_url,
          display_order = EXCLUDED.display_order,
          updated_at = now()
        RETURNING id
      `);
      if (row) bodyIds.set(body.slug, row.id);
      bodies += 1;
    }
  }

  const seededSlugs = FOOTBALL_GOVERNANCE.map((body) => body.slug);
  await db.execute(sql`
    DELETE FROM governing_body
    WHERE sport_id = ${sportRow.id}
      AND NOT (slug = ANY (${sql.raw(pgTextArray(seededSlugs))}))
  `);

  let sections = 0;
  for (const section of FOOTBALL_SECTIONS) {
    await db.execute(sql`
      INSERT INTO entity_section (
        entity_type, entity_id, kind, heading, body, status, display_order
      ) VALUES (
        'sport', ${sportRow.id}, ${section.kind}, ${section.heading},
        ${section.body}, 'published', ${section.order}
      )
      ON CONFLICT (entity_type, entity_id, kind) DO UPDATE SET
        heading = EXCLUDED.heading,
        body = EXCLUDED.body,
        display_order = EXCLUDED.display_order,
        updated_at = now()
    `);
    sections += 1;
  }

  // Sources are shared across sports, so this cannot prune by sport the way the
  // two above do. It removes only rows that nothing references at all, which is
  // what a moved URL leaves behind once its dependants have been repointed.
  await db.execute(sql`
    DELETE FROM content_source cs
    WHERE NOT EXISTS (SELECT 1 FROM sport_timeline_event e WHERE e.source_id = cs.id)
      AND NOT EXISTS (SELECT 1 FROM governing_body g WHERE g.source_id = cs.id)
      AND NOT (cs.url = ANY (${sql.raw(pgTextArray(FOOTBALL_SOURCES.map((source) => source.url)))}))
  `);

  return { sources: sourceIds.size, timeline, bodies, sections };
}

void main();
