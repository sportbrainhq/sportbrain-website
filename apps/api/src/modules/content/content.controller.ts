import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import type { ContentDetail, ContentSummary, QuizDetail, QuizSummary } from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { ContentService } from './content.service';

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
  constructor(private readonly service: ContentService) {}

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
