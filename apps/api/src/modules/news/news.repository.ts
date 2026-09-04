import { Injectable } from '@nestjs/common';
import { and, desc, eq, gt, inArray, lt, or, sql, type SQL } from 'drizzle-orm';
import type { NewsArticleDetail, NewsArticleSummary, NewsListQuery } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import {
  newsArticleEntities,
  newsArticles,
  newsSources,
  sport,
  competition,
  team,
  person,
} from '../../database/schema';

/** Decoded shape of the opaque cursor: the last row's sort key, so the next page starts after it. */
interface NewsCursor {
  publishedAt: string;
  id: string;
}

function encodeCursor(cursor: NewsCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

function decodeCursor(raw: string): NewsCursor | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as NewsCursor).publishedAt === 'string' &&
      typeof (parsed as NewsCursor).id === 'string'
    ) {
      return parsed as NewsCursor;
    }
    return null;
  } catch {
    return null;
  }
}

/** Fields shared between the summary and detail row shapes, before entity links are attached. */
interface ArticleRow {
  id: string;
  headline: string;
  summary: string | null;
  originalUrl: string;
  canonicalUrl: string;
  imageUrl: string | null;
  importanceScore: string;
  publishedAt: Date;
  firstSeenAt: Date;
  processingStatus: NewsArticleDetail['processingStatus'];
  sourceId: string;
  sourceName: string;
  sourceSlug: string;
  displaySummaryAllowed: boolean;
  displayImageAllowed: boolean;
  displayHeadlineAllowed: boolean;
  sportSlug: string | null;
  rawMetadata: unknown;
}

@Injectable()
export class NewsRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Published articles matching the given filters, newest first, cursor-paginated.
   *
   * Only `processingStatus = 'published'` is ever returned to a reader: every
   * earlier status is mid-pipeline and has not cleared classification, and
   * `rejected`/`failed` are terminal states that should never surface. That
   * filter is applied unconditionally here rather than left to callers,
   * because a caching or admin bypass that forgets it would leak
   * unmoderated content.
   */
  async findPublished(
    query: NewsListQuery,
  ): Promise<{ rows: NewsArticleSummary[]; nextCursor: string | undefined }> {
    const predicates: SQL[] = [eq(newsArticles.processingStatus, 'published')];

    if (query.sport) predicates.push(eq(sport.slug, query.sport));
    if (query.source) predicates.push(eq(newsSources.slug, query.source));

    // Competition/team/player filters need the article to have a matching row
    // in news_article_entities, expressed as an EXISTS rather than a join so
    // an article linked to several entities of the same type is not
    // duplicated in the result set.
    if (query.competition) {
      predicates.push(
        sql`EXISTS (
          SELECT 1 FROM ${newsArticleEntities}
          INNER JOIN ${competition} ON ${competition.id} = ${newsArticleEntities.entityId}
          WHERE ${newsArticleEntities.articleId} = ${newsArticles.id}
            AND ${newsArticleEntities.entityType} = 'competition'
            AND ${competition.slug} = ${query.competition}
        )`,
      );
    }
    if (query.team) {
      predicates.push(
        sql`EXISTS (
          SELECT 1 FROM ${newsArticleEntities}
          INNER JOIN ${team} ON ${team.id} = ${newsArticleEntities.entityId}
          WHERE ${newsArticleEntities.articleId} = ${newsArticles.id}
            AND ${newsArticleEntities.entityType} = 'team'
            AND ${team.slug} = ${query.team}
        )`,
      );
    }
    if (query.player) {
      predicates.push(
        sql`EXISTS (
          SELECT 1 FROM ${newsArticleEntities}
          INNER JOIN ${person} ON ${person.id} = ${newsArticleEntities.entityId}
          WHERE ${newsArticleEntities.articleId} = ${newsArticles.id}
            AND ${newsArticleEntities.entityType} = 'player'
            AND ${person.slug} = ${query.player}
        )`,
      );
    }
    if (query.topic) {
      // Topics live in rawMetadata.topics (a jsonb array) until classification
      // gets its own column in a later phase; see news.schema.ts processing
      // pipeline notes. `?` tests jsonb array/object key containment.
      predicates.push(sql`${newsArticles.rawMetadata} -> 'topics' ? ${query.topic}`);
    }

    const cursor = query.cursor ? decodeCursor(query.cursor) : null;
    if (cursor) {
      const cursorDate = new Date(cursor.publishedAt);
      predicates.push(
        or(
          lt(newsArticles.publishedAt, cursorDate),
          and(eq(newsArticles.publishedAt, cursorDate), gt(newsArticles.id, cursor.id)),
        )!,
      );
    }

    const where = and(...predicates);

    // Fetch one extra row so we know whether a next page exists without a
    // separate count query, which would otherwise scan the same predicate twice.
    const limit = query.limit + 1;

    const rows = await this.database.db
      .select({
        id: newsArticles.id,
        headline: newsArticles.headline,
        summary: newsArticles.summary,
        originalUrl: newsArticles.originalUrl,
        canonicalUrl: newsArticles.canonicalUrl,
        imageUrl: newsArticles.imageUrl,
        importanceScore: newsArticles.importanceScore,
        publishedAt: newsArticles.publishedAt,
        firstSeenAt: newsArticles.firstSeenAt,
        processingStatus: newsArticles.processingStatus,
        sourceId: newsSources.id,
        sourceName: newsSources.name,
        sourceSlug: newsSources.slug,
        displaySummaryAllowed: newsSources.displaySummaryAllowed,
        displayImageAllowed: newsSources.displayImageAllowed,
        displayHeadlineAllowed: newsSources.displayHeadlineAllowed,
        sportSlug: sport.slug,
        rawMetadata: newsArticles.rawMetadata,
      })
      .from(newsArticles)
      .innerJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
      .leftJoin(sport, eq(sport.id, newsArticles.sportId))
      .where(where)
      .orderBy(desc(newsArticles.publishedAt), newsArticles.id)
      .limit(limit);

    const hasMore = rows.length > query.limit;
    const page = hasMore ? rows.slice(0, query.limit) : rows;

    const entityLinksByArticle = await this.entityLinksFor(page.map((row) => row.id));

    const data = page.map((row) =>
      this.toSummary(
        row as ArticleRow,
        entityLinksByArticle.get(row.id) ?? { competitions: [], teams: [], players: [] },
      ),
    );

    const last = page.at(-1);
    const nextCursor =
      hasMore && last
        ? encodeCursor({ publishedAt: last.publishedAt.toISOString(), id: last.id })
        : undefined;

    return { rows: data, nextCursor };
  }

  /** One published article by id, or null. Same visibility rule as `findPublished`. */
  async findPublishedById(id: string): Promise<NewsArticleDetail | null> {
    const [row] = await this.database.db
      .select({
        id: newsArticles.id,
        headline: newsArticles.headline,
        summary: newsArticles.summary,
        originalUrl: newsArticles.originalUrl,
        canonicalUrl: newsArticles.canonicalUrl,
        imageUrl: newsArticles.imageUrl,
        importanceScore: newsArticles.importanceScore,
        publishedAt: newsArticles.publishedAt,
        firstSeenAt: newsArticles.firstSeenAt,
        processingStatus: newsArticles.processingStatus,
        sourceId: newsSources.id,
        sourceName: newsSources.name,
        sourceSlug: newsSources.slug,
        displaySummaryAllowed: newsSources.displaySummaryAllowed,
        displayImageAllowed: newsSources.displayImageAllowed,
        displayHeadlineAllowed: newsSources.displayHeadlineAllowed,
        sportSlug: sport.slug,
      })
      .from(newsArticles)
      .innerJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
      .leftJoin(sport, eq(sport.id, newsArticles.sportId))
      .where(and(eq(newsArticles.id, id), eq(newsArticles.processingStatus, 'published')))
      .limit(1);

    if (!row) return null;

    const entityLinks = await this.entityLinksFor([row.id]);
    const summary = this.toSummary(
      row as ArticleRow,
      entityLinks.get(row.id) ?? { competitions: [], teams: [], players: [] },
    );

    const links = await this.database.db
      .select({
        entityType: newsArticleEntities.entityType,
        entityId: newsArticleEntities.entityId,
        confidence: newsArticleEntities.confidence,
      })
      .from(newsArticleEntities)
      .where(eq(newsArticleEntities.articleId, row.id));

    // Resolve names for the raw entity link list. Small and per-article, so a
    // handful of follow-up lookups (rather than another set of joins mirroring
    // entityLinksFor) is the simpler shape for a detail-only field.
    const resolved = await Promise.all(
      links.map(async (link) => {
        const nameRow = await this.resolveEntityName(link.entityType, link.entityId);
        return {
          id: link.entityId,
          slug: nameRow?.slug ?? link.entityId,
          name: nameRow?.name ?? 'Unknown',
          entityType: link.entityType,
          confidence: link.confidence === null ? null : Number(link.confidence),
        };
      }),
    );

    return { ...summary, processingStatus: row.processingStatus, entityLinks: resolved };
  }

  private async resolveEntityName(
    entityType: string,
    entityId: string,
  ): Promise<{ slug: string; name: string } | null> {
    switch (entityType) {
      case 'competition': {
        const [row] = await this.database.db
          .select({ slug: competition.slug, name: competition.name })
          .from(competition)
          .where(eq(competition.id, entityId))
          .limit(1);
        return row ?? null;
      }
      case 'team': {
        const [row] = await this.database.db
          .select({ slug: team.slug, name: team.name })
          .from(team)
          .where(eq(team.id, entityId))
          .limit(1);
        return row ?? null;
      }
      case 'player': {
        const [row] = await this.database.db
          .select({ slug: person.slug, name: person.fullName })
          .from(person)
          .where(eq(person.id, entityId))
          .limit(1);
        return row ?? null;
      }
      case 'sport': {
        const [row] = await this.database.db
          .select({ slug: sport.slug, name: sport.name })
          .from(sport)
          .where(eq(sport.id, entityId))
          .limit(1);
        return row ?? null;
      }
      default:
        return null;
    }
  }

  /**
   * Entity links for a batch of articles, grouped by article id and split
   * into competitions/teams/players the way `NewsArticleSummary` shapes them.
   *
   * One query per entity type across the whole batch, rather than one per
   * article, so a page of twenty articles costs three extra queries instead
   * of sixty.
   */
  private async entityLinksFor(
    articleIds: string[],
  ): Promise<Map<string, { competitions: EntityRef[]; teams: EntityRef[]; players: EntityRef[] }>> {
    const result = new Map<
      string,
      { competitions: EntityRef[]; teams: EntityRef[]; players: EntityRef[] }
    >();
    if (articleIds.length === 0) return result;

    const ensure = (articleId: string) => {
      let entry = result.get(articleId);
      if (!entry) {
        entry = { competitions: [], teams: [], players: [] };
        result.set(articleId, entry);
      }
      return entry;
    };

    const [competitionLinks, teamLinks, playerLinks] = await Promise.all([
      this.database.db
        .select({
          articleId: newsArticleEntities.articleId,
          id: competition.id,
          slug: competition.slug,
          name: competition.name,
        })
        .from(newsArticleEntities)
        .innerJoin(competition, eq(competition.id, newsArticleEntities.entityId))
        .where(
          and(
            inArray(newsArticleEntities.articleId, articleIds),
            eq(newsArticleEntities.entityType, 'competition'),
          ),
        ),
      this.database.db
        .select({
          articleId: newsArticleEntities.articleId,
          id: team.id,
          slug: team.slug,
          name: team.name,
        })
        .from(newsArticleEntities)
        .innerJoin(team, eq(team.id, newsArticleEntities.entityId))
        .where(
          and(
            inArray(newsArticleEntities.articleId, articleIds),
            eq(newsArticleEntities.entityType, 'team'),
          ),
        ),
      this.database.db
        .select({
          articleId: newsArticleEntities.articleId,
          id: person.id,
          slug: person.slug,
          name: person.fullName,
        })
        .from(newsArticleEntities)
        .innerJoin(person, eq(person.id, newsArticleEntities.entityId))
        .where(
          and(
            inArray(newsArticleEntities.articleId, articleIds),
            eq(newsArticleEntities.entityType, 'player'),
          ),
        ),
    ]);

    for (const row of competitionLinks) ensure(row.articleId).competitions.push(row);
    for (const row of teamLinks) ensure(row.articleId).teams.push(row);
    for (const row of playerLinks) ensure(row.articleId).players.push(row);

    return result;
  }

  private toSummary(
    row: ArticleRow,
    links: { competitions: EntityRef[]; teams: EntityRef[]; players: EntityRef[] },
  ): NewsArticleSummary {
    const metadata = row.rawMetadata as { topics?: unknown } | null;
    const topics = Array.isArray(metadata?.topics)
      ? (metadata!.topics as NewsArticleSummary['topics'])
      : [];

    return {
      id: row.id,
      // Licensing gate: a source that disallows displaying its headline still
      // needs *a* string for the card, so it falls back to a neutral label
      // rather than the literal text the source publishes.
      headline: row.displayHeadlineAllowed ? row.headline : 'Read the full story at the source',
      summary: row.displaySummaryAllowed ? row.summary : null,
      source: { id: row.sourceId, name: row.sourceName, slug: row.sourceSlug },
      originalUrl: row.originalUrl,
      canonicalUrl: row.canonicalUrl,
      imageUrl: row.displayImageAllowed ? row.imageUrl : null,
      sport: row.sportSlug,
      competitions: links.competitions,
      teams: links.teams,
      players: links.players,
      topics,
      importanceScore: Number(row.importanceScore),
      publishedAt: row.publishedAt.toISOString(),
      firstSeenAt: row.firstSeenAt.toISOString(),
    };
  }
}

interface EntityRef {
  id: string;
  slug: string;
  name: string;
}
