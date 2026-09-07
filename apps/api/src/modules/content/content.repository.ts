import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, isNull, sql } from 'drizzle-orm';
import type { ContentSummary, QuizSummary } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import { content, contentEntity, quiz, quizQuestion, sport } from '../../database/schema';

/**
 * Editorial content access.
 *
 * One predicate is applied here rather than by callers: only published rows are
 * ever returned. Filtering per controller means one forgotten clause leaks a
 * draft to the public site, and drafts are the normal state of editorial work.
 */
@Injectable()
export class ContentRepository {
  constructor(private readonly database: DatabaseService) {}

  async findBySport(sportSlug: string, type: string): Promise<ContentSummary[]> {
    const rows = await this.database.db
      .select({
        id: content.id,
        type: content.type,
        slug: content.slug,
        title: content.title,
        excerpt: content.excerpt,
        category: content.category,
        heroImageUrl: content.heroImageUrl,
        publishedAt: content.publishedAt,
      })
      .from(content)
      .innerJoin(sport, eq(sport.id, content.sportId))
      .where(
        and(
          eq(sport.slug, sportSlug),
          eq(content.type, type as never),
          eq(content.status, 'published'),
        ),
      )
      .orderBy(asc(content.displayOrder), desc(content.publishedAt))
      .limit(100);

    return rows.map((row) => ({
      ...row,
      publishedAt: row.publishedAt?.toISOString() ?? null,
    }));
  }

  /**
   * Filtered/paginated search across all published content, for the
   * newsletter issue editor's "From SportBrainHQ" content-selector
   * (`GET /admin/newsletter/issues/content/search`) — the general-purpose
   * search this table has never needed until now, so it lives here rather
   * than as a raw query duplicated in the newsletter-issues module.
   */
  async search(
    filters: { type?: string; sportSlug?: string; q?: string },
    page: number,
    limit: number,
  ): Promise<{ rows: ContentSummary[]; total: number }> {
    const conditions = [eq(content.status, 'published')];
    if (filters.type) conditions.push(eq(content.type, filters.type as never));
    if (filters.sportSlug) conditions.push(eq(sport.slug, filters.sportSlug));
    if (filters.q) conditions.push(ilike(content.title, `%${filters.q}%`));
    const where = and(...conditions);

    const [rows, [{ value: total } = { value: 0 }]] = await Promise.all([
      this.database.db
        .select({
          id: content.id,
          type: content.type,
          slug: content.slug,
          title: content.title,
          excerpt: content.excerpt,
          category: content.category,
          heroImageUrl: content.heroImageUrl,
          publishedAt: content.publishedAt,
        })
        .from(content)
        .leftJoin(sport, eq(sport.id, content.sportId))
        .where(where)
        .orderBy(desc(content.publishedAt))
        .limit(limit)
        .offset((page - 1) * limit),
      this.database.db
        .select({ value: count() })
        .from(content)
        .leftJoin(sport, eq(sport.id, content.sportId))
        .where(where),
    ]);

    return {
      rows: rows.map((row) => ({ ...row, publishedAt: row.publishedAt?.toISOString() ?? null })),
      total,
    };
  }

  async findBySlug(type: string, slug: string) {
    const [row] = await this.database.db
      .select({
        id: content.id,
        type: content.type,
        slug: content.slug,
        title: content.title,
        excerpt: content.excerpt,
        body: content.body,
        category: content.category,
        heroImageUrl: content.heroImageUrl,
        publishedAt: content.publishedAt,
        sportSlug: sport.slug,
        sportName: sport.name,
      })
      .from(content)
      // Left join: cross-sport pieces have no sport, and an inner join would
      // silently hide them.
      .leftJoin(sport, eq(sport.id, content.sportId))
      .where(
        and(
          eq(content.type, type as never),
          eq(content.slug, slug),
          eq(content.status, 'published'),
        ),
      )
      .limit(1);

    return row ?? null;
  }

  /** Entities a piece is about, for cross-linking back to their pages. */
  async relatedEntities(contentId: string) {
    return this.database.db
      .select({
        entityType: contentEntity.entityType,
        entityId: contentEntity.entityId,
        relevance: contentEntity.relevance,
      })
      .from(contentEntity)
      .where(eq(contentEntity.contentId, contentId))
      .limit(50);
  }

  /**
   * Content about one entity, for the "related stories" panel on its page.
   *
   * Ordered so pieces genuinely about the entity come before those that merely
   * mention it.
   */
  async findForEntity(entityType: string, entityId: string): Promise<ContentSummary[]> {
    const rows = await this.database.db
      .select({
        id: content.id,
        type: content.type,
        slug: content.slug,
        title: content.title,
        excerpt: content.excerpt,
        category: content.category,
        heroImageUrl: content.heroImageUrl,
        publishedAt: content.publishedAt,
      })
      .from(contentEntity)
      .innerJoin(content, eq(content.id, contentEntity.contentId))
      .where(
        and(
          eq(contentEntity.entityType, entityType),
          eq(contentEntity.entityId, entityId),
          eq(content.status, 'published'),
        ),
      )
      .orderBy(sql`${contentEntity.relevance} = 'primary' desc`, desc(content.publishedAt))
      .limit(12);

    return rows.map((row) => ({
      ...row,
      publishedAt: row.publishedAt?.toISOString() ?? null,
    }));
  }

  /** Quizzes for a sport, or the cross-sport Master Quiz when slug is null. */
  async quizzesBySport(sportSlug: string | null): Promise<QuizSummary[]> {
    const rows = await this.database.db
      .select({
        id: quiz.id,
        slug: quiz.slug,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        questionCount: sql<number>`(select count(*) from "quiz_question" where "quiz_question"."quiz_id" = "quiz"."id")`,
      })
      .from(quiz)
      .leftJoin(sport, eq(sport.id, quiz.sportId))
      .where(
        and(
          eq(quiz.status, 'published'),
          sportSlug ? eq(sport.slug, sportSlug) : isNull(quiz.sportId),
        ),
      )
      .orderBy(asc(quiz.title))
      .limit(50);

    return rows.map((row) => ({ ...row, questionCount: Number(row.questionCount) }));
  }

  async quizBySlug(slug: string) {
    const [row] = await this.database.db
      .select({
        id: quiz.id,
        slug: quiz.slug,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        sportSlug: sport.slug,
        sportName: sport.name,
      })
      .from(quiz)
      .leftJoin(sport, eq(sport.id, quiz.sportId))
      .where(and(eq(quiz.slug, slug), eq(quiz.status, 'published')))
      .limit(1);

    return row ?? null;
  }

  /**
   * Questions for a quiz.
   *
   * `correctOptionId` is not selected. Sending the answer with the question puts
   * it in the page source where anyone can read it; answers are checked
   * server-side by `checkAnswer` instead.
   */
  async questionsFor(quizId: string) {
    return this.database.db
      .select({
        id: quizQuestion.id,
        prompt: quizQuestion.prompt,
        options: quizQuestion.options,
      })
      .from(quizQuestion)
      .where(eq(quizQuestion.quizId, quizId))
      .orderBy(asc(quizQuestion.displayOrder))
      .limit(100);
  }

  /** Server-side answer check, with the explanation to show afterwards. */
  async checkAnswer(questionId: string, optionId: string) {
    const [row] = await this.database.db
      .select({
        correctOptionId: quizQuestion.correctOptionId,
        explanation: quizQuestion.explanation,
      })
      .from(quizQuestion)
      .where(eq(quizQuestion.id, questionId))
      .limit(1);

    if (!row) return null;

    return {
      correct: row.correctOptionId === optionId,
      correctOptionId: row.correctOptionId,
      explanation: row.explanation,
    };
  }
}
