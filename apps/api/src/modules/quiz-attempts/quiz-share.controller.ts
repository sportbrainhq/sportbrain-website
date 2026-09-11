import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppException } from '../../common';
import type { QuizShare } from '@sportbrain/contracts';
import { QuizAttemptsService } from './quiz-attempts.service';

/**
 * Public quiz-result share card data (Part 52, 54, 71) — deliberately
 * unguarded, separate from `QuizAttemptsController` (which requires
 * `SessionGuard` on every route): `publicCode` is already the
 * non-sequential, shareable identifier the result URL uses, and the
 * service method never returns question text/options/explanations, only a
 * score summary — safe to expose without authentication.
 */
@ApiTags('quiz-attempts')
@Controller()
export class QuizShareController {
  constructor(private readonly service: QuizAttemptsService) {}

  @Get('share/quiz/:publicCode')
  @ApiOperation({ summary: 'Public quiz-result share card data — no authentication' })
  async getShare(@Param('publicCode') publicCode: string): Promise<{ data: QuizShare }> {
    const share = await this.service.getShareData(publicCode);
    if (!share) throw AppException.notFound('Quiz result not found.');
    return { data: share };
  }
}
