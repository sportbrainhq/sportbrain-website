import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { ExplainerCategory, ExplainerDetail, ExplainerSummary } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';

/**
 * The columns every listing query projects.
 *
 * Named rather than repeated inline: five queries select the same shape, and a
 * `Record<string, never>` stand-in made the rows unreadable without a cast.
 */
interface SummaryRow {
  // Drizzle's `execute` constrains its row type to Record<string, unknown>, so
  // the index signature is required for these to be usable as a type argument.
  [column: string]: unknown;
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  short_description: string | null;
  type: string;
  difficulty: string;
  read_minutes: number | null;
  home_slug: string | null;
  home_name: string | null;
}

/**
 * Reads for the explainer library.
 *
 * Everything is filtered to `status = 'published'` inside this class rather than
 * by callers. Most of the library is unwritten draft rows, so a forgotten
 * predicate would not fail loudly: it would publish two hundred empty pages.
 *
 * No method takes a sport-specific argument beyond the slug. Cricket's library
 * is these queries against different rows.
 */
@Injectable()
export class ExplainerRepository {
  /** How many concepts each category shows before "view all". */
  private static readonly CATEGORY_PREVIEW = 8;

  constructor(private readonly database: DatabaseService) {}

  async sport(slug: string): Promise<{ id: string; slug: string; name: string } | undefined> {
    const [row] = await this.database.db.execute<{ id: string; slug: string; name: string }>(
      sql`SELECT id, slug, name FROM sport WHERE slug = ${slug} LIMIT 1`,
    );
    return row;
  }

  /**
   * The categories, each with a capped preview of its concepts.
   *
   * One query rather than one per category. A lateral join would also work, but
   * ranking in a window function keeps the preview size in a single place and
   * returns the total alongside it, which is what "view all" needs.
   */
  async categories(sportId: string): Promise<ExplainerCategory[]> {
    const rows = await this.database.db.execute<{
      category_id: string;
      category_slug: string;
      category_name: string;
      category_short_name: string | null;
      category_description: string | null;
      total_count: string;
      id: string | null;
      slug: string | null;
      title: string | null;
      subtitle: string | null;
      short_description: string | null;
      type: string | null;
      difficulty: string | null;
      read_minutes: number | null;
      home_slug: string | null;
      home_name: string | null;
    }>(sql`
      WITH published AS (
        -- Restricted to published rows before anything is counted or ranked.
        -- Filtering afterwards would let the preview cap and the total both
        -- include unwritten concepts, and promise a "view all" page that turns
        -- out to be empty.
        SELECT
          l.category_id, l.display_order AS link_order,
          e.id, e.slug, e.title, e.subtitle, e.short_description,
          e.type::text AS type, e.difficulty::text AS difficulty, e.read_minutes,
          e.display_order,
          home.slug AS home_slug, home.name AS home_name
        FROM explainer_category_link l
        JOIN explainer e ON e.id = l.explainer_id AND e.status = 'published'
        LEFT JOIN explainer_category home ON home.id = e.primary_category_id
        WHERE e.sport_id = ${sportId}
      ),
      ranked AS (
        SELECT
          published.*,
          row_number() OVER (
            PARTITION BY category_id ORDER BY link_order, display_order, title
          ) AS rank,
          count(*) OVER (PARTITION BY category_id) AS total_count
        FROM published
      )
      SELECT
        c.id AS category_id, c.slug AS category_slug, c.name AS category_name,
        c.short_name AS category_short_name, c.description AS category_description,
        coalesce(ranked.total_count, 0) AS total_count,
        ranked.id, ranked.slug, ranked.title, ranked.subtitle, ranked.short_description,
        ranked.type, ranked.difficulty, ranked.read_minutes,
        ranked.home_slug, ranked.home_name
      FROM explainer_category c
      LEFT JOIN ranked
        ON ranked.category_id = c.id
       AND ranked.rank <= ${ExplainerRepository.CATEGORY_PREVIEW}
      WHERE c.sport_id = ${sportId}
      ORDER BY c.display_order, ranked.rank
    `);

    const byCategory = new Map<string, ExplainerCategory>();
    for (const row of rows) {
      let category = byCategory.get(row.category_id);
      if (!category) {
        category = {
          id: row.category_id,
          slug: row.category_slug,
          name: row.category_name,
          shortName: row.category_short_name,
          description: row.category_description,
          explainers: [],
          totalCount: 0,
        };
        byCategory.set(row.category_id, category);
      }

      // A category with nothing published joins to nulls, which is what keeps
      // it in the result with an empty preview rather than dropping it.
      if (!row.id || !row.slug || !row.title || !row.type || !row.difficulty) continue;
      category.totalCount = Number(row.total_count);
      category.explainers.push(
        this.toSummary({
          ...row,
          id: row.id,
          slug: row.slug,
          title: row.title,
          type: row.type,
          difficulty: row.difficulty,
        }),
      );
    }

    return [...byCategory.values()];
  }

  /**
   * The beginner path, in display order.
   *
   * Capped at twelve rather than eight. A sport's path is a deliberately
   * ordered sequence, and truncating it mid-way leaves the reader without the
   * concepts the later entries were chosen to reach: basketball's ends with the
   * shot clock, the pick and roll and the box score, which is most of what a
   * newcomer actually needs. Sports with a shorter path are unaffected, since
   * the limit only bounds how many rows can be returned.
   */
  async startHere(sportId: string): Promise<ExplainerSummary[]> {
    const rows = await this.database.db.execute<SummaryRow>(sql`
      SELECT e.id, e.slug, e.title, e.subtitle, e.short_description, e.type::text,
             e.difficulty::text, e.read_minutes,
             c.slug AS home_slug, c.name AS home_name
      FROM explainer e
      LEFT JOIN explainer_category c ON c.id = e.primary_category_id
      WHERE e.sport_id = ${sportId}
        AND e.status = 'published'
        AND e.is_start_here = 'true'
      ORDER BY e.display_order, e.title
      LIMIT 12
    `);
    return rows.map((row) => this.toSummary(row));
  }

  /**
   * Every published concept, with its search terms.
   *
   * Sent whole to the client, which is the right trade at this size: a few
   * hundred rows is a small payload, and it makes search instant with no
   * round trip and no debounce. When the library outgrows that, the same shape
   * is served by a query without changing the page.
   */
  async searchIndex(sportId: string): Promise<(ExplainerSummary & { terms: string[] })[]> {
    const rows = await this.database.db.execute<SummaryRow & { terms: string[] }>(sql`
      SELECT e.id, e.slug, e.title, e.subtitle, e.short_description, e.type::text,
             e.difficulty::text, e.read_minutes,
             c.slug AS home_slug, c.name AS home_name,
             coalesce(
               (
                 -- Aliases and every category the concept appears under, so
                 -- typing "dismissals" finds LBW and typing "leg before
                 -- wicket" finds it through the same path. Category terms are
                 -- normalised in SQL to match what the seed writes for
                 -- aliases, since the client scores both with one comparison.
                 SELECT array_agg(DISTINCT term) FROM (
                   SELECT a.normalised AS term
                   FROM explainer_alias a
                   WHERE a.explainer_id = e.id
                   UNION
                   SELECT trim(regexp_replace(lower(cat.name), '[^a-z0-9]+', ' ', 'g'))
                   FROM explainer_category_link l
                   JOIN explainer_category cat ON cat.id = l.category_id
                   WHERE l.explainer_id = e.id
                 ) AS terms
               ),
               '{}'
             ) AS terms
      FROM explainer e
      LEFT JOIN explainer_category c ON c.id = e.primary_category_id
      WHERE e.sport_id = ${sportId} AND e.status = 'published'
      ORDER BY e.display_order, e.title
    `);

    return rows.map((row) => ({ ...this.toSummary(row), terms: row.terms ?? [] }));
  }

  /**
   * One concept with everything the article page needs.
   *
   * Resolved by slug or by alias, so a link to `/explainers/xg` finds expected
   * goals. Draft rows are excluded here as everywhere, which is what makes an
   * unwritten concept a 404 rather than an empty page.
   */
  async detail(sportId: string, slug: string): Promise<ExplainerDetail | undefined> {
    const [row] = await this.database.db.execute<
      SummaryRow & {
        is_rule_sensitive: string;
        source_revision: string | null;
        last_reviewed_at: string | null;
      }
    >(sql`
      SELECT e.id, e.slug, e.title, e.subtitle, e.short_description, e.type::text,
             e.difficulty::text, e.read_minutes,
             e.is_rule_sensitive, e.source_revision, e.last_reviewed_at,
             c.slug AS home_slug, c.name AS home_name
      FROM explainer e
      LEFT JOIN explainer_category c ON c.id = e.primary_category_id
      WHERE e.sport_id = ${sportId}
        AND e.status = 'published'
        AND (
          e.slug = ${slug}
          OR EXISTS (
            SELECT 1 FROM explainer_alias a
            WHERE a.explainer_id = e.id AND a.normalised = ${slug
              .replace(/[^a-z0-9]+/gi, ' ')
              .trim()
              .toLowerCase()}
          )
        )
      LIMIT 1
    `);
    if (!row) return undefined;

    const explainerId = row.id;

    const [sections, related, sources, categories, aliases] = await Promise.all([
      this.database.db.execute<{
        type: string;
        heading: string | null;
        body: string | null;
        structured_data: unknown;
      }>(sql`
        SELECT type::text, heading, body, structured_data
        FROM explainer_section
        WHERE explainer_id = ${explainerId}
        ORDER BY display_order
      `),
      // Related concepts are filtered to published targets, so the graph never
      // links a reader into a draft.
      this.database.db.execute<SummaryRow & { relation_type: string }>(sql`
        SELECT t.id, t.slug, t.title, t.subtitle, t.short_description, t.type::text,
               t.difficulty::text, t.read_minutes,
               c.slug AS home_slug, c.name AS home_name,
               r.relation_type::text
        FROM explainer_relation r
        JOIN explainer t ON t.id = r.target_id AND t.status = 'published'
        LEFT JOIN explainer_category c ON c.id = t.primary_category_id
        WHERE r.source_id = ${explainerId}
        ORDER BY r.display_order
      `),
      this.database.db.execute<{
        id: string;
        provider: string;
        title: string;
        url: string;
        license: string | null;
        retrieved_at: string | Date;
        locator: string | null;
      }>(sql`
        SELECT cs.id, cs.provider, cs.title, cs.url, cs.license, cs.retrieved_at, es.locator
        FROM explainer_source es
        JOIN content_source cs ON cs.id = es.source_id
        WHERE es.explainer_id = ${explainerId}
        ORDER BY es.display_order
      `),
      this.database.db.execute<{ slug: string; name: string }>(sql`
        SELECT c.slug, c.name
        FROM explainer_category_link l
        JOIN explainer_category c ON c.id = l.category_id
        WHERE l.explainer_id = ${explainerId}
        ORDER BY c.display_order
      `),
      this.database.db.execute<{ alias: string }>(sql`
        SELECT alias FROM explainer_alias WHERE explainer_id = ${explainerId} ORDER BY alias
      `),
    ]);

    return {
      ...this.toSummary(row),
      isRuleSensitive: row.is_rule_sensitive === 'true',
      sourceRevision: row.source_revision ?? null,
      lastReviewedAt: row.last_reviewed_at ?? null,
      sections: sections.map((section) => ({
        type: section.type,
        heading: section.heading,
        body: section.body,
        structuredData: section.structured_data ?? null,
      })),
      related: related.map((entry) => ({
        ...this.toSummary(entry),
        relationType: entry.relation_type as never,
      })),
      sources: sources.map((source) => ({
        id: source.id,
        provider: source.provider,
        title: source.title,
        url: source.url,
        license: source.license,
        // Raw `execute` hands back whatever the driver parsed, which for a
        // timestamptz is a string rather than a Date. Normalised here so the
        // contract always sees an ISO string.
        retrievedAt: new Date(source.retrieved_at).toISOString(),
        locator: source.locator,
      })),
      categories: categories.map((category) => ({ slug: category.slug, name: category.name })),
      aliases: aliases.map((entry) => entry.alias),
    };
  }

  /** Published concepts in one category, for the "view all" page. */
  async byCategory(sportId: string, categorySlug: string): Promise<ExplainerSummary[]> {
    const rows = await this.database.db.execute<SummaryRow>(sql`
      SELECT e.id, e.slug, e.title, e.subtitle, e.short_description, e.type::text,
             e.difficulty::text, e.read_minutes,
             home.slug AS home_slug, home.name AS home_name
      FROM explainer e
      JOIN explainer_category_link l ON l.explainer_id = e.id
      JOIN explainer_category c ON c.id = l.category_id
      LEFT JOIN explainer_category home ON home.id = e.primary_category_id
      WHERE e.sport_id = ${sportId}
        AND e.status = 'published'
        AND c.slug = ${categorySlug}
      ORDER BY l.display_order, e.title
      LIMIT 200
    `);
    return rows.map((row) => this.toSummary(row));
  }

  /** Maps a joined row onto the summary shape every listing uses. */
  private toSummary(row: SummaryRow): ExplainerSummary {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle ?? null,
      shortDescription: row.short_description ?? null,
      type: row.type as ExplainerSummary['type'],
      difficulty: row.difficulty as ExplainerSummary['difficulty'],
      readMinutes: row.read_minutes ?? null,
      categorySlug: row.home_slug ?? null,
      categoryName: row.home_name ?? null,
    };
  }
}
