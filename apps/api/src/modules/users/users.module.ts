import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuizStatsModule } from '../quiz-stats/quiz-stats.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

/**
 * The signed-in reader's own account and profile Snapshot. Imports
 * `AuthModule` for `SessionGuard` (see that module's export list) rather
 * than redeclaring session verification here. Imports `QuizStatsModule` so
 * the Snapshot's quiz fields (Part 53) come from the same aggregation
 * `/me/quiz-stats` uses, rather than a second computation living here.
 */
@Module({
  imports: [AuthModule, QuizStatsModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
