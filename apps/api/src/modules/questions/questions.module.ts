import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuestionCodeService } from './question-code.service';
import { QuestionInventoryRepository } from './question-inventory.repository';
import { QuestionInventoryService } from './question-inventory.service';
import { QuestionValidationService } from './question-validation.service';
import { QuestionsController } from './questions.controller';
import { QuestionsRepository } from './questions.repository';
import { QuestionsService } from './questions.service';

/**
 * The canonical Question Bank (Phase C1) plus admin inventory reporting
 * (Part 62-63). `QuestionsRepository` and `QuestionValidationService` are
 * exported: the generation pipeline and `QuizGenerationService` both need to
 * read/validate questions without duplicating this module's SQL or its
 * validation rules.
 */
@Module({
  imports: [AuthModule],
  controllers: [QuestionsController],
  providers: [
    QuestionsService,
    QuestionsRepository,
    QuestionValidationService,
    QuestionCodeService,
    QuestionInventoryRepository,
    QuestionInventoryService,
  ],
  exports: [QuestionsRepository, QuestionValidationService, QuestionCodeService],
})
export class QuestionsModule {}
