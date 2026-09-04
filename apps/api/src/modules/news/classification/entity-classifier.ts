import { Injectable, Logger } from '@nestjs/common';
import { EntityClassificationRepository } from './entity-classification.repository';
import { findNameMatchInText } from './text-entity-matching';

export type NewsEntityMatchType = 'team' | 'player' | 'competition';

export interface EntityClassificationInput {
  headline: string;
  summary: string | null;
  /** The sport determined by `SportClassifier`. Required: entity matching is always scoped to a sport to avoid an unbounded scan. Null skips entity matching entirely. */
  sportId: string | null;
}

export interface EntityMatch {
  entityType: NewsEntityMatchType;
  entityId: string;
  name: string;
  matchedText: string;
  /** 0 to 1. A name match scores higher than an alias match; see `EntityClassifier`. */
  confidence: number;
}

export interface EntityClassificationResult {
  matches: EntityMatch[];
}

/**
 * Step 2/3 of the hybrid pipeline (existing SportBrain entity aliases +
 * entity matching). Scoped by the sport `SportClassifier` already determined,
 * so this queries a bounded candidate set (teams/players/competitions of one
 * sport) rather than scanning every entity in the database.
 *
 * Confidence scoring: a match against the canonical `name` column is treated
 * as stronger evidence (0.85) than a match against an `aliases` entry (0.7),
 * because an alias list can include ambiguous historical names, whereas the
 * canonical name is curated as the primary identifier. Both are well above
 * the "uncertain" range so a clean alias hit does not by itself force the
 * article to the AI/LLM fallback path (see `ClassificationService`).
 */
@Injectable()
export class EntityClassifier {
  private readonly logger = new Logger(EntityClassifier.name);

  constructor(private readonly repository: EntityClassificationRepository) {}

  async classify(input: EntityClassificationInput): Promise<EntityClassificationResult> {
    if (!input.sportId) {
      return { matches: [] };
    }

    const text = `${input.headline} ${input.summary ?? ''}`;

    const [teams, persons, competitions] = await Promise.all([
      this.repository.findTeamsForSport(input.sportId),
      this.repository.findPersonsForSport(input.sportId),
      this.repository.findCompetitionsForSport(input.sportId),
    ]);

    const matches: EntityMatch[] = [];

    for (const entity of teams) {
      const match = findNameMatchInText(text, entity.name, entity.aliases);
      if (match) {
        matches.push({
          entityType: 'team',
          entityId: entity.id,
          name: entity.name,
          matchedText: match.matchedText,
          confidence: match.matchedField === 'name' ? 0.85 : 0.7,
        });
      }
    }

    for (const entity of persons) {
      const match = findNameMatchInText(text, entity.name, entity.aliases);
      if (match) {
        matches.push({
          entityType: 'player',
          entityId: entity.id,
          name: entity.name,
          matchedText: match.matchedText,
          confidence: match.matchedField === 'name' ? 0.85 : 0.7,
        });
      }
    }

    for (const entity of competitions) {
      const match = findNameMatchInText(text, entity.name, entity.aliases);
      if (match) {
        matches.push({
          entityType: 'competition',
          entityId: entity.id,
          name: entity.name,
          matchedText: match.matchedText,
          confidence: match.matchedField === 'name' ? 0.85 : 0.7,
        });
      }
    }

    this.logger.debug(`Entity match: ${matches.length} candidate(s) for sport "${input.sportId}".`);

    return { matches };
  }
}
