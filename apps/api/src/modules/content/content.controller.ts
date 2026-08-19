import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import type {
  ContentDetail,
  ContentSummary,
  ExplainerDetail,
  ExplainerLibrary,
  ExplainerSummary,
  QuizDetail,
  QuizSummary,
} from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { ContentService } from './content.service';
import { ExplainerService } from './explainer.service';

/**
 * Editorial content: the Explainers, Stories and Quiz tabs.
 *
 * Separate from the sports-data controllers because the two have genuinely
 * different lifecycles. Sports data is overwritten by ingestion on a schedule;
 * this is authored, reviewed and published, and must never be touched by a sync.
 */
@ApiTags('content')
@Controller()
export class ContentController {
  constructor(
    private readonly service: ContentService,
    private readonly library: ExplainerService,
  ) {}

  @Get('highlights')
  @ApiOperation({ summary: 'Generated headline cards for the discovery panels' })
  async highlights(): Promise<{ data: Awaited<ReturnType<ContentService['headlines']>> }> {
    return { data: await this.service.headlines(12) };
  }

  @Get('sports/:sportSlug/explainers')
  @ApiOperation({ summary: 'Explainers for a sport: rules, formats, tactics, concepts' })
  async explainers(@Param('sportSlug') sportSlug: string): Promise<{ data: ContentSummary[] }> {
    return { data: await this.service.listBySport(sportSlug, 'explainer') };
  }

  /**
   * The explainer library landing page.
   *
   * One response rather than several: the page needs the beginner path, the
   * categories and the search index together, and three round trips to render
   * one screen is three chances to arrive half-populated.
   */
  @Get('sports/:sportSlug/explainer-library')
  @ApiOperation({ summary: 'The explainer library: start-here, categories and search index' })
  @ApiNotFoundResponse({ description: 'No such sport' })
  async explainerLibrary(@Param('sportSlug') sportSlug: string): Promise<ExplainerLibrary> {
    return this.library.library(sportSlug);
  }

  @Get('sports/:sportSlug/explainer-categories/:categorySlug')
  @ApiOperation({ summary: 'Every published explainer in one category' })
  @ApiNotFoundResponse({ description: 'No such sport' })
  async explainerCategory(
    @Param('sportSlug') sportSlug: string,
    @Param('categorySlug') categorySlug: string,
  ): Promise<{ data: ExplainerSummary[] }> {
    return { data: await this.library.byCategory(sportSlug, categorySlug) };
  }

  /**
   * One explainer.
   *
   * Scoped by sport rather than global, because a slug like `transition` is a
   * different concept in football and cricket and the library is meant to grow
   * into both.
   */
  @Get('sports/:sportSlug/explainers/:slug')
  @ApiOperation({ summary: 'One explainer with its sections, relations and sources' })
  @ApiNotFoundResponse({ description: 'No such explainer' })
  async explainerDetail(
    @Param('sportSlug') sportSlug: string,
    @Param('slug') slug: string,
  ): Promise<ExplainerDetail> {
    return this.library.detail(sportSlug, slug);
  }

  @Get('sports/:sportSlug/stories')
  @ApiOperation({ summary: 'Social media stories for a sport' })
  async stories(@Param('sportSlug') sportSlug: string): Promise<{ data: ContentSummary[] }> {
    return { data: await this.service.listBySport(sportSlug, 'story') };
  }

  @Get('sports/:sportSlug/quizzes')
  @ApiOperation({ summary: 'Quizzes for a sport' })
  async quizzes(@Param('sportSlug') sportSlug: string): Promise<{ data: QuizSummary[] }> {
    return { data: await this.service.quizzes(sportSlug) };
  }

  /** The cross-sport Master Quiz, which belongs to no single sport. */
  @Get('quizzes')
  @ApiOperation({ summary: 'Cross-sport quizzes' })
  async masterQuizzes(): Promise<{ data: QuizSummary[] }> {
    return { data: await this.service.quizzes(null) };
  }

  @Get('quizzes/:slug')
  @ApiOperation({ summary: 'One quiz with its questions, answers withheld' })
  @ApiNotFoundResponse({ description: 'No such quiz' })
  async quiz(@Param('slug') slug: string): Promise<QuizDetail> {
    return this.service.quiz(slug);
  }

  /**
   * Checks an answer.
   *
   * A POST because the answer is never sent to the client with the question:
   * putting it in the page source makes the quiz pointless. This is the only
   * write-shaped endpoint on the API, and it writes nothing.
   */
  @Post('quiz-questions/:questionId/check')
  @ApiOperation({ summary: 'Check one answer and return its explanation' })
  @ApiOkResponse({ description: 'Whether the option was correct' })
  async check(
    @Param('questionId') questionId: string,
    @Body(zodPipe(z.object({ optionId: z.string().min(1) }))) body: { optionId: string },
  ) {
    return this.service.checkAnswer(questionId, body.optionId);
  }

  @Get('explainers/:slug')
  @ApiOperation({ summary: 'One explainer' })
  @ApiNotFoundResponse({ description: 'No such explainer' })
  async explainer(@Param('slug') slug: string): Promise<ContentDetail> {
    return this.service.findBySlug('explainer', slug);
  }

  @Get('stories/:slug')
  @ApiOperation({ summary: 'One story' })
  @ApiNotFoundResponse({ description: 'No such story' })
  async story(@Param('slug') slug: string): Promise<ContentDetail> {
    return this.service.findBySlug('story', slug);
  }
}
