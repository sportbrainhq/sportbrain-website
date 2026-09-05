import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ContactModule } from '../contact/contact.module';
import { QuestionsModule } from '../questions/questions.module';
import { QuizAttemptsModule } from '../quiz-attempts/quiz-attempts.module';
import { QuestionReportsController } from './question-reports.controller';
import { QuestionReportsService } from './question-reports.service';

@Module({
  imports: [AuthModule, ContactModule, QuestionsModule, QuizAttemptsModule],
  controllers: [QuestionReportsController],
  providers: [QuestionReportsService],
})
export class QuestionReportsModule {}
