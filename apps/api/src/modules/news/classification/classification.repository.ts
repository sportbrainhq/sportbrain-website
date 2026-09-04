import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import { newsArticleEntities, newsArticles, newsSources, sport } from '../../../database/schema';
import type { NewsArticleEntityTypeValue } from './classification.types';

export interface ArticleForClassification {
  id: string;
  headline: string;
  summary: string | null;
  sourceId: string;
  defaultSportSlug: string | null;
  rawMetadata: Record<string, unknown>;
  processingStatus: string;
}

export interface EntityLinkToPersist {
  entityType: NewsArticleEntityTypeValue;
  entityId: string;
  confidence: number;
}

/**
 * Write path for the classification pipeline. Separate from
 * `NewsWorkerRepository` (ingestion's write path) and `NewsRepository` (the
 * public read path, `published` only) because classification reads/writes a
 * different slice of `news_articles` (any status, driving it toward
 * `classified`) and owns `news_article_entities` writes, which neither of
 * those repositories touches.
 */
@Injectable()
export class ClassificationRepository {
  constructor(private readonly database: DatabaseService) {}

  async findArticleById(id: string): Promise<ArticleForClassification | null> {
    const [row] = await this.database.db
      .select({
        id: newsArticles.id,
        headline: newsArticles.headline,
        summary: newsArticles.summary,
        sourceId: newsArticles.sourceId,
        defaultSportSlug: sport.slug,
        rawMetadata: newsArticles.rawMetadata,
        processingStatus: newsArticles.processingStatus,
      })
      .from(newsArticles)
      .innerJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
      .leftJoin(sport, eq(sport.id, newsSources.defaultSportId))
      .where(eq(newsArticles.id, id))
      .limit(1);

    if (!row) return null;
    return { ...row, rawMetadata: (row.rawMetadata ?? {}) as Record<string, unknown> };
  }

  /** Articles stuck at `processingStatus = 'ingested'`, oldest first, capped by `limit`. Used by the batch-reclassify CLI command. */
  async findIngestedArticles(limit: number): Promise<ArticleForClassification[]> {
    const rows = await this.database.db
      .select({
        id: newsArticles.id,
        headline: newsArticles.headline,
        summary: newsArticles.summary,
        sourceId: newsArticles.sourceId,
        defaultSportSlug: sport.slug,
        rawMetadata: newsArticles.rawMetadata,
        processingStatus: newsArticles.processingStatus,
      })
      .from(newsArticles)
      .innerJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
      .leftJoin(sport, eq(sport.id, newsSources.defaultSportId))
      .where(eq(newsArticles.processingStatus, 'ingested'))
      .orderBy(newsArticles.firstSeenAt)
      .limit(limit);

    return rows.map((row) => ({
      ...row,
      rawMetadata: (row.rawMetadata ?? {}) as Record<string, unknown>,
    }));
  }

  async findSportIdBySlug(slug: string): Promise<string | null> {
    const [row] = await this.database.db
      .select({ id: sport.id })
      .from(sport)
      .where(eq(sport.slug, slug))
      .limit(1);
    return row?.id ?? null;
  }

  /**
   * Persists a successful classification: sets `sportId`, merges `topics`
   * into `rawMetadata` (see the module doc comment on why topics live there),
   * replaces this article's `news_article_entities` rows, and advances
   * `processingStatus` to `'classified'`. All in one transaction so a partial
   * write is never observable.
   */
  async persistClassified(params: {
    articleId: string;
    sportId: string | null;
    topics: string[];
    entities: EntityLinkToPersist[];
    rawMetadata: Record<string, unknown>;
  }): Promise<void> {
    await this.database.db.transaction(async (tx) => {
      await tx
        .update(newsArticles)
        .set({
          sportId: params.sportId,
          processingStatus: 'classified',
          rawMetadata: { ...params.rawMetadata, topics: params.topics },
          updatedAt: new Date(),
        })
        .where(eq(newsArticles.id, params.articleId));

      await tx
        .delete(newsArticleEntities)
        .where(eq(newsArticleEntities.articleId, params.articleId));

      if (params.entities.length > 0) {
        await tx.insert(newsArticleEntities).values(
          params.entities.map((entity) => ({
            articleId: params.articleId,
            entityType: entity.entityType,
            entityId: entity.entityId,
            confidence: entity.confidence.toFixed(3),
          })),
        );
      }
    });
  }

  /**
   * Marks an article as needing manual review: the "AI/LLM fallback only
   * when uncertain" case with no real fallback wired (Phase 3). Leaves
   * `processingStatus` at `'ingested'` (visibly stuck, per the spec's
   * "a processing failure must not silently disappear" requirement) rather
   * than at `'classified'` with fabricated low-confidence data, while still
   * recording what the deterministic pipeline found in `rawMetadata` for
   * whoever reviews it manually or a later LLM pass.
   */
  async markNeedsReview(params: {
    articleId: string;
    reason: string;
    attemptedSportSlug: string | null;
    attemptedTopics: string[];
    overallConfidence: number;
    rawMetadata: Record<string, unknown>;
  }): Promise<void> {
    await this.database.db
      .update(newsArticles)
      .set({
        rawMetadata: {
          ...params.rawMetadata,
          classificationReview: {
            reason: params.reason,
            attemptedSportSlug: params.attemptedSportSlug,
            attemptedTopics: params.attemptedTopics,
            overallConfidence: params.overallConfidence,
            reviewedAt: new Date().toISOString(),
          },
        },
        updatedAt: new Date(),
      })
      .where(eq(newsArticles.id, params.articleId));
  }
}
