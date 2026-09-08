import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuestionsModule } from '../questions/questions.module';
import { QuizGenerationModule } from '../quiz-generation/quiz-generation.module';
import { QuizAttemptsController } from './quiz-attempts.controller';
import { QuizAttemptsRepository } from './quiz-attempts.repository';
import { QuizAttemptsService } from './quiz-attempts.service';
import { QuizShareController } from './quiz-share.controller';

@Module({
  imports: [AuthModule, QuizGenerationModule, QuestionsModule],
  controllers: [QuizAttemptsController, QuizShareController],
  providers: [QuizAttemptsService, QuizAttemptsRepository],
  exports: [QuizAttemptsRepository],
})
export class QuizAttemptsModule {}
