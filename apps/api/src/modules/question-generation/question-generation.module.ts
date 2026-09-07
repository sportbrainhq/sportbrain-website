import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuestionsModule } from '../questions/questions.module';
import { AiGenerator } from './generators/ai.generator';
import { AI_QUESTION_PROVIDER } from './generators/ai-question-provider.token';
import { NullAiQuestionProvider } from './generators/ai-question-provider';
import { ClubHistoryGenerator } from './generators/club-history.generator';
import { ClubHistoryRepository } from './generators/club-history.repository';
import { HonourFactRepository } from './generators/honour-fact.repository';
import { HonourWinnerGenerator } from './generators/honour-winner.generator';
import { HybridGenerator } from './generators/hybrid.generator';
import { PlayerIdentityGenerator } from './generators/player-identity.generator';
import { PlayerIdentityRepository } from './generators/player-identity.repository';
import { PlayerStatRepository } from './generators/player-stat.repository';
import { PlayerStatSuperlativeGenerator } from './generators/player-stat-superlative.generator';
import { TemplateGenerator } from './generators/template.generator';
import { CandidateReviewService } from './candidate-review.service';
import { QuestionGenerationController } from './question-generation.controller';
import { QuestionGenerationRepository } from './question-generation.repository';
import { QuestionGenerationJobService } from './question-generation-job.service';

/**
 * The semi-automated question creation pipeline (Part 11-17). Imports
 * `QuestionsModule` for `QuestionsRepository`/`QuestionValidationService`/
 * `QuestionCodeService` — a published candidate becomes a `question` row
 * through the exact same repository method manual creation uses, never a
 * parallel insert path.
 *
 * `TemplateGenerator` is a thin composite over one class per fact type
 * (`HonourWinnerGenerator` — team titles, `PlayerStatSuperlativeGenerator` —
 * career stat leaderboards, `ClubHistoryGenerator` — transfer/spell
 * history, `PlayerIdentityGenerator` — birthplace/position/current-club) —
 * see that file's header for why splitting fact discovery this way is what
 * fixes single-fact-type repetition within a generated batch. Add a new
 * fact type by adding its generator + repository here and to the composite's
 * constructor, not by branching inside an existing generator.
 *
 * `AI_QUESTION_PROVIDER` is bound to `NullAiQuestionProvider` because no
 * provider/API key is configured in this environment (see
 * `ai-question-provider.ts`). Replace this binding with a real
 * implementation once one is available; nothing else in this module needs
 * to change.
 */
@Module({
  imports: [AuthModule, QuestionsModule],
  controllers: [QuestionGenerationController],
  providers: [
    QuestionGenerationRepository,
    QuestionGenerationJobService,
    CandidateReviewService,
    HonourFactRepository,
    HonourWinnerGenerator,
    PlayerStatRepository,
    PlayerStatSuperlativeGenerator,
    ClubHistoryRepository,
    ClubHistoryGenerator,
    PlayerIdentityRepository,
    PlayerIdentityGenerator,
    TemplateGenerator,
    AiGenerator,
    HybridGenerator,
    { provide: AI_QUESTION_PROVIDER, useClass: NullAiQuestionProvider },
  ],
  exports: [QuestionGenerationRepository],
})
export class QuestionGenerationModule {}
