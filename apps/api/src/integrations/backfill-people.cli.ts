/**
 * Ingests the people a records table names but the database does not hold.
 *
 * ```bash
 * pnpm --filter @sportbrain/api backfill-people football
 * ```
 *
 * The bulk person ingestion works from the top of Wikidata's notability
 * ordering downwards, which is the right default but leaves a specific gap: a
 * club's record appearance holder can be someone the global ordering has not
 * reached yet, and those are exactly the people a reader is looking at when
 * they open the club's page.
 *
 * This closes it from the other direction. Rather than fetching more of the
 * ordering and hoping, it takes the article titles the ranking tables actually
 * reference, resolves the ones we cannot already resolve, and ingests those.
 * The work is therefore bounded by what the site displays.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '../database/schema';

for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

/** Titles that are plainly not people, filtered before any request is made. */
const NOT_A_PERSON =
  /\b(season|F\.?C\.?|CF|AFC|United|City|League|Cup|Trophy|Stadium|list of|records and statistics)\b/i;

async function main(): Promise<void> {
  const [, , sportSlug = 'football', rawLimit] = process.argv;
  const limit = Number(rawLimit ?? 400);

  const client = postgres(process.env.DATABASE_URL ?? '', { max: 4 });
  const db = drizzle(client, { schema });

  try {
    const [sportRow] = await db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = ${sportSlug} LIMIT 1`,
    );
    if (!sportRow) {
      process.stderr.write(`No sport "${sportSlug}"\n`);
      process.exitCode = 1;
      return;
    }

    const rows = await db.execute<{ title: string }>(sql`
      SELECT DISTINCT e->>'link' AS title
      FROM entity_ranking r
      JOIN team t ON t.id = r.entity_id
      CROSS JOIN LATERAL jsonb_array_elements(r.entries) e
      WHERE r.kind IN ('most_appearances', 'top_scorers')
        AND t.sport_id = ${sportRow.id}
        AND e->>'link' IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM external_mapping m
          WHERE m.provider = 'wikipedia' AND m.entity_type = 'person'
            AND m.external_id = e->>'link'
        )
      LIMIT ${limit}
    `);

    const titles = rows
      .map((row) => row.title)
      .filter((title) => title && !title.includes('?') && !NOT_A_PERSON.test(title));

    process.stdout.write(`${rows.length} unresolved, ${titles.length} look like people\n`);

    let mapped = 0;
    const pending: { qid: string; title: string; asked: string }[] = [];

    // Batched through the Wikidata API rather than one request per title: the
    // endpoint accepts fifty titles at a time, which turns four hundred lookups
    // into eight requests.
    for (let index = 0; index < titles.length; index += 50) {
      const batch = titles.slice(index, index + 50);
      const url =
        'https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item' +
        `&format=json&redirects=1&titles=${batch.map(encodeURIComponent).join('|')}`;

      const response = await fetch(url, { headers: { 'User-Agent': 'SportBrainHQ/1.0' } });
      if (!response.ok) {
        process.stderr.write(`  batch ${index} failed: HTTP ${response.status}\n`);
        continue;
      }

      const payload = (await response.json()) as {
        query?: {
          pages?: Record<string, { title?: string; pageprops?: { wikibase_item?: string } }>;
          normalized?: { from: string; to: string }[];
          redirects?: { from: string; to: string }[];
        };
      };

      // A title we asked for may have been normalised or followed through a
      // redirect, so the page's own title need not match the one referenced by
      // the ranking table. Both mappings are recorded, otherwise the link stays
      // unresolvable even though the person now exists.
      const askedFor = new Map<string, string>();
      for (const step of [
        ...(payload.query?.normalized ?? []),
        ...(payload.query?.redirects ?? []),
      ]) {
        askedFor.set(step.to, askedFor.get(step.from) ?? step.from);
      }

      for (const page of Object.values(payload.query?.pages ?? {})) {
        const qid = page.pageprops?.wikibase_item;
        const pageTitle = page.title;
        if (!qid || !pageTitle) continue;

        const [person] = await db.execute<{ id: string }>(
          sql`SELECT entity_id AS id FROM external_mapping
              WHERE provider = 'wikidata' AND entity_type = 'person' AND external_id = ${qid}
              LIMIT 1`,
        );
        if (!person) {
          // Referenced by a records table but absent from the database. These
          // are the people the notability ordering has not reached: a club's
          // record holder is often less globally notable than the ordering's
          // cut-off, which is exactly the gap a club page exposes.
          pending.push({ qid, title: pageTitle, asked: askedFor.get(pageTitle) ?? pageTitle });
          continue;
        }

        for (const title of new Set([pageTitle, askedFor.get(pageTitle) ?? pageTitle])) {
          await db.execute(sql`
            INSERT INTO external_mapping (provider, entity_type, external_id, entity_id, match_method, match_confidence)
            VALUES ('wikipedia', 'person', ${title}, ${person.id}, 'deterministic', 1)
            ON CONFLICT (provider, entity_type, external_id) DO NOTHING
          `);
          mapped += 1;
        }
      }

      await new Promise((wait) => setTimeout(wait, 1_500));
    }

    process.stdout.write(`Mapped ${mapped} titles. ${pending.length} people to create.\n`);

    // Details for the missing people, fetched from Wikidata in batches and
    // written directly. Going through the bulk ingestion would mean paging the
    // global ordering until it happened to reach them, which for a club's
    // record holder can be tens of thousands of rows deep.
    let written = 0;
    for (let index = 0; index < pending.length; index += 50) {
      const batch = pending.slice(index, index + 50);
      const values = batch.map((entry) => `wd:${entry.qid}`).join(' ');

      const query = `
SELECT ?item ?itemLabel ?sitelinks
       (SAMPLE(?birth) AS ?birthDate) (SAMPLE(?death) AS ?deathDate)
       (SAMPLE(?natLabel) AS ?nationality) (SAMPLE(?image) AS ?imageUrl)
       (SAMPLE(?posLabel) AS ?position)
WHERE {
  VALUES ?item { ${values} }
  ?item wikibase:sitelinks ?sitelinks .
  OPTIONAL { ?item rdfs:label ?itemLabel . FILTER(LANG(?itemLabel) = "en") }
  OPTIONAL { ?item wdt:P569 ?birth } OPTIONAL { ?item wdt:P570 ?death }
  OPTIONAL { ?item wdt:P27 ?ni . ?ni rdfs:label ?natLabel . FILTER(LANG(?natLabel) = "en") }
  OPTIONAL { ?item wdt:P18 ?image }
  OPTIONAL { ?item wdt:P413 ?pi . ?pi rdfs:label ?posLabel . FILTER(LANG(?posLabel) = "en") }
}
GROUP BY ?item ?itemLabel ?sitelinks`.trim();

      let bindings: Record<string, { value: string }>[] = [];
      try {
        const response = await fetch(
          'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query),
          {
            headers: {
              'User-Agent': 'SportBrainHQ/1.0',
              Accept: 'application/sparql-results+json',
            },
            signal: AbortSignal.timeout(70_000),
          },
        );
        if (!response.ok) {
          process.stderr.write(`  detail batch ${index} failed: HTTP ${response.status}\n`);
          continue;
        }
        bindings = ((await response.json()) as { results: { bindings: [] } }).results.bindings;
      } catch (error) {
        process.stderr.write(
          `  detail batch ${index} failed: ${error instanceof Error ? error.message : String(error)}\n`,
        );
        continue;
      }

      const byQid = new Map(batch.map((entry) => [entry.qid, entry]));

      for (const row of bindings) {
        const qid = row.item?.value.split('/').pop() ?? '';
        const entry = byQid.get(qid);
        // The English label is optional, not required. Several Wikidata items
        // carry sitelinks and statements without one, and requiring it dropped
        // them from the result with no error: Carles Puyol, Sergio Ramos and
        // Luka Modrić were all missing for exactly this reason. The article
        // title we resolved the QID from is a good name when the label is
        // absent.
        const name = row.itemLabel?.value ?? entry?.asked ?? entry?.title;
        if (!entry || !name) continue;

        const slug = name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        const birth = row.birthDate?.value?.slice(0, 10);
        const death = row.deathDate?.value?.slice(0, 10);
        const isDate = (value?: string) =>
          value && /^-?\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;

        const [created] = await db.execute<{ id: string }>(sql`
          INSERT INTO person (
            primary_sport_id, slug, full_name, display_name, date_of_birth, date_of_death,
            nationality, image_url, attributes, notability, confidence
          ) VALUES (
            ${sportRow.id}, ${slug}, ${name}, ${name}, ${isDate(birth)}, ${isDate(death)},
            ${row.nationality?.value ?? null}, ${row.imageUrl?.value ?? null},
            ${JSON.stringify(row.position?.value ? { position: row.position.value } : {})}::jsonb,
            ${Number(row.sitelinks?.value ?? 0)}, 'provisional'
          )
          ON CONFLICT (primary_sport_id, slug) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            notability = EXCLUDED.notability,
            updated_at = now()
          RETURNING id
        `);
        if (!created) continue;

        await db.execute(sql`
          INSERT INTO external_mapping (provider, entity_type, external_id, entity_id, match_method, match_confidence)
          VALUES ('wikidata', 'person', ${qid}, ${created.id}, 'deterministic', 1)
          ON CONFLICT (provider, entity_type, external_id) DO NOTHING
        `);

        for (const title of new Set([entry.title, entry.asked])) {
          await db.execute(sql`
            INSERT INTO external_mapping (provider, entity_type, external_id, entity_id, match_method, match_confidence)
            VALUES ('wikipedia', 'person', ${title}, ${created.id}, 'deterministic', 1)
            ON CONFLICT (provider, entity_type, external_id) DO NOTHING
          `);
        }

        written += 1;
      }

      await new Promise((wait) => setTimeout(wait, 1_000));
    }

    process.stdout.write(`Created ${written} people.\n`);
  } finally {
    await client.end({ timeout: 5 });
  }
}

void main();
