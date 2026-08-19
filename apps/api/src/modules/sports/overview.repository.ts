import { Injectable } from '@nestjs/common';
import { and, asc, eq, inArray } from 'drizzle-orm';
import type {
  ContentSource,
  GoverningBody,
  OverviewSection,
  TimelineEvent,
} from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import {
  contentSource,
  entityFact,
  entitySection,
  governingBody,
  sportTimelineEvent,
} from '../../database/schema';

/**
 * Assembles a sport's overview from the pieces that make it up.
 *
 * Nothing here is football-specific. The timeline, the governance hierarchy and
 * the authored sections are all keyed by sport, so cricket's overview is the
 * same query against different rows.
 */
@Injectable()
export class OverviewRepository {
  constructor(private readonly database: DatabaseService) {}

  /** Structured quick facts for the sport itself. */
  async facts(sportId: string) {
    return this.database.db
      .select({
        key: entityFact.key,
        label: entityFact.label,
        value: entityFact.value,
        category: entityFact.category,
      })
      .from(entityFact)
      .where(and(eq(entityFact.entityType, 'sport'), eq(entityFact.entityId, sportId)))
      .orderBy(asc(entityFact.displayOrder))
      .limit(40);
  }

  /** Authored prose sections, published only. */
  async sections(sportId: string): Promise<OverviewSection[]> {
    return this.database.db
      .select({
        kind: entitySection.kind,
        heading: entitySection.heading,
        body: entitySection.body,
      })
      .from(entitySection)
      .where(
        and(
          eq(entitySection.entityType, 'sport'),
          eq(entitySection.entityId, sportId),
          // Drafts never reach the public site. Filtered here rather than by
          // callers, so one forgotten predicate cannot leak unfinished writing.
          eq(entitySection.status, 'published'),
        ),
      )
      .orderBy(asc(entitySection.displayOrder))
      .limit(20);
  }

  /**
   * The history timeline, oldest first.
   *
   * Ordered by year rather than by `displayOrder`, because a timeline read out
   * of chronological order is not a timeline. `displayOrder` breaks ties within
   * a year.
   */
  async timeline(sportId: string): Promise<TimelineEvent[]> {
    const rows = await this.database.db
      .select({
        id: sportTimelineEvent.id,
        year: sportTimelineEvent.year,
        endYear: sportTimelineEvent.endYear,
        title: sportTimelineEvent.title,
        shortDescription: sportTimelineEvent.shortDescription,
        longDescription: sportTimelineEvent.longDescription,
        category: sportTimelineEvent.category,
        isMajorMilestone: sportTimelineEvent.isMajorMilestone,
        certainty: sportTimelineEvent.certainty,
        sourceId: sportTimelineEvent.sourceId,
      })
      .from(sportTimelineEvent)
      .where(
        and(eq(sportTimelineEvent.sportId, sportId), eq(sportTimelineEvent.status, 'published')),
      )
      .orderBy(asc(sportTimelineEvent.year), asc(sportTimelineEvent.displayOrder))
      .limit(60);

    return rows.map((row) => ({
      ...row,
      // Stored as text so the column can carry a tri-state later without a
      // migration; normalised to a boolean at the boundary.
      isMajorMilestone: row.isMajorMilestone === 'true',
    }));
  }

  /**
   * The governance hierarchy, nested.
   *
   * Read flat and assembled in memory. A recursive CTE would work, but the set
   * is a world body and six confederations: the query would be harder to read
   * than the loop and no faster.
   */
  async governance(sportId: string): Promise<GoverningBody[]> {
    const rows = await this.database.db
      .select({
        id: governingBody.id,
        parentId: governingBody.parentId,
        slug: governingBody.slug,
        shortName: governingBody.shortName,
        name: governingBody.name,
        level: governingBody.level,
        region: governingBody.region,
        foundedYear: governingBody.foundedYear,
        memberCount: governingBody.memberCount,
        headquarters: governingBody.headquarters,
        websiteUrl: governingBody.websiteUrl,
      })
      .from(governingBody)
      .where(eq(governingBody.sportId, sportId))
      .orderBy(asc(governingBody.displayOrder), asc(governingBody.shortName))
      .limit(50);

    const byId = new Map<string, GoverningBody>();
    for (const row of rows) {
      byId.set(row.id, { ...row, children: [] });
    }

    const roots: GoverningBody[] = [];
    for (const row of rows) {
      const node = byId.get(row.id)!;
      const parent = row.parentId ? byId.get(row.parentId) : undefined;
      if (parent) parent.children.push(node);
      else roots.push(node);
    }

    return roots;
  }

  /**
   * Sources cited by this sport's timeline and facts.
   *
   * Only those actually referenced, so the panel lists what the page relied on
   * rather than everything the database happens to hold.
   */
  async sources(sourceIds: string[]): Promise<ContentSource[]> {
    if (sourceIds.length === 0) return [];

    const rows = await this.database.db
      .select({
        id: contentSource.id,
        provider: contentSource.provider,
        title: contentSource.title,
        url: contentSource.url,
        license: contentSource.license,
        retrievedAt: contentSource.retrievedAt,
      })
      .from(contentSource)
      .where(inArray(contentSource.id, sourceIds))
      .limit(50);

    return rows.map((row) => ({ ...row, retrievedAt: row.retrievedAt.toISOString() }));
  }
}
