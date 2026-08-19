import { Injectable } from '@nestjs/common';
import { and, asc, eq, sql } from 'drizzle-orm';
import type { EntityProfile } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import { entityFact, entityRanking, entitySection } from '../../database/schema';

/**
 * The order the ranking tables appear in on an entity page.
 *
 * A fixed sequence rather than a column on the table, because the ordering is a
 * presentation decision shared by every entity of a type, not a property of any
 * one row. Appearances come before goals: a reader comparing two clubs wants
 * the same table in the same place, and appearances is the broader measure.
 *
 * Anything unlisted sorts after these, alphabetically by kind, so a new kind
 * appears predictably rather than at a random position.
 */
const RANKING_ORDER = ['most_appearances', 'top_scorers', 'roll_of_honour'];

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
        entries: (ranking.entries ?? []) as EntityProfile['rankings'][number]['entries'],
      })),
    };
  }
}
