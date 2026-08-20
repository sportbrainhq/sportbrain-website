import { Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import type { EntityProfile } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import {
  entityFact,
  entityRanking,
  entitySection,
  externalMapping,
  person,
} from '../../database/schema';

/**
 * The order the ranking tables appear in on an entity page.
 *
 * A fixed sequence rather than a column on the table, because the ordering is a
 * presentation decision shared by every entity of a type, not a property of any
 * one row. Appearances come before goals: a reader comparing two clubs wants
 * the same table in the same place, and appearances is the broader measure.
 *
 * For a competition the roll of honour leads, because who won is the first
 * thing anyone opens a tournament page to see, and the individual awards follow
 * in the order the trophies are ranked: the Golden Ball is the tournament's
 * headline prize, then the Golden Boot, the Golden Glove, and the young player
 * award. Listing them alphabetically put Best Young Player above all three.
 *
 * The two groups share one list because a kind belongs to only one of them: a
 * club has no `award:` tables and a competition has no `most_appearances`.
 *
 * Anything unlisted sorts after these, alphabetically by kind, so a new kind
 * appears predictably rather than at a random position.
 */
const RANKING_ORDER = [
  'roll_of_honour',
  'award:most-valuable-player-award',
  'award:more-goals-scored',
  'award:best-goalkeeper',
  'award:best-young-player',
  'most_appearances',
  'top_scorers',
];

const rankingOrder = sql`array_position(
  ${sql.raw(`ARRAY[${RANKING_ORDER.map((kind) => `'${kind}'`).join(', ')}]::text[]`)},
  ${entityRanking.kind}
) NULLS LAST`;

/**
 * Gathers the rich detail behind an entity page.
 *
 * Shared by teams, players and competitions because the assembly is identical
 * for all three: only the subject changes. The three sources are queried in
 * parallel, since none depends on the others and running them in sequence would
 * treble the latency of every entity page.
 */
@Injectable()
export class ProfileAssembler {
  constructor(private readonly database: DatabaseService) {}

  async forEntity(
    entityType: 'team' | 'person' | 'competition',
    entityId: string,
  ): Promise<EntityProfile> {
    const [facts, sections, rankings] = await Promise.all([
      this.database.db
        .select({
          key: entityFact.key,
          label: entityFact.label,
          value: entityFact.value,
          category: entityFact.category,
        })
        .from(entityFact)
        .where(and(eq(entityFact.entityType, entityType), eq(entityFact.entityId, entityId)))
        .orderBy(asc(entityFact.displayOrder))
        .limit(60),

      this.database.db
        .select({
          kind: entitySection.kind,
          heading: entitySection.heading,
          body: entitySection.body,
        })
        .from(entitySection)
        .where(
          and(
            eq(entitySection.entityType, entityType),
            eq(entitySection.entityId, entityId),
            // Drafts never reach the public site. Filtered here rather than by
            // callers, so one forgotten predicate cannot leak unfinished prose.
            eq(entitySection.status, 'published'),
          ),
        )
        .orderBy(asc(entitySection.displayOrder))
        .limit(20),

      this.database.db
        .select({
          kind: entityRanking.kind,
          label: entityRanking.label,
          confidence: entityRanking.confidence,
          note: entityRanking.note,
          entries: entityRanking.entries,
        })
        .from(entityRanking)
        .where(and(eq(entityRanking.entityType, entityType), eq(entityRanking.entityId, entityId)))
        // Ordered explicitly. Without this the rows came back in whatever order
        // Postgres happened to hold them, which is write order, so a club whose
        // scorers table was ingested first showed its tables the other way up
        // from its neighbours: Liverpool led with Top scorers where Real Madrid
        // led with Most appearances.
        .orderBy(rankingOrder, asc(entityRanking.kind))
        .limit(20),
    ]);

    // Resolved in one query for every table on the page rather than per entry,
    // so a club with two tables of fifteen players costs one lookup instead of
    // thirty.
    const playerSlugs = await this.resolvePlayers(
      rankings.flatMap((ranking) =>
        ((ranking.entries ?? []) as { link?: string | null }[]).map((entry) => entry.link ?? ''),
      ),
    );

    return {
      facts,
      sections,
      rankings: rankings.map((ranking) => ({
        kind: ranking.kind,
        label: ranking.label,
        // Widened at the database level and narrowed here, so an unexpected
        // value degrades to the most cautious reading rather than failing
        // validation and taking the whole page with it.
        confidence:
          ranking.confidence === 'high' || ranking.confidence === 'partial'
            ? ranking.confidence
            : 'indicative',
        note: ranking.note,
        entries: ((ranking.entries ?? []) as RawEntry[]).map((entry) => ({
          rank: entry.rank,
          name: entry.name,
          value: entry.value ?? null,
          detail: entry.detail ?? null,
          playerSlug: entry.link ? (playerSlugs.get(entry.link) ?? null) : null,
        })) as EntityProfile['rankings'][number]['entries'],
      })),
    };
  }

  /**
   * Maps Wikipedia article titles onto the slugs of players we hold.
   *
   * Joined through `external_mapping` rather than matched on name, which is the
   * whole reason that table exists: the tables print "Raúl" where the entity is
   * "Raúl (footballer)", and two players can share a name while no two share an
   * article. Titles with no mapping are simply absent from the result, and the
   * page renders those rows as plain text.
   */
  private async resolvePlayers(titles: string[]): Promise<Map<string, string>> {
    const wanted = [...new Set(titles.filter(Boolean))];
    if (wanted.length === 0) return new Map();

    const rows = await this.database.db
      .select({ title: externalMapping.externalId, slug: person.slug })
      .from(externalMapping)
      .innerJoin(person, eq(person.id, externalMapping.entityId))
      .where(
        and(
          eq(externalMapping.provider, 'wikipedia'),
          eq(externalMapping.entityType, 'person'),
          inArray(externalMapping.externalId, wanted),
        ),
      );

    return new Map(rows.map((row) => [row.title, row.slug]));
  }
}

/** The stored shape of a ranking entry, before the link is resolved. */
interface RawEntry {
  rank: number;
  name: string;
  value: number | string | null;
  detail: string | null;
  link?: string | null;
}
