import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  quizTypeSchema,
  startQuizRequestSchema,
  submitAnswerRequestSchema,
  type ActiveQuizAttempt,
  type QuizAttempt,
  type QuizHistoryItem,
  type StartQuizRequest,
  type SubmitAnswerRequest,
  type SubmitAnswerResponse,
} from '@sportbrain/contracts';
import { CurrentUser, zodPipe } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { SessionGuard } from '../auth/guards/session.guard';
import { QuizAttemptsService } from './quiz-attempts.service';

/**
 * Quiz-taking (Part 31, 36-42). Authenticated only in Phase C3 — see this
 * module's file header for why anonymous quiz-taking (Part 40) isn't wired
 * yet. Every route is scoped to `@CurrentUser().id`: there is no way to
 * read or mutate another user's attempt through this controller
 * (`requireOwnedAttempt` in the service is the actual enforcement).
 */
@ApiTags('quiz-attempts')
@Controller()
@UseGuards(SessionGuard)
export class QuizAttemptsController {
  constructor(private readonly service: QuizAttemptsService) {}

  @Post('quiz/attempts')
  @ApiOperation({ summary: 'Start a quiz attempt' })
  async start(
    @CurrentUser() user: AuthenticatedUser,
    @Body(zodPipe(startQuizRequestSchema)) body: StartQuizRequest,
  ): Promise<{ data: QuizAttempt }> {
    return { data: await this.service.start(user.id, body) };
  }

  @Get('quiz/attempts/:publicCode')
  @ApiOperation({ summary: 'Fetch one attempt (in progress or completed)' })
  async findByCode(
    @CurrentUser() user: AuthenticatedUser,
    @Param('publicCode') publicCode: string,
  ): Promise<{ data: QuizAttempt }> {
    return { data: await this.service.findByPublicCode(user.id, publicCode) };
  }

  @Post('quiz/attempts/:publicCode/questions/:attemptQuestionId/answer')
  @ApiOperation({ summary: 'Submit an answer; correctness is decided server-side' })
  async submitAnswer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('publicCode') publicCode: string,
    @Param('attemptQuestionId') attemptQuestionId: string,
    @Body(zodPipe(submitAnswerRequestSchema)) body: SubmitAnswerRequest,
  ): Promise<{ data: SubmitAnswerResponse }> {
    return {
      data: await this.service.submitAnswer(
        user.id,
        publicCode,
        attemptQuestionId,
        body.selectedOptionCode,
      ),
    };
  }

  @Post('quiz/attempts/:publicCode/complete')
  @ApiOperation({ summary: 'Complete an attempt and compute the final score' })
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('publicCode') publicCode: string,
  ): Promise<{ data: QuizAttempt }> {
    return { data: await this.service.complete(user.id, publicCode) };
  }

  @Post('quiz/attempts/:publicCode/abandon')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Abandon an in-progress attempt' })
  async abandon(
    @CurrentUser() user: AuthenticatedUser,
    @Param('publicCode') publicCode: string,
  ): Promise<void> {
    await this.service.abandon(user.id, publicCode);
  }

  @Get('users/me/quiz-attempts')
  @ApiOperation({ summary: 'Quiz history: recent completed attempts' })
  async listHistory(@CurrentUser() user: AuthenticatedUser): Promise<{ data: QuizHistoryItem[] }> {
    return { data: await this.service.listHistory(user.id, 20) };
  }

  @Get('users/me/quiz-active')
  @ApiOperation({
    summary: "The resume prompt: this user's active attempt, if any, for a quizType (+ sportId)",
  })
  async findActive(
    @CurrentUser() user: AuthenticatedUser,
    @Query('quizType') quizTypeRaw: string,
    @Query('sportId') sportId?: string,
  ): Promise<{ data: ActiveQuizAttempt | null }> {
    const quizType = quizTypeSchema.parse(quizTypeRaw);
    return { data: await this.service.findActive(user.id, quizType, sportId ?? null) };
  }
}
