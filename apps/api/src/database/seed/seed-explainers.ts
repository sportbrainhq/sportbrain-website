import { sql } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/postgres-js';
import type * as schema from '../schema';
import type { ExplainerCategorySeed, ExplainerSeed, SourceSeed } from './explainer-types';

type Db = ReturnType<typeof drizzle<typeof schema>>;

export interface ExplainerSeedResult {
  categories: number;
  explainers: number;
  published: number;
  sections: number;
  aliases: number;
  relations: number;
}

/**
 * Normalises a name for alias matching.
 *
 * Lowercased, accents stripped, punctuation removed and whitespace collapsed, so
 * that "Juego de Posición", "juego de posicion" and "Juego De Posicion" all
 * resolve to one key. Stored on the row rather than computed per query, because
 * a function call in the predicate cannot use an index.
 */
export function normaliseAlias(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Renders a string list as a Postgres text array literal.
 *
 * Drizzle expands a bound array into a record list, which is right for `VALUES`
 * and wrong for `= ANY (...)`. Values here are seed constants, and the quote
 * doubling is what keeps a legitimate apostrophe in a title from terminating
 * the literal.
 */
function pgTextArray(values: string[]): string {
  const escaped = values.map((value) => `'${value.replaceAll("'", "''")}'`);
  return `ARRAY[${escaped.join(', ')}]::text[]`;
}

/**
 * Seeds one sport's explainer library.
 *
 * Takes the taxonomy and the written content separately and merges them by
 * slug, which is what lets the taxonomy name two hundred concepts while only a
 * dozen are written. A written entry overrides its placeholder rather than
 * adding a second row, so a slug typo produces a duplicate concept and is the
 * one mistake this function cannot catch for you.
 *
 * Idempotent throughout. Every write upserts on a natural key and every child
 * collection is pruned to what the seed currently defines, so re-running after
 * an edit converges rather than accumulating. That matters more here than it
 * did for the overview: sections and relations are edited constantly while
 * content is being written, and an append-only seed would quietly leave the
 * removed ones on the page.
 */
export async function seedExplainerLibrary(
  db: Db,
  sportSlug: string,
  categories: ExplainerCategorySeed[],
  topics: ExplainerSeed[],
  written: ExplainerSeed[],
  sources: SourceSeed[],
): Promise<ExplainerSeedResult> {
  const empty: ExplainerSeedResult = {
    categories: 0,
    explainers: 0,
    published: 0,
    sections: 0,
    aliases: 0,
    relations: 0,
  };

  const [sportRow] = await db.execute<{ id: string }>(
    sql`SELECT id FROM sport WHERE slug = ${sportSlug} LIMIT 1`,
  );
  if (!sportRow) return empty;
  const sportId = sportRow.id;

  // ── Merge the taxonomy with the written content ────────────────────────────
  // Written entries win. Anything only in the taxonomy stays a draft, which is
  // what keeps unwritten concepts off the site while still letting the category
  // structure and the duplicate check see them.
  const writtenBySlug = new Map(written.map((entry) => [entry.slug, entry]));
  const merged = new Map<string, ExplainerSeed>();
  for (const entry of topics) merged.set(entry.slug, entry);
  for (const entry of written) merged.set(entry.slug, { ...merged.get(entry.slug), ...entry });

  const all = [...merged.values()];

  // ── Sources ────────────────────────────────────────────────────────────────
  const sourceIds = new Map<string, string>();
  for (const source of sources) {
    const [row] = await db.execute<{ id: string }>(sql`
      INSERT INTO content_source (provider, title, url, external_id, license, retrieved_at)
      VALUES (${source.provider}, ${source.title}, ${source.url},
              ${source.externalId ?? null}, ${source.license ?? null}, now())
      ON CONFLICT (provider, url) DO UPDATE SET
        title = EXCLUDED.title,
        license = EXCLUDED.license,
        retrieved_at = now(),
        updated_at = now()
      RETURNING id
    `);
    if (row) sourceIds.set(source.key, row.id);
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const [row] = await db.execute<{ id: string }>(sql`
      INSERT INTO explainer_category (sport_id, slug, name, short_name, description, display_order)
      VALUES (${sportId}, ${category.slug}, ${category.name},
              ${category.shortName ?? null}, ${category.description}, ${category.order})
      ON CONFLICT (sport_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        short_name = EXCLUDED.short_name,
        description = EXCLUDED.description,
        display_order = EXCLUDED.display_order,
        updated_at = now()
      RETURNING id
    `);
    if (row) categoryIds.set(category.slug, row.id);
  }

  await db.execute(sql`
    DELETE FROM explainer_category
    WHERE sport_id = ${sportId}
      AND NOT (slug = ANY (${sql.raw(pgTextArray(categories.map((c) => c.slug)))}))
  `);

  // ── Explainers ─────────────────────────────────────────────────────────────
  const explainerIds = new Map<string, string>();
  let published = 0;

  for (const entry of all) {
    // The presence of written sections is what publishes a row. Status is never
    // set by hand in the seed data, so a concept cannot be published with an
    // empty page by forgetting to change a flag.
    const isPublished = (writtenBySlug.get(entry.slug)?.sections?.length ?? 0) > 0;
    if (isPublished) published += 1;

    const [row] = await db.execute<{ id: string }>(sql`
      INSERT INTO explainer (
        sport_id, slug, title, subtitle, short_description, type, difficulty,
        primary_category_id, read_minutes, is_start_here, is_featured, status, display_order
      ) VALUES (
        ${sportId}, ${entry.slug}, ${entry.title}, ${entry.subtitle ?? null},
        ${entry.shortDescription ?? null}, ${entry.type}, ${entry.difficulty},
        ${categoryIds.get(entry.category) ?? null}, ${entry.readMinutes ?? null},
        ${entry.isStartHere ? 'true' : 'false'}, ${entry.isFeatured ? 'true' : 'false'},
        ${isPublished ? 'published' : 'draft'}, ${entry.order ?? 100}
      )
      ON CONFLICT (sport_id, slug) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        short_description = EXCLUDED.short_description,
        type = EXCLUDED.type,
        difficulty = EXCLUDED.difficulty,
        primary_category_id = EXCLUDED.primary_category_id,
        read_minutes = EXCLUDED.read_minutes,
        is_start_here = EXCLUDED.is_start_here,
        is_featured = EXCLUDED.is_featured,
        status = EXCLUDED.status,
        display_order = EXCLUDED.display_order,
        updated_at = now()
      RETURNING id
    `);
    if (row) explainerIds.set(entry.slug, row.id);
  }

  await db.execute(sql`
    DELETE FROM explainer
    WHERE sport_id = ${sportId}
      AND NOT (slug = ANY (${sql.raw(pgTextArray(all.map((e) => e.slug)))}))
  `);

  // ── Category membership ────────────────────────────────────────────────────
  // The primary category is included here as well as on the row, so a category
  // listing is one join rather than a union with the explainer table.
  let links = 0;
  for (const entry of all) {
    const explainerId = explainerIds.get(entry.slug);
    if (!explainerId) continue;

    const slugs = [entry.category, ...(entry.alsoIn ?? [])];
    for (const [index, categorySlug] of slugs.entries()) {
      const categoryId = categoryIds.get(categorySlug);
      if (!categoryId) continue;

      await db.execute(sql`
        INSERT INTO explainer_category_link (explainer_id, category_id, display_order)
        VALUES (${explainerId}, ${categoryId}, ${entry.order ?? 100 + index})
        ON CONFLICT (explainer_id, category_id) DO UPDATE SET
          display_order = EXCLUDED.display_order,
          updated_at = now()
      `);
      links += 1;
    }
  }

  // ── Sections, aliases, relations, sources ──────────────────────────────────
  let sections = 0;
  let aliases = 0;
  let relations = 0;

  for (const entry of all) {
    const explainerId = explainerIds.get(entry.slug);
    if (!explainerId) continue;

    // Sections. Pruned first rather than merged, because a section removed
    // during editing must disappear from the page, and an upsert alone would
    // leave it there.
    const sectionTypes = (entry.sections ?? []).map((section) => section.type);
    await db.execute(sql`
      DELETE FROM explainer_section
      WHERE explainer_id = ${explainerId}
        ${
          sectionTypes.length > 0
            ? sql`AND NOT (type::text = ANY (${sql.raw(pgTextArray(sectionTypes))}))`
            : sql``
        }
    `);

    for (const [index, section] of (entry.sections ?? []).entries()) {
      await db.execute(sql`
        INSERT INTO explainer_section (
          explainer_id, type, heading, body, structured_data, display_order
        ) VALUES (
          ${explainerId}, ${section.type}::explainer_section_type, ${section.heading ?? null},
          ${section.body ?? null},
          ${section.structuredData ? JSON.stringify(section.structuredData) : null}::jsonb,
          ${(index + 1) * 10}
        )
        ON CONFLICT (explainer_id, type) DO UPDATE SET
          heading = EXCLUDED.heading,
          body = EXCLUDED.body,
          structured_data = EXCLUDED.structured_data,
          display_order = EXCLUDED.display_order,
          updated_at = now()
      `);
      sections += 1;
    }

    // Aliases. The title is always an alias of itself, so a search for the
    // exact name matches through the same path as a search for "xG".
    const aliasValues = [entry.title, ...(entry.aliases ?? [])];
    if (entry.subtitle) aliasValues.push(entry.subtitle);
    const normalisedAliases = aliasValues.map(normaliseAlias).filter(Boolean);

    await db.execute(sql`
      DELETE FROM explainer_alias
      WHERE explainer_id = ${explainerId}
        AND NOT (normalised = ANY (${sql.raw(pgTextArray(normalisedAliases))}))
    `);

    for (const alias of aliasValues) {
      const normalised = normaliseAlias(alias);
      if (!normalised) continue;
      await db.execute(sql`
        INSERT INTO explainer_alias (explainer_id, alias, normalised)
        VALUES (${explainerId}, ${alias}, ${normalised})
        ON CONFLICT (explainer_id, normalised) DO UPDATE SET
          alias = EXCLUDED.alias,
          updated_at = now()
      `);
      aliases += 1;
    }

    // Source citations.
    for (const [index, reference] of (entry.sourceKeys ?? []).entries()) {
      const sourceId = sourceIds.get(reference.key);
      if (!sourceId) continue;
      await db.execute(sql`
        INSERT INTO explainer_source (explainer_id, source_id, locator, display_order)
        VALUES (${explainerId}, ${sourceId}, ${reference.locator ?? null}, ${(index + 1) * 10})
        ON CONFLICT (explainer_id, source_id) DO UPDATE SET
          locator = EXCLUDED.locator,
          display_order = EXCLUDED.display_order,
          updated_at = now()
      `);
    }
  }

  // Relations last, so every target exists before an edge points at it.
  for (const entry of all) {
    const sourceId = explainerIds.get(entry.slug);
    if (!sourceId) continue;

    await db.execute(sql`DELETE FROM explainer_relation WHERE source_id = ${sourceId}`);

    for (const [index, relation] of (entry.related ?? []).entries()) {
      const targetSlug = typeof relation === 'string' ? relation : relation.slug;
      const relationType = typeof relation === 'string' ? 'related_to' : relation.type;
      const targetId = explainerIds.get(targetSlug);
      // A relation to a concept outside the taxonomy is a typo, not a feature.
      // Skipped rather than failing the run, but it means an edge silently
      // disappears, so the seed reports the total for comparison.
      if (!targetId || targetId === sourceId) continue;

      await db.execute(sql`
        INSERT INTO explainer_relation (source_id, target_id, relation_type, display_order)
        VALUES (${sourceId}, ${targetId}, ${relationType}::explainer_relation_type, ${(index + 1) * 10})
        ON CONFLICT (source_id, target_id, relation_type) DO UPDATE SET
          display_order = EXCLUDED.display_order,
          updated_at = now()
      `);
      relations += 1;
    }
  }

  void links;

  return {
    categories: categoryIds.size,
    explainers: explainerIds.size,
    published,
    sections,
    aliases,
    relations,
  };
}
