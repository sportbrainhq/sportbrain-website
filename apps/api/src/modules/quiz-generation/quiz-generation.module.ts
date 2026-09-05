import { Module } from '@nestjs/common';
import { EligibleQuestionsRepository } from './eligible-questions.repository';
import { QuestionExposureRepository } from './question-exposure.repository';
import { QuizGenerationService } from './quiz-generation.service';

/**
 * Question selection for quiz-taking (Part 23-28). No controller: this
 * module is consumed by `QuizAttemptsModule`, which owns the public API
 * surface (`POST /quiz/attempts`, etc.) — generation is an implementation
 * detail of starting an attempt, not its own endpoint.
 */
@Module({
  providers: [QuizGenerationService, EligibleQuestionsRepository, QuestionExposureRepository],
  exports: [QuizGenerationService, QuestionExposureRepository, EligibleQuestionsRepository],
})
export class QuizGenerationModule {}
