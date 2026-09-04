import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../../config/configuration';
import { MetricsService } from '../../../infrastructure/metrics/metrics.service';
import { ClassificationRepository } from './classification.repository';
import { EntityClassifier } from './entity-classifier';
import { NoopLlmClassificationFallback } from './llm-classification-fallback';
import { SportClassifier } from './sport-classifier';
import { TopicClassifier } from './topic-classifier';

export interface ClassificationOutcome {
  articleId: string;
  status: 'classified' | 'needs_review';
  sportSlug: string | null;
  topics: string[];
  entityMatchCount: number;
  overallConfidence: number;
  reason: string;
}

/**
 * Orchestrates the hybrid classification pipeline for one article:
 *
 *   1. `SportClassifier`   - deterministic keyword rules + source default
 *   2. `EntityClassifier`  - existing SportBrain entity aliases, scoped by sport
 *   3. `TopicClassifier`   - deterministic keyword rules against the fixed taxonomy
 *   4. confidence scoring  - combines the three signals into one overall score
 *   5. AI/LLM fallback     - only invoked when overall confidence is below the
 *                            configured threshold; see `LlmClassificationFallback`
 *
 * Overall confidence is the sport confidence, since sport is the pipeline's
 * foundational fact (entity matching is scoped by it, and a wrong sport
 * makes entity/topic evidence meaningless even if individually confident).
 * Topic and entity evidence can only pull the overall score down, never up:
 * a confident sport match paired with zero topic/entity evidence is still
 * treated as somewhat less certain than one corroborated by both, but a
 * strong sport match is never discarded merely for lacking entities (many
 * legitimate articles, e.g. broad transfer-window roundups, name no single
 * team or player).
 */
@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name);

  constructor(
    private readonly repository: ClassificationRepository,
    private readonly sportClassifier: SportClassifier,
    private readonly entityClassifier: EntityClassifier,
    private readonly topicClassifier: TopicClassifier,
    private readonly llmFallback: NoopLlmClassificationFallback,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly metrics: MetricsService,
  ) {}

  async classifyArticle(articleId: string): Promise<ClassificationOutcome> {
    const article = await this.repository.findArticleById(articleId);
    if (!article) {
      throw new Error(`No news_articles row with id "${articleId}"`);
    }

    const sportResult = this.sportClassifier.classify({
      headline: article.headline,
      summary: article.summary,
      defaultSportSlug: article.defaultSportSlug,
    });

    const sportId = sportResult.sportSlug
      ? await this.repository.findSportIdBySlug(sportResult.sportSlug)
      : null;

    const entityResult = await this.entityClassifier.classify({
      headline: article.headline,
      summary: article.summary,
      sportId,
    });

    const topicResult = this.topicClassifier.classify({
      headline: article.headline,
      summary: article.summary,
    });

    // Corroboration bonus/penalty: entity or topic evidence nudges the
    // foundational sport confidence, capped so neither can override it
    // outright (a handful of loosely-matched entities should not turn a
    // weak sport guess into a confident one).
    let overallConfidence = sportResult.confidence;
    if (entityResult.matches.length === 0 && topicResult.topics.length === 0) {
      overallConfidence *= 0.85;
    } else if (entityResult.matches.length > 0 && topicResult.topics.length > 0) {
      overallConfidence = Math.min(1, overallConfidence * 1.05);
    }

    const threshold = this.config.get('news.classification.confidenceThreshold', { infer: true });

    if (overallConfidence >= threshold && sportResult.sportSlug !== null) {
      await this.repository.persistClassified({
        articleId,
        sportId,
        topics: topicResult.topics,
        entities: entityResult.matches.map((match) => ({
          entityType: match.entityType,
          entityId: match.entityId,
          confidence: match.confidence,
        })),
        rawMetadata: article.rawMetadata,
      });

      this.logger.log(
        `Classified article "${articleId}": sport="${sportResult.sportSlug}" ` +
          `(confidence ${overallConfidence.toFixed(2)}), ${entityResult.matches.length} entities, ` +
          `topics=[${topicResult.topics.join(', ')}].`,
      );

      return {
        articleId,
        status: 'classified',
        sportSlug: sportResult.sportSlug,
        topics: topicResult.topics,
        entityMatchCount: entityResult.matches.length,
        overallConfidence,
        reason: sportResult.reason,
      };
    }

    // Below threshold (or no sport at all): the "AI/LLM fallback only when
    // uncertain" case. Try the fallback extension point; with only the noop
    // implementation wired in this phase, it always reports unavailable and
    // the article is left visibly stuck for manual review rather than
    // silently marked classified with low-confidence data.
    const fallback = await this.llmFallback.classify({
      articleId,
      headline: article.headline,
      summary: article.summary,
      deterministicSportSlug: sportResult.sportSlug,
      deterministicConfidence: overallConfidence,
    });

    if (fallback.available && fallback.sportSlug && fallback.confidence !== undefined) {
      // A real fallback implementation would let its own result stand,
      // subject to the same threshold. Not exercised by the noop, but kept
      // here so a future real implementation needs no change to this method.
      const fallbackSportId = await this.repository.findSportIdBySlug(fallback.sportSlug);
      await this.repository.persistClassified({
        articleId,
        sportId: fallbackSportId,
        topics: fallback.topics ?? topicResult.topics,
        entities: entityResult.matches.map((match) => ({
          entityType: match.entityType,
          entityId: match.entityId,
          confidence: match.confidence,
        })),
        rawMetadata: article.rawMetadata,
      });

      return {
        articleId,
        status: 'classified',
        sportSlug: fallback.sportSlug,
        topics: fallback.topics ?? topicResult.topics,
        entityMatchCount: entityResult.matches.length,
        overallConfidence: fallback.confidence,
        reason: 'Classified via LLM fallback.',
      };
    }

    const reason =
      fallback.unavailableReason ??
      `Overall confidence ${overallConfidence.toFixed(2)} below threshold ${threshold} and no LLM fallback available.`;

    await this.repository.markNeedsReview({
      articleId,
      reason,
      attemptedSportSlug: sportResult.sportSlug,
      attemptedTopics: topicResult.topics,
      overallConfidence,
      rawMetadata: article.rawMetadata,
    });

    this.metrics.incrementCounter('classification_failure_total', { reason: 'needs_review' });
    this.logger.warn(`Article "${articleId}" left at "ingested" for manual review: ${reason}`);

    return {
      articleId,
      status: 'needs_review',
      sportSlug: sportResult.sportSlug,
      topics: topicResult.topics,
      entityMatchCount: entityResult.matches.length,
      overallConfidence,
      reason,
    };
  }

  /** Reclassifies every article stuck at `processingStatus = 'ingested'`, capped by `news.classification.batchLimit`. Used by the CLI's batch command. */
  async classifyAllIngested(): Promise<ClassificationOutcome[]> {
    const limit = this.config.get('news.classification.batchLimit', { infer: true });
    const articles = await this.repository.findIngestedArticles(limit);

    const outcomes: ClassificationOutcome[] = [];
    for (const article of articles) {
      try {
        outcomes.push(await this.classifyArticle(article.id));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to classify article "${article.id}": ${message}`);
        outcomes.push({
          articleId: article.id,
          status: 'needs_review',
          sportSlug: null,
          topics: [],
          entityMatchCount: 0,
          overallConfidence: 0,
          reason: `Classification threw: ${message}`,
        });
      }
    }

    return outcomes;
  }
}
