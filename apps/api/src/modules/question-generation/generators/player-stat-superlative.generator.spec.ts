import { describe, expect, it, vi } from 'vitest';
import type { GenerationRequestContext } from './generator.types';
import { PlayerStatRepository, type PlayerStatRow } from './player-stat.repository';
import { PlayerStatSuperlativeGenerator } from './player-stat-superlative.generator';

function buildContext(overrides: Partial<GenerationRequestContext> = {}): GenerationRequestContext {
  return {
    sportId: 'sport-1',
    sportSlug: 'football',
    sourceType: 'structured_dataset',
    sourceEntityType: null,
    sourceEntityId: null,
    sourceLabel: '',
    seasonContext: null,
    categories: ['PLAYERS'],
    difficulties: ['EASY', 'MEDIUM', 'HARD', 'EXPERT'],
    requestedCount: 4,
    ...overrides,
  };
}

function buildRow(overrides: Partial<PlayerStatRow> = {}): PlayerStatRow {
  return { personId: 'p1', displayName: 'Player One', value: 100, ...overrides };
}

function buildRepository(sample: PlayerStatRow[]): PlayerStatRepository {
  return { sampleWithStat: vi.fn().mockResolvedValue(sample) } as unknown as PlayerStatRepository;
}

describe('PlayerStatSuperlativeGenerator', () => {
  it('picks the highest-value player as the correct answer', async () => {
    const sample = [
      buildRow({ personId: 'p1', displayName: 'Player One', value: 100 }),
      buildRow({ personId: 'p2', displayName: 'Player Two', value: 300 }),
      buildRow({ personId: 'p3', displayName: 'Player Three', value: 50 }),
      buildRow({ personId: 'p4', displayName: 'Player Four', value: 20 }),
    ];
    const generator = new PlayerStatSuperlativeGenerator(buildRepository(sample));
    const candidates = await generator.generate(buildContext({ requestedCount: 1 }));

    expect(candidates).toHaveLength(1);
    const correct = candidates[0]!.options.find((o) => o.isCorrect);
    expect(correct?.optionText).toBe('Player Two');
  });

  it('produces exactly four options, all real sampled players', async () => {
    const sample = [
      buildRow({ personId: 'p1', displayName: 'A', value: 1 }),
      buildRow({ personId: 'p2', displayName: 'B', value: 2 }),
      buildRow({ personId: 'p3', displayName: 'C', value: 3 }),
      buildRow({ personId: 'p4', displayName: 'D', value: 4 }),
    ];
    const generator = new PlayerStatSuperlativeGenerator(buildRepository(sample));
    const candidates = await generator.generate(buildContext({ requestedCount: 1 }));

    expect(candidates[0]?.options).toHaveLength(4);
    expect(candidates[0]?.options.filter((o) => o.isCorrect)).toHaveLength(1);
  });

  it('rejects a sample where the top two values tie', async () => {
    const sample = [
      buildRow({ personId: 'p1', displayName: 'A', value: 10 }),
      buildRow({ personId: 'p2', displayName: 'B', value: 10 }),
      buildRow({ personId: 'p3', displayName: 'C', value: 5 }),
      buildRow({ personId: 'p4', displayName: 'D', value: 1 }),
    ];
    const generator = new PlayerStatSuperlativeGenerator(buildRepository(sample));
    const candidates = await generator.generate(buildContext({ requestedCount: 1 }));

    expect(candidates).toHaveLength(0);
  });

  it('dedupes a player appearing twice in the sample before checking the option count', async () => {
    const sample = [
      buildRow({ personId: 'p1', displayName: 'A', value: 10 }),
      buildRow({ personId: 'p1', displayName: 'A', value: 10 }), // duplicate row, same person
      buildRow({ personId: 'p3', displayName: 'C', value: 5 }),
      buildRow({ personId: 'p4', displayName: 'D', value: 1 }),
    ];
    const generator = new PlayerStatSuperlativeGenerator(buildRepository(sample));
    const candidates = await generator.generate(buildContext({ requestedCount: 1 }));

    // Only 3 distinct people after dedup — can't fill 4 option slots.
    expect(candidates).toHaveLength(0);
  });

  it('returns nothing for a sport with no curated stat fields', async () => {
    const generator = new PlayerStatSuperlativeGenerator(buildRepository([]));
    const candidates = await generator.generate(
      buildContext({ sportSlug: 'unknown-sport', requestedCount: 3 }),
    );
    expect(candidates).toHaveLength(0);
  });

  it('resolves DRIVERS category for formula-1, since its taxonomy has no PLAYERS category', async () => {
    const sample = [
      buildRow({ personId: 'p1', displayName: 'A', value: 10 }),
      buildRow({ personId: 'p2', displayName: 'B', value: 8 }),
      buildRow({ personId: 'p3', displayName: 'C', value: 5 }),
      buildRow({ personId: 'p4', displayName: 'D', value: 1 }),
    ];
    const generator = new PlayerStatSuperlativeGenerator(buildRepository(sample));
    const candidates = await generator.generate(
      buildContext({
        sportSlug: 'formula-1',
        categories: ['PLAYERS', 'DRIVERS'],
        requestedCount: 1,
      }),
    );

    expect(candidates[0]?.suggestedCategory).toBe('DRIVERS');
  });

  it('names the sampled players in the question text, so two different fact samples never fingerprint as duplicates', async () => {
    // Real bug this guards against: a generic "which of these players..."
    // question text is identical for every sampled group, which collapsed
    // every candidate for a stat field onto one questionFingerprint and
    // silently discarded all but the first — the direct cause of a sparse
    // sport generating dozens of candidates but publishing only one.
    const repository = {
      sampleWithStat: vi
        .fn()
        .mockResolvedValueOnce([
          buildRow({ personId: 'p1', displayName: 'Serena Williams', value: 20 }),
          buildRow({ personId: 'p2', displayName: 'Angelique Kerber', value: 5 }),
          buildRow({ personId: 'p3', displayName: 'Iga Świątek', value: 8 }),
          buildRow({ personId: 'p4', displayName: 'Andy Murray', value: 1 }),
        ])
        .mockResolvedValueOnce([
          buildRow({ personId: 'p5', displayName: 'Martina Navratilova', value: 20 }),
          buildRow({ personId: 'p6', displayName: 'Steffi Graf', value: 5 }),
          buildRow({ personId: 'p7', displayName: 'Justine Henin', value: 8 }),
          buildRow({ personId: 'p8', displayName: 'Jana Novotná', value: 1 }),
        ]),
    } as unknown as PlayerStatRepository;

    const generator = new PlayerStatSuperlativeGenerator(repository);
    const candidates = await generator.generate(
      buildContext({ sportSlug: 'tennis', requestedCount: 2 }),
    );

    expect(candidates).toHaveLength(2);
    expect(candidates[0]?.questionText).not.toBe(candidates[1]?.questionText);
    expect(candidates[0]?.questionText).toContain('Serena Williams');
    expect(candidates[1]?.questionText).toContain('Martina Navratilova');
  });
});
