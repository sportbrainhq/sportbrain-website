import { describe, expect, it, vi } from 'vitest';
import type { GenerationRequestContext } from './generator.types';
import { HonourFactRepository } from './honour-fact.repository';
import { HonourWinnerGenerator } from './honour-winner.generator';

function buildContext(overrides: Partial<GenerationRequestContext> = {}): GenerationRequestContext {
  return {
    sportId: 'sport-1',
    sportSlug: 'football',
    sourceType: 'competition',
    sourceEntityType: null,
    sourceEntityId: null,
    sourceLabel: 'La Liga',
    seasonContext: null,
    categories: ['RECORDS'],
    difficulties: ['EASY', 'MEDIUM', 'HARD'],
    requestedCount: 10,
    ...overrides,
  };
}

function buildFact(overrides: Record<string, unknown> = {}) {
  return {
    honourId: 'h1',
    title: '1969–70 La Liga',
    competitionKey: 'La Liga',
    winningTeamId: 't1',
    winningTeamName: 'Atlético Madrid',
    winningTeamKind: 'club',
    winningTeamNotability: 1000,
    prestige: 1,
    ...overrides,
  };
}

function buildRepository(overrides: Record<string, unknown> = {}): HonourFactRepository {
  return {
    findUnambiguousTeamTitles: vi.fn().mockResolvedValue([buildFact()]),
    findCompetitionScopedDistractorNames: vi
      .fn()
      .mockResolvedValue(['Real Madrid', 'Barcelona', 'Valencia']),
    findDistractorTeamNames: vi.fn().mockResolvedValue([]),
    ...overrides,
  } as unknown as HonourFactRepository;
}

describe('HonourWinnerGenerator', () => {
  it('produces one candidate per unambiguous team-title fact, with the winner as the correct option', async () => {
    const repository = buildRepository();
    const generator = new HonourWinnerGenerator(repository);
    const candidates = await generator.generate(buildContext());

    expect(candidates).toHaveLength(1);
    const candidate = candidates[0]!;
    expect(candidate.questionText).toBe('Which team won the 1969–70 La Liga?');
    expect(candidate.options).toHaveLength(4);
    expect(candidate.options.filter((o) => o.isCorrect)).toHaveLength(1);
    expect(candidate.options.find((o) => o.isCorrect)?.optionText).toBe('Atlético Madrid');
    expect(candidate.factKey).toBe('football:honour:1969-70-la-liga');
    expect(candidate.generationMethod).toBe('TEMPLATE');
  });

  it('prefers competition-scoped distractors over the sport-wide fallback', async () => {
    const repository = buildRepository();
    const generator = new HonourWinnerGenerator(repository);
    const candidates = await generator.generate(buildContext());

    expect(repository.findCompetitionScopedDistractorNames).toHaveBeenCalledWith(
      'sport-1',
      'La Liga',
      't1',
      'Atlético Madrid',
      1000,
      3,
    );
    expect(repository.findDistractorTeamNames).not.toHaveBeenCalled();
    const distractors = candidates[0]?.options.filter((o) => !o.isCorrect).map((o) => o.optionText);
    expect(distractors).toEqual(expect.arrayContaining(['Real Madrid', 'Barcelona', 'Valencia']));
  });

  it('backfills from the sport-wide pool when the competition-scoped pool is short', async () => {
    const repository = buildRepository({
      findCompetitionScopedDistractorNames: vi.fn().mockResolvedValue(['Real Madrid']),
      findDistractorTeamNames: vi.fn().mockResolvedValue(['Barcelona', 'Valencia']),
    });
    const generator = new HonourWinnerGenerator(repository);
    const candidates = await generator.generate(buildContext());

    expect(repository.findDistractorTeamNames).toHaveBeenCalledWith(
      'sport-1',
      't1',
      'club',
      'Atlético Madrid',
      1000,
      2,
    );
    expect(candidates[0]?.options).toHaveLength(4);
  });

  it('skips a fact when fewer than three distractors are available from either pool', async () => {
    const repository = buildRepository({
      findCompetitionScopedDistractorNames: vi.fn().mockResolvedValue(['Real Madrid']),
      findDistractorTeamNames: vi.fn().mockResolvedValue([]),
    });
    const generator = new HonourWinnerGenerator(repository);
    const candidates = await generator.generate(buildContext());

    expect(candidates).toHaveLength(0);
  });

  it('maps prestige 1 to EASY when EASY was requested', async () => {
    const repository = buildRepository({
      findUnambiguousTeamTitles: vi
        .fn()
        .mockResolvedValue([
          buildFact({ title: 'Some Cup', competitionKey: 'Some Cup', prestige: 1 }),
        ]),
    });
    const generator = new HonourWinnerGenerator(repository);
    const candidates = await generator.generate(buildContext({ difficulties: ['EASY', 'HARD'] }));

    expect(candidates[0]?.suggestedDifficulty).toBe('EASY');
  });

  it('falls back to the first requested difficulty when the natural mapping was not requested', async () => {
    const repository = buildRepository({
      findUnambiguousTeamTitles: vi
        .fn()
        .mockResolvedValue([
          buildFact({ title: 'Some Cup', competitionKey: 'Some Cup', prestige: 1 }),
        ]),
    });
    const generator = new HonourWinnerGenerator(repository);
    const candidates = await generator.generate(buildContext({ difficulties: ['EXPERT'] }));

    expect(candidates[0]?.suggestedDifficulty).toBe('EXPERT');
  });

  it('never returns duplicate option text', async () => {
    const repository = buildRepository({
      findUnambiguousTeamTitles: vi
        .fn()
        .mockResolvedValue([
          buildFact({ title: 'Some Cup', competitionKey: 'Some Cup', prestige: null }),
        ]),
    });
    const generator = new HonourWinnerGenerator(repository);
    const candidates = await generator.generate(buildContext());
    const texts = candidates[0]?.options.map((o) => o.optionText) ?? [];
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('never offers the winner itself as a distractor, even if the pools return it', async () => {
    const repository = buildRepository({
      findCompetitionScopedDistractorNames: vi
        .fn()
        .mockResolvedValue(['Atlético Madrid', 'Real Madrid', 'Barcelona']),
      findDistractorTeamNames: vi.fn().mockResolvedValue(['Valencia']),
    });
    const generator = new HonourWinnerGenerator(repository);
    const candidates = await generator.generate(buildContext());
    const distractors =
      candidates[0]?.options.filter((o) => !o.isCorrect).map((o) => o.optionText) ?? [];
    expect(distractors).not.toContain('Atlético Madrid');
  });
});
