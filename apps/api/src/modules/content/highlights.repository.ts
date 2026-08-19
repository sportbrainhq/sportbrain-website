import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';

/** One generated headline card. */
export interface Highlight {
  id: string;
  kind: 'record' | 'honour' | 'milestone' | 'entity';
  sportSlug: string;
  sportName: string;
  title: string;
  subtitle: string | null;
  href: string;
  imageUrl: string | null;
}

interface HighlightRow extends Record<string, unknown> {
  id: string;
  kind: string;
  sport_slug: string;
  sport_name: string;
  title: string;
  subtitle: string | null;
  href: string;
  image_url: string | null;
}

/**
 * Headline cards generated from the data we already hold.
 *
 * The discovery panels need filling and no free news API can lawfully do it:
 * the two obvious ones forbid production use outright, and the cheapest that
 * permits commercial use is a paid subscription. Rather than leave the panels
 * empty or wire a feed that cannot ship, these cards are built from facts in
 * the database.
 *
 * They are honest about what they are. Nothing here is presented as news: each
 * card states a record, an honour or a career figure and links to the entity it
 * describes, so the panel is a way into the catalogue rather than a pretend
 * feed. When a licensed news source is funded this is replaced, not extended.
 */
@Injectable()
export class HighlightsRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * A mixed set of cards across the launched sports.
   *
   * Each branch orders by notability so the subjects are recognisable, then
   * randomises within that, so the panel changes between visits without
   * degenerating into obscure entities.
   */
  async headlines(limit = 12): Promise<Highlight[]> {
    // Wrapped in a subquery because a UNION cannot be ordered by an expression
    // that is not one of its output columns.
    //
    // `jsonb_exists` rather than the `?` containment operator: the driver reads
    // a bare `?` as a bind placeholder, so the operator is swallowed and the
    // predicate silently matches nothing at all.
    const rows = await this.database.db.execute<HighlightRow>(sql`
      SELECT * FROM (
        (
          SELECT ef.id, 'record' AS kind, s.slug AS sport_slug, s.name AS sport_name,
                 ef.label || ' - ' || c.name AS title,
                 ef.value AS subtitle,
                 '/sports/' || s.slug || '/competitions/' || c.slug AS href,
                 c.logo_url AS image_url
          FROM entity_fact ef
          JOIN competition c ON c.id = ef.entity_id AND ef.entity_type = 'competition'
          JOIN sport s ON s.id = c.sport_id
          WHERE ef.category = 'records' AND s.is_launched
          ORDER BY c.notability DESC, random()
          LIMIT ${limit}
        )
        UNION ALL
        (
          SELECT h.id, 'honour', s.slug, s.name,
                 t.name || ' won the ' ||
                   regexp_replace(h.title, '^[0-9]{4}[^ ]* ', ''),
                 h.year::text,
                 '/sports/' || s.slug || '/teams/' || t.slug,
                 t.logo_url
          FROM honour h
          JOIN team t ON t.id = h.team_id
          JOIN sport s ON s.id = h.sport_id
          WHERE h.year IS NOT NULL AND s.is_launched AND t.notability > 20
          ORDER BY h.year DESC, random()
          LIMIT ${limit}
        )
        UNION ALL
        (
          SELECT ps.id, 'milestone', s.slug, s.name,
                 p.full_name,
                 COALESCE(d.label || ': ', '') ||
                   COALESCE(ps.stats ->> 'points_per_game', ps.stats ->> 'runs',
                            ps.stats ->> 'goals') ||
                   CASE
                     WHEN jsonb_exists(ps.stats, 'points_per_game') THEN ' points per game'
                     WHEN jsonb_exists(ps.stats, 'runs') THEN ' runs'
                     ELSE ' goals'
                   END,
                 '/sports/' || s.slug || '/players/' || p.slug,
                 p.image_url
          FROM person_statistic ps
          JOIN person p ON p.id = ps.person_id
          JOIN sport s ON s.id = ps.sport_id
          LEFT JOIN discipline d ON d.id = ps.discipline_id
          WHERE s.is_launched AND p.notability > 10
            AND (jsonb_exists(ps.stats, 'points_per_game')
                 OR jsonb_exists(ps.stats, 'runs')
                 OR jsonb_exists(ps.stats, 'goals'))
          ORDER BY p.notability DESC, random()
          LIMIT ${limit}
        )
      ) AS mixed
      ORDER BY random()
      LIMIT ${limit}
    `);

    return rows.map((row) => ({
      id: row.id,
      kind: row.kind as Highlight['kind'],
      sportSlug: row.sport_slug,
      sportName: row.sport_name,
      title: row.title,
      subtitle: row.subtitle,
      href: row.href,
      imageUrl: row.image_url,
    }));
  }
}
