import { Injectable } from '@nestjs/common';
import { CATEGORY_BY_SPORT, type QuestionCategory } from '@sportbrain/contracts';
import { PlayerIdentityRepository } from './player-identity.repository';
import type {
  GeneratedCandidate,
  GenerationRequestContext,
  QuestionGenerator,
} from './generator.types';

const OPTION_COUNT = 4;

/**
 * `entity_fact.key` values worth asking about, and how — see file header on
 * the repository for why only these three (of the seven keys seeded) are
 * wired. `position` is asked player-first ("what position does X play?")
 * because a position is shared by many players — asking "which player plays
 * {position}" the other way round would have more than one valid answer,
 * an ambiguity the other two keys (birthplace, current club) don't have at
 * the same scale.
 */
const ATTRIBUTE_FIELDS = [
  {
    key: 'position',
    questionText: (name: string) => `What position does ${name} play?`,
    playerFirst: true,
  },
  {
    key: 'birthplace',
    questionText: (value: string) => `Which player was born in ${value}?`,
    playerFirst: false,
  },
  {
    key: 'current_club',
    questionText: (value: string) => `Which player currently plays for ${value}?`,
    playerFirst: false,
  },
] as const;

/**
 * Player-identity questions sourced from `entity_fact` (Part 12.1).
 * Distractor safety here is simplest of all four templates: every option
 * is a real player's real value for the exact same attribute key, just a
 * different value from the correct one — there's no competition/era
 * scoping needed because the attribute itself (a position, a birthplace, a
 * club) is already the plausibility constraint.
 */
@Injectable()
export class PlayerIdentityGenerator implements QuestionGenerator {
  readonly method = 'TEMPLATE' as const;
  readonly version = 'QUIZ_GEN_PLAYER_IDENTITY_V1';

  constructor(private readonly repository: PlayerIdentityRepository) {}

  async generate(context: GenerationRequestContext): Promise<GeneratedCandidate[]> {
    const candidates: GeneratedCandidate[] = [];
    let attempts = 0;

    while (candidates.length < context.requestedCount && attempts < context.requestedCount * 4) {
      const field = ATTRIBUTE_FIELDS[
        attempts % ATTRIBUTE_FIELDS.length
      ] as (typeof ATTRIBUTE_FIELDS)[number];
      attempts += 1;
      const facts = await this.repository.findPlayersWithFact(context.sportId, field.key, 1);
      const fact = facts[0];
      if (!fact) continue;

      const candidate = field.playerFirst
        ? await this.buildPlayerFirstCandidate(context, field, fact)
        : await this.buildValueFirstCandidate(context, field, fact);
      if (candidate) candidates.push(candidate);
    }

    return candidates;
  }

  /** "What position does {player} play?" — correct answer is the player's own attribute value; distractors are other real values for the same attribute. */
  private async buildPlayerFirstCandidate(
    context: GenerationRequestContext,
    field: (typeof ATTRIBUTE_FIELDS)[number],
    fact: Awaited<ReturnType<PlayerIdentityRepository['findPlayersWithFact']>>[number],
  ): Promise<GeneratedCandidate | null> {
    const otherValues = await this.repository.findOtherAttributeValues(
      context.sportId,
      field.key,
      fact.attributeValue,
      OPTION_COUNT - 1,
    );
    if (otherValues.length < OPTION_COUNT - 1) return null;

    return this.assemble(
      context,
      `${field.key}:${fact.personId}`,
      field.questionText(fact.playerName),
      {
        correctText: fact.attributeValue,
        distractorTexts: dedupe(otherValues, fact.attributeValue).slice(0, OPTION_COUNT - 1),
        sourceEntityId: fact.factId,
      },
    );
  }

  /** "Which player was born in {value}?" — correct answer is the player; distractors are other real players. */
  private async buildValueFirstCandidate(
    context: GenerationRequestContext,
    field: (typeof ATTRIBUTE_FIELDS)[number],
    fact: Awaited<ReturnType<PlayerIdentityRepository['findPlayersWithFact']>>[number],
  ): Promise<GeneratedCandidate | null> {
    const distractorNames = await this.repository.findOtherPlayersWithDifferentValue(
      context.sportId,
      field.key,
      fact.attributeValue,
      fact.personId,
      OPTION_COUNT - 1,
    );
    if (distractorNames.length < OPTION_COUNT - 1) return null;

    return this.assemble(
      context,
      `${field.key}:${fact.attributeValue}`,
      field.questionText(fact.attributeValue),
      {
        correctText: fact.playerName,
        distractorTexts: dedupe(distractorNames, fact.playerName).slice(0, OPTION_COUNT - 1),
        sourceEntityId: fact.factId,
      },
    );
  }

  private assemble(
    context: GenerationRequestContext,
    factKeySuffix: string,
    questionText: string,
    input: { correctText: string; distractorTexts: string[]; sourceEntityId: string },
  ): GeneratedCandidate | null {
    if (input.distractorTexts.length < OPTION_COUNT - 1) return null;

    const options = shuffle([
      { optionText: input.correctText, isCorrect: true, explanation: null },
      ...input.distractorTexts.map((text) => ({
        optionText: text,
        isCorrect: false,
        explanation: null,
      })),
    ]);

    return {
      factKey: `${context.sportSlug}:player-attribute:${factKeySuffix}`,
      sourceEntityType: 'entity_fact',
      sourceEntityId: input.sourceEntityId,
      questionText,
      options,
      explanation: `${input.correctText} is correct.`,
      suggestedCategory: resolveCategory(context.categories, context.sportSlug),
      suggestedDifficulty: 'MEDIUM',
      sourceReferences: [
        {
          label: 'SportBrain player profile data',
          sourceEntityType: 'entity_fact',
          sourceEntityId: input.sourceEntityId,
        },
      ],
      generationMethod: 'TEMPLATE',
      generationModel: null,
    };
  }
}

function dedupe(values: string[], exclude: string): string[] {
  const seen = new Set<string>([exclude.toLowerCase()]);
  const result: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function resolveCategory(requested: QuestionCategory[], sportSlug: string): QuestionCategory {
  const allowed = CATEGORY_BY_SPORT[sportSlug];
  const preferredOrder: QuestionCategory[] = ['PLAYERS', 'DRIVERS'];
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
