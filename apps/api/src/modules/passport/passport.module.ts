import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AchievementEvaluationService } from './achievement-evaluation.service';
import { PassportController } from './passport.controller';
import { PassportRepository } from './passport.repository';
import { PassportService } from './passport.service';
import { PassportStreakService } from './passport-streak.service';
import { SportBrainScoringService } from './sportbrain-scoring.service';

/**
 * SportBrain Passport (Phase E). `QueueService` (the enqueue side of the
 * quiz-completion hook) is injected via `@Global() QueueModule` rather than
 * imported here, and `QuizAttemptsService` only depends on `QueueService`
 * (never on this module) — the queue is the decoupling boundary between
 * quiz-taking and Passport recalculation (Part 69).
 */
@Module({
  imports: [AuthModule, UsersModule],
  controllers: [PassportController],
  providers: [
    PassportService,
    PassportRepository,
    SportBrainScoringService,
    AchievementEvaluationService,
    PassportStreakService,
  ],
  exports: [PassportService, PassportRepository],
})
export class PassportModule {}
