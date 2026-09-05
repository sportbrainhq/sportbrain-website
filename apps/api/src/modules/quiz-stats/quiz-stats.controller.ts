import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  CategoryQuizStats,
  DifficultyQuizStats,
  LifetimeQuizStats,
  MonthlyQuizSummary,
  RecentQuizStats,
  SportQuizStats,
} from '@sportbrain/contracts';
import { CurrentUser } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { SessionGuard } from '../auth/guards/session.guard';
import { QuizStatsService } from './quiz-stats.service';

/** Account quiz statistics (Part 49). Every route scoped to `@CurrentUser().id` — no cross-user stats access exists. */
@ApiTags('quiz-stats')
@Controller('users/me')
@UseGuards(SessionGuard)
export class QuizStatsController {
  constructor(private readonly service: QuizStatsService) {}

  @Get('quiz-stats')
  @ApiOperation({ summary: 'Lifetime quiz statistics, including current/longest streak' })
  async lifetime(@CurrentUser() user: AuthenticatedUser): Promise<{ data: LifetimeQuizStats }> {
    return { data: await this.service.lifetime(user.id) };
  }

  @Get('quiz-stats/sports')
  @ApiOperation({ summary: 'Quiz statistics broken down by sport' })
  async bySport(@CurrentUser() user: AuthenticatedUser): Promise<{ data: SportQuizStats[] }> {
    return { data: await this.service.bySport(user.id) };
  }

  @Get('quiz-stats/categories')
  @ApiOperation({ summary: 'Quiz statistics by category, above the minimum sample size' })
  async byCategory(@CurrentUser() user: AuthenticatedUser): Promise<{ data: CategoryQuizStats[] }> {
    return { data: await this.service.byCategory(user.id) };
  }

  @Get('quiz-stats/difficulty')
  @ApiOperation({ summary: 'Quiz statistics by difficulty' })
  async byDifficulty(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ data: DifficultyQuizStats[] }> {
    return { data: await this.service.byDifficulty(user.id) };
  }

  @Get('quiz-stats/recent')
  @ApiOperation({ summary: 'Rolling recent-performance stats (last 5/10 quizzes, last 30 days)' })
  async recent(@CurrentUser() user: AuthenticatedUser): Promise<{ data: RecentQuizStats }> {
    return { data: await this.service.recent(user.id) };
  }

  @Get('quiz-stats/monthly-summary')
  @ApiOperation({
    summary: '"Your SportBrain this month" — only shows comparisons where data supports them',
  })
  async monthlySummary(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ data: MonthlyQuizSummary }> {
    return { data: await this.service.monthlySummary(user.id) };
  }
}
