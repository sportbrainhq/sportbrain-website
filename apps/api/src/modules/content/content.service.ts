import { Injectable } from '@nestjs/common';
import type { ContentDetail, ContentSummary, QuizDetail, QuizSummary } from '@sportbrain/contracts';
import { AppException } from '../../common';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { ContentRepository } from './content.repository';

@Injectable()
export class ContentService {
  private static readonly CACHE_PREFIX = 'content:';
  /**
   * Longer than entity data. Editorial content changes when somebody publishes,
   * which is deliberate and infrequent, unlike ingestion.
   */
  private static readonly CACHE_TTL_SECONDS = 1_800;

  constructor(
    private readonly repository: ContentRepository,
    private readonly cache: CacheService,
  ) {}

  async listBySport(sportSlug: string, type: string): Promise<ContentSummary[]> {
    return this.cache.wrap(
      `${ContentService.CACHE_PREFIX}${sportSlug}:${type}`,
      () => this.repository.findBySport(sportSlug, type),
      ContentService.CACHE_TTL_SECONDS,
    );
  }

  async findBySlug(type: string, slug: string): Promise<ContentDetail> {
    const found = await this.cache.wrap(
      `${ContentService.CACHE_PREFIX}${type}:${slug}`,
      async () => {
        const row = await this.repository.findBySlug(type, slug);
        if (!row) return null;

        const related = await this.repository.relatedEntities(row.id);

        const detail: ContentDetail = {
          id: row.id,
          type: row.type,
          slug: row.slug,
          title: row.title,
          excerpt: row.excerpt,
          body: row.body,
          category: row.category,
          heroImageUrl: row.heroImageUrl,
          publishedAt: row.publishedAt?.toISOString() ?? null,
          sport: row.sportSlug ? { slug: row.sportSlug, name: row.sportName ?? '' } : null,
          related,
        };

        return detail;
      },
      ContentService.CACHE_TTL_SECONDS,
    );

    if (!found) throw AppException.notFound(`No ${type} "${slug}"`);

    return found;
  }

  /** Content about one entity, for the related-stories panel on its page. */
  async forEntity(entityType: string, entityId: string): Promise<ContentSummary[]> {
    return this.cache.wrap(
      `${ContentService.CACHE_PREFIX}entity:${entityType}:${entityId}`,
      () => this.repository.findForEntity(entityType, entityId),
      ContentService.CACHE_TTL_SECONDS,
    );
  }

  async quizzes(sportSlug: string | null): Promise<QuizSummary[]> {
    return this.cache.wrap(
      `${ContentService.CACHE_PREFIX}quizzes:${sportSlug ?? 'master'}`,
      () => this.repository.quizzesBySport(sportSlug),
      ContentService.CACHE_TTL_SECONDS,
    );
  }

  async quiz(slug: string): Promise<QuizDetail> {
    const found = await this.cache.wrap(
      `${ContentService.CACHE_PREFIX}quiz:${slug}`,
      async () => {
        const row = await this.repository.quizBySlug(slug);
        if (!row) return null;

        const questions = await this.repository.questionsFor(row.id);

        const detail: QuizDetail = {
          id: row.id,
          slug: row.slug,
          title: row.title,
          description: row.description,
          difficulty: row.difficulty,
          questionCount: questions.length,
          sport: row.sportSlug ? { slug: row.sportSlug, name: row.sportName ?? '' } : null,
          questions: questions.map((question) => ({
            id: question.id,
            prompt: question.prompt,
            options: (question.options ?? []) as { id: string; text: string }[],
          })),
        };

        return detail;
      },
      ContentService.CACHE_TTL_SECONDS,
    );

    if (!found) throw AppException.notFound(`No quiz "${slug}"`);

    return found;
  }

  /**
   * Checks one answer.
   *
   * Never cached: the request carries the user's chosen option, so a cache key
   * would have to include it, and the result is cheap to compute anyway.
   */
  async checkAnswer(questionId: string, optionId: string) {
    const result = await this.repository.checkAnswer(questionId, optionId);
    if (!result) throw AppException.notFound('No such question');
    return result;
  }
}
