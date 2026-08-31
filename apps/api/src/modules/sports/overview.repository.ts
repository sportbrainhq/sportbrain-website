import { Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';
import type {
  ContentSource,
  GoverningBody,
  MembershipTier,
  OverviewEntityRef,
  OverviewSection,
  SportConcept,
  SportFormat,
  TimelineEvent,
} from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import {
  contentSource,
  entityFact,
  entitySection,
  explainer,
  governingBody,
  sportConcept,
  sportFormat,
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
    return (
      this.database.db
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
        // Raised from 20 when tennis arrived with exactly 20 authored sections.
        // A cap equal to the largest sport's section count silently truncates the
        // next one added, and a dropped section is invisible on the rendered page.
        .limit(40)
    );
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
      // Membership classes live in this table but are not part of the
      // hierarchy, and rendering them as children of the world body would
      // imply the ICC contains a thing called "Full Members".
      .where(and(eq(governingBody.sportId, sportId), isNull(governingBody.membershipTier)))
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
   * The format taxonomy, nested.
   *
   * Assembled in memory like the governance tree, and for the same reason: the
   * set is a dozen rows and a recursive CTE would be harder to read without
   * being faster.
   *
   * `isInternational` is passed through untouched, nulls included. Coercing a
   * null to false here would turn "the question does not apply to limited-overs
   * cricket as a category" into "limited-overs cricket is not international",
   * which is the exact conflation the column exists to prevent.
   */
  async formats(sportId: string): Promise<SportFormat[]> {
    const rows = await this.database.db
      .select({
        id: sportFormat.id,
        parentId: sportFormat.parentId,
        key: sportFormat.key,
        label: sportFormat.label,
        matchClass: sportFormat.matchClass,
        isInternational: sportFormat.isInternational,
        oversPerSide: sportFormat.oversPerSide,
        inningsPerSide: sportFormat.inningsPerSide,
        maxDays: sportFormat.maxDays,
        drawPossible: sportFormat.drawPossible,
        description: sportFormat.description,
        conditionsAuthority: sportFormat.conditionsAuthority,
      })
      .from(sportFormat)
      .where(eq(sportFormat.sportId, sportId))
      .orderBy(asc(sportFormat.displayOrder), asc(sportFormat.label))
      .limit(50);

    const byId = new Map<string, SportFormat>();
    for (const row of rows) {
      const { parentId: _parentId, ...node } = row;
      byId.set(row.id, { ...node, children: [] });
    }

    const roots: SportFormat[] = [];
    for (const row of rows) {
      const node = byId.get(row.id)!;
      const parent = row.parentId ? byId.get(row.parentId) : undefined;
      if (parent) parent.children.push(node);
      else roots.push(node);
    }

    return roots;
  }

  /**
   * Vocabulary, with dead Explainer links removed.
   *
   * A left join against `explainer` rather than a trusting pass-through. The
   * Overview is authored before the Explainer library exists, so a concept's
   * `explainerSlug` is an intention rather than a guarantee, and shipping it
   * unchecked would put a page full of 404s in front of the reader. Slugs that
   * do not resolve come back null and the page renders plain text.
   */
  async concepts(sportId: string): Promise<SportConcept[]> {
    const rows = await this.database.db
      .select({
        key: sportConcept.key,
        term: sportConcept.term,
        summary: sportConcept.summary,
        category: sportConcept.category,
        ambiguityNote: sportConcept.ambiguityNote,
        explainerSlug: sportConcept.explainerSlug,
        // Null unless a published explainer of that slug exists in this sport.
        resolvedSlug: explainer.slug,
      })
      .from(sportConcept)
      .leftJoin(
        explainer,
        and(
          eq(explainer.sportId, sportId),
          eq(explainer.slug, sportConcept.explainerSlug),
          eq(explainer.status, 'published'),
        ),
      )
      .where(eq(sportConcept.sportId, sportId))
      .orderBy(asc(sportConcept.displayOrder), asc(sportConcept.term))
      .limit(40);

    return rows.map(({ resolvedSlug, explainerSlug: _intended, ...concept }) => ({
      ...concept,
      explainerSlug: resolvedSlug,
    }));
  }

  /**
   * Membership classes of the sport's world body.
   *
   * Stored as `governing_body` rows carrying a `membershipTier`, and read out
   * separately from the hierarchy because they are not places in it: Full
   * Membership is a status the ICC grants, not a body sitting beneath the ICC.
   * The governance query filters them out for the same reason.
   *
   * A row with no `memberCountAsOf` is skipped rather than shown undated. An
   * undated membership count is a claim about the present that was true at some
   * unspecified point in the past, and four sources consulted for the ICC's own
   * figures disagreed, so publishing one without its date is not defensible.
   */
  async membership(sportId: string): Promise<MembershipTier[]> {
    const rows = await this.database.db
      .select({
        tier: governingBody.membershipTier,
        label: governingBody.name,
        count: governingBody.memberCount,
        asOf: governingBody.memberCountAsOf,
        description: governingBody.region,
      })
      .from(governingBody)
      .where(and(eq(governingBody.sportId, sportId), isNotNull(governingBody.membershipTier)))
      .orderBy(asc(governingBody.displayOrder))
      .limit(10);

    return rows.flatMap((row) =>
      row.tier && row.count !== null && row.asOf
        ? [
            {
              tier: row.tier,
              label: row.label,
              count: row.count,
              asOf: row.asOf.toISOString().slice(0, 10),
              description: row.description ?? '',
            },
          ]
        : [],
    );
  }

  /**
   * Sources cited by this sport's timeline and facts.
   *
   * Only those actually referenced, so the panel lists what the page relied on
   * rather than everything the database happens to hold.
   */
  /**
   * Featured entities, with the canonical row resolved where we hold one.
   *
   * One query with three left joins rather than three queries: the cards are
   * rendered together and a person, a team and a competition differ only in
   * which table supplies the name and image.
   *
   * `href` is built here rather than on the client. Whether a card links at all
   * depends on whether the join found anything, and that is a fact the server
   * knows and the client would otherwise have to infer from a null id.
   */
  async featured(sportId: string, sportSlug: string): Promise<OverviewEntityRef[]> {
    const rows = await this.database.db.execute<{
      section: string;
      entity_type: string;
      display_name: string;
      blurb: string | null;
      meta: string | null;
      person_slug: string | null;
      person_image: string | null;
      team_slug: string | null;
      team_logo: string | null;
      competition_slug: string | null;
      competition_logo: string | null;
    }>(sql`
      SELECT r.section, r.entity_type, r.display_name, r.blurb, r.meta,
             p.slug AS person_slug, p.image_url AS person_image,
             t.slug AS team_slug, t.logo_url AS team_logo,
             c.slug AS competition_slug, c.logo_url AS competition_logo
      FROM overview_entity_ref r
      LEFT JOIN person p ON p.id = r.entity_id AND r.entity_type = 'person'
      LEFT JOIN team t ON t.id = r.entity_id AND r.entity_type = 'team'
      LEFT JOIN competition c ON c.id = r.entity_id AND r.entity_type = 'competition'
      WHERE r.sport_id = ${sportId}
      ORDER BY r.section, r.display_order, r.display_name
      LIMIT 80
    `);

    return rows.map((row) => {
      const [slug, image, path] =
        row.entity_type === 'person'
          ? [row.person_slug, row.person_image, 'players']
          : row.entity_type === 'team'
            ? [row.team_slug, row.team_logo, 'teams']
            : [row.competition_slug, row.competition_logo, 'competitions'];

      return {
        section: row.section,
        entityType: row.entity_type as OverviewEntityRef['entityType'],
        displayName: row.display_name,
        blurb: row.blurb,
        meta: row.meta,
        href: slug ? `/sports/${sportSlug}/${path}/${slug}` : null,
        imageUrl: image,
      };
    });
  }

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
