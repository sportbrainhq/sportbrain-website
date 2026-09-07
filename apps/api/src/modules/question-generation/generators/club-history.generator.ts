import { Injectable } from '@nestjs/common';
import { CATEGORY_BY_SPORT, type QuestionCategory } from '@sportbrain/contracts';
import { ClubHistoryRepository } from './club-history.repository';
import type {
  GeneratedCandidate,
  GenerationRequestContext,
  QuestionGenerator,
} from './generator.types';

const OPTION_COUNT = 4;

/**
 * "For which club did {player} play between {startYear} and {endYear}?"
 * (Part 12.1, sourced from `person_team`). Distractors are era-matched (Part
 * 4/45: a 1960s club is never offered as a wrong answer for a 2020s spell)
 * and exclude every club the *same player* has ever actually played for —
 * not just the correct one — since a player who returned to an earlier club
 * on loan would otherwise make one of their own real clubs a plausible-
 * looking but secretly-also-correct distractor.
 */
@Injectable()
export class ClubHistoryGenerator implements QuestionGenerator {
  readonly method = 'TEMPLATE' as const;
  readonly version = 'QUIZ_GEN_CLUB_HISTORY_V1';

  constructor(private readonly repository: ClubHistoryRepository) {}

  async generate(context: GenerationRequestContext): Promise<GeneratedCandidate[]> {
    const facts = await this.repository.findClubSpells(context.sportId, context.requestedCount);
    const candidates: GeneratedCandidate[] = [];

    for (const fact of facts) {
      const playerOtherTeamIds = await this.repository.findPlayersOtherTeamIds(fact.personId);
      const distractorNames = await this.repository.findEraMatchedDistractorTeamNames(
        context.sportId,
        fact.teamKind,
        fact.startYear,
        fact.endYear,
        playerOtherTeamIds,
        OPTION_COUNT - 1,
      );

      // Fewer than three era-matched, non-own-club distractors — skip this
      // fact rather than reaching for an unscoped/wrong-era pool (Part 28).
      if (distractorNames.length < OPTION_COUNT - 1) continue;

      const options = shuffle([
        { optionText: fact.teamName, isCorrect: true, explanation: null },
        ...distractorNames.map((name) => ({
          optionText: name,
          isCorrect: false,
          explanation: null,
        })),
      ]);

      const eraLabel =
        fact.startYear === fact.endYear ? `${fact.startYear}` : `${fact.startYear}–${fact.endYear}`;

      candidates.push({
        factKey: `${context.sportSlug}:club-history:${fact.personId}:${fact.teamId}:${fact.startYear}`,
        sourceEntityType: 'person_team',
        sourceEntityId: fact.personTeamId,
        questionText: `Which club did ${fact.playerName} play for in ${eraLabel}?`,
        options,
        explanation: `${fact.playerName} played for ${fact.teamName} in ${eraLabel}.`,
        suggestedCategory: resolveCategory(context.categories, context.sportSlug),
        suggestedDifficulty: 'MEDIUM',
        sourceReferences: [
          {
            label: 'SportBrain player transfer history',
            sourceEntityType: 'person_team',
            sourceEntityId: fact.personTeamId,
          },
        ],
        generationMethod: 'TEMPLATE',
        generationModel: null,
      });
    }

    return candidates;
  }
}

function resolveCategory(requested: QuestionCategory[], sportSlug: string): QuestionCategory {
  const allowed = CATEGORY_BY_SPORT[sportSlug];
  const preferredOrder: QuestionCategory[] = ['PLAYERS', 'CLUBS', 'TEAMS'];
  for (const candidate of preferredOrder) {
    if (requested.includes(candidate) && (!allowed || allowed.includes(candidate)))
      return candidate;
  }
  return requested[0] ?? 'PLAYERS';
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = temp;
  }
  return result;
}
