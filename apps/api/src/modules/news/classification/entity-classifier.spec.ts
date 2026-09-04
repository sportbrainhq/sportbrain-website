import { describe, expect, it, vi } from 'vitest';
import { EntityClassifier } from './entity-classifier';
import type { EntityClassificationRepository } from './entity-classification.repository';

function makeRepository(overrides: {
  teams?: Array<{ id: string; name: string; aliases: string[] }>;
  persons?: Array<{ id: string; name: string; aliases: string[] }>;
  competitions?: Array<{ id: string; name: string; aliases: string[] }>;
}): EntityClassificationRepository {
  return {
    findTeamsForSport: vi.fn().mockResolvedValue(overrides.teams ?? []),
    findPersonsForSport: vi.fn().mockResolvedValue(overrides.persons ?? []),
    findCompetitionsForSport: vi.fn().mockResolvedValue(overrides.competitions ?? []),
  } as unknown as EntityClassificationRepository;
}

describe('EntityClassifier', () => {
  it('returns no matches and skips querying when sportId is null', async () => {
    const repository = makeRepository({});
    const classifier = new EntityClassifier(repository);

    const result = await classifier.classify({
      headline: 'Manchester United beat rivals',
      summary: null,
      sportId: null,
    });

    expect(result.matches).toEqual([]);
    expect(repository.findTeamsForSport).not.toHaveBeenCalled();
  });

  it('matches a team by its canonical name', async () => {
    const repository = makeRepository({
      teams: [
        { id: 'team-1', name: 'Manchester United', aliases: ['Man United', 'Man Utd', 'MUFC'] },
      ],
    });
    const classifier = new EntityClassifier(repository);

    const result = await classifier.classify({
      headline: 'Manchester United confirm new signing',
      summary: null,
      sportId: 'sport-football',
    });

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]).toMatchObject({ entityType: 'team', entityId: 'team-1' });
    expect(result.matches[0]!.confidence).toBeGreaterThan(0.8);
  });

  it.each(['Man United', 'Man Utd', 'MUFC'])(
    'matches Manchester United via the alias "%s"',
    async (alias) => {
      const repository = makeRepository({
        teams: [
          { id: 'team-1', name: 'Manchester United', aliases: ['Man United', 'Man Utd', 'MUFC'] },
        ],
      });
      const classifier = new EntityClassifier(repository);

      const result = await classifier.classify({
        headline: `${alias} secure vital win`,
        summary: null,
        sportId: 'sport-football',
      });

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0]).toMatchObject({ entityType: 'team', entityId: 'team-1' });
      expect(result.matches[0]!.matchedText).toBe(alias);
      expect(result.matches[0]!.confidence).toBeCloseTo(0.7);
    },
  );

  it('matches a player and a competition in the same article', async () => {
    const repository = makeRepository({
      persons: [{ id: 'person-1', name: 'Marcus Rashford', aliases: [] }],
      competitions: [{ id: 'comp-1', name: 'Premier League', aliases: ['EPL'] }],
    });
    const classifier = new EntityClassifier(repository);

    const result = await classifier.classify({
      headline: 'Marcus Rashford scores twice in Premier League win',
      summary: null,
      sportId: 'sport-football',
    });

    const types = result.matches.map((m) => m.entityType).sort();
    expect(types).toEqual(['competition', 'player']);
  });

  it('does not match a name shorter than the safety floor or a non-matching alias', async () => {
    const repository = makeRepository({
      teams: [
        { id: 'team-1', name: 'Manchester United', aliases: ['Man United', 'Man Utd', 'MUFC'] },
      ],
    });
    const classifier = new EntityClassifier(repository);

    const result = await classifier.classify({
      headline: 'Liverpool win away at Chelsea',
      summary: null,
      sportId: 'sport-football',
    });

    expect(result.matches).toEqual([]);
  });
});
