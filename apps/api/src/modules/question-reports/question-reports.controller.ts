import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  reportQuestionRequestSchema,
  type ReportQuestionRequest,
  type ReportQuestionResult,
} from '@sportbrain/contracts';
import { CurrentUser, zodPipe } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { SessionGuard } from '../auth/guards/session.guard';
import { QuestionReportsService } from './question-reports.service';

/**
 * "Report Question" (Part 44). Authenticated only, matching this phase's
 * quiz-attempts scope (see `QuizAttemptsController`'s header) — an
 * anonymous reporting path is natural future work alongside anonymous
 * quiz-taking (Part 40), not before it.
 */
@ApiTags('question-reports')
@Controller('questions')
@UseGuards(SessionGuard)
export class QuestionReportsController {
  constructor(private readonly service: QuestionReportsService) {}

  @Post(':questionId/report')
  @ApiOperation({ summary: 'Report a quality issue with a question' })
  async report(
    @CurrentUser() user: AuthenticatedUser,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body(zodPipe(reportQuestionRequestSchema)) body: ReportQuestionRequest,
  ): Promise<{ data: ReportQuestionResult }> {
    return { data: await this.service.report(questionId, user.id, null, null, body) };
  }
}
