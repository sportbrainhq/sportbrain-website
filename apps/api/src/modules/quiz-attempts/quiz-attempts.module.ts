import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuizGenerationModule } from '../quiz-generation/quiz-generation.module';
import { QuizAttemptsController } from './quiz-attempts.controller';
import { QuizAttemptsRepository } from './quiz-attempts.repository';
import { QuizAttemptsService } from './quiz-attempts.service';

@Module({
  imports: [AuthModule, QuizGenerationModule],
  controllers: [QuizAttemptsController],
  providers: [QuizAttemptsService, QuizAttemptsRepository],
  exports: [QuizAttemptsRepository],
})
export class QuizAttemptsModule {}
