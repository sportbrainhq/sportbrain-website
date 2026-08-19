import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { SearchQuery, SearchResult } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';

/**
 * Cross-entity search.
 *
 * Postgres rather than a search cluster, which is the right call at this corpus
 * size and was one of the reasons Drizzle was chosen. The relevant numbers: a
 * few thousand entities, growing to perhaps a hundred thousand. OpenSearch earns
 * its place when relevance tuning becomes impossible to express in SQL or when
 * query latency stops responding to indexing, and neither is true yet.
 *
 * Two extensions do the work, both created in the first migration:
 *
 *   - `pg_trgm` scores similarity on trigrams, which is what handles the
 *     dominant failure mode here: sports search is mostly misspelled proper
 *     nouns. It also does double duty as the matcher behind entity resolution.
 *   - `unaccent` folds diacritics, so "Mbappe" finds "Mbappé". Without it a
 *     visitor has to reproduce accents exactly, which nobody does.
 *
 * The query is a UNION across entity types rather than a single table, because
 * the alternative is a materialised search table that has to be kept in step
 * with five others. At this size the union is fast and cannot drift.
 */
@Injectable()
export class SearchRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Ranked results across teams, players, competitions and venues.
   *
   * Similarity is computed once per row and used for both the threshold and the
   * ordering. A prefix match is boosted, because somebody typing "manch" wants
   * Manchester United well before a club whose name merely contains those
   * letters somewhere in the middle.
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    const term = query.q.trim();
    const sportFilter = query.sport ?? null;
    const typeFilter = query.type ?? null;

    const rows = await this.database.db.execute<SearchRow>(sql`
      WITH matches AS (
        SELECT 'team' AS type, t.id, t.slug, t.name,
               t.country AS subtitle, t.logo_url AS image_url,
               s.slug AS sport_slug, s.name AS sport_name,
               similarity(unaccent(lower(t.name)), unaccent(lower(${term}))) AS score,
               (unaccent(lower(t.name)) LIKE unaccent(lower(${term})) || '%') AS is_prefix
        FROM team t
        JOIN sport s ON s.id = t.sport_id
        WHERE unaccent(lower(t.name)) % unaccent(lower(${term}))

        UNION ALL

        SELECT 'player', p.id, p.slug, p.full_name,
               p.nationality, p.image_url,
               s.slug, s.name,
               similarity(unaccent(lower(p.full_name)), unaccent(lower(${term}))),
               (unaccent(lower(p.full_name)) LIKE unaccent(lower(${term})) || '%')
        FROM person p
        JOIN sport s ON s.id = p.primary_sport_id
        WHERE unaccent(lower(p.full_name)) % unaccent(lower(${term}))

        UNION ALL

        SELECT 'competition', c.id, c.slug, c.name,
               c.country, c.logo_url,
               s.slug, s.name,
               similarity(unaccent(lower(c.name)), unaccent(lower(${term}))),
               (unaccent(lower(c.name)) LIKE unaccent(lower(${term})) || '%')
        FROM competition c
        JOIN sport s ON s.id = c.sport_id
        WHERE unaccent(lower(c.name)) % unaccent(lower(${term}))

        UNION ALL

        SELECT 'venue', v.id, v.slug, v.name,
               v.city, NULL,
               NULL, NULL,
               similarity(unaccent(lower(v.name)), unaccent(lower(${term}))),
               (unaccent(lower(v.name)) LIKE unaccent(lower(${term})) || '%')
        FROM venue v
        WHERE unaccent(lower(v.name)) % unaccent(lower(${term}))
      )
      SELECT * FROM matches
      WHERE (${sportFilter}::text IS NULL OR sport_slug = ${sportFilter})
        AND (${typeFilter}::text IS NULL OR type = ${typeFilter})
      ORDER BY is_prefix DESC, score DESC, name ASC
      LIMIT ${query.limit}
    `);

    return rows.map((row) => ({
      type: row.type,
      id: row.id,
      slug: row.slug,
      name: row.name,
      subtitle: row.subtitle,
      imageUrl: row.image_url,
      sport: row.sport_slug ? { slug: row.sport_slug, name: row.sport_name ?? '' } : null,
    }));
  }
}

/**
 * Drizzle's `execute` requires row types to carry an index signature, since a
 * raw statement's shape cannot be inferred from the schema.
 */
interface SearchRow extends Record<string, unknown> {
  type: 'team' | 'player' | 'competition' | 'venue';
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  image_url: string | null;
  sport_slug: string | null;
  sport_name: string | null;
  score: number;
  is_prefix: boolean;
}
