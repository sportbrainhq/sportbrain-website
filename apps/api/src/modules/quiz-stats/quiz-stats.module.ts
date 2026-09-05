import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuizStatsController } from './quiz-stats.controller';
import { QuizStatsRepository } from './quiz-stats.repository';
import { QuizStatsService } from './quiz-stats.service';

@Module({
  imports: [AuthModule],
  controllers: [QuizStatsController],
  providers: [QuizStatsService, QuizStatsRepository],
  exports: [QuizStatsService],
})
export class QuizStatsModule {}
