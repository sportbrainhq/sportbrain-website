import { describe, expect, it, vi } from 'vitest';
import type {
  GeneratedCandidate,
  GenerationRequestContext,
  QuestionGenerator,
} from './generator.types';
import { TemplateGenerator } from './template.generator';

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

function buildCandidate(label: string): GeneratedCandidate {
  return {
    factKey: `football:${label}`,
    sourceEntityType: null,
    sourceEntityId: null,
    questionText: `Question from ${label}`,
    options: [
      { optionText: 'A', isCorrect: true, explanation: null },
      { optionText: 'B', isCorrect: false, explanation: null },
      { optionText: 'C', isCorrect: false, explanation: null },
      { optionText: 'D', isCorrect: false, explanation: null },
    ],
    explanation: null,
    suggestedCategory: 'RECORDS',
    suggestedDifficulty: 'MEDIUM',
    sourceReferences: [],
    generationMethod: 'TEMPLATE',
    generationModel: null,
  };
}

function buildSubGenerator(candidates: GeneratedCandidate[]): QuestionGenerator {
  return {
    method: 'TEMPLATE',
    version: 'stub',
    generate: vi.fn().mockResolvedValue(candidates),
  };
}

const empty = () => buildSubGenerator([]);

describe('TemplateGenerator (composite)', () => {
  it('interleaves output across all four sub-generators rather than concatenating', async () => {
    const honourWinner = buildSubGenerator([buildCandidate('honour-1')]);
    const playerStat = buildSubGenerator([buildCandidate('stat-1')]);
    const clubHistory = buildSubGenerator([buildCandidate('club-1')]);
    const playerIdentity = buildSubGenerator([buildCandidate('identity-1')]);
    const generator = new TemplateGenerator(
      honourWinner as never,
      playerStat as never,
      clubHistory as never,
      playerIdentity as never,
    );

    const result = await generator.generate(buildContext({ requestedCount: 4 }));

    expect(result.map((c) => c.factKey)).toEqual([
      'football:honour-1',
      'football:stat-1',
      'football:club-1',
      'football:identity-1',
    ]);
  });

  it('uses only the working sub-generators when the others return nothing', async () => {
    const honourWinner = buildSubGenerator([
      buildCandidate('honour-1'),
      buildCandidate('honour-2'),
    ]);
    const generator = new TemplateGenerator(
      honourWinner as never,
      empty() as never,
      empty() as never,
      empty() as never,
    );

    const result = await generator.generate(buildContext({ requestedCount: 4 }));

    expect(result).toHaveLength(2);
    expect(result.every((c) => c.factKey.startsWith('football:honour'))).toBe(true);
  });

  it('does not fail the whole batch when one sub-generator throws', async () => {
    const throwing: QuestionGenerator = {
      method: 'TEMPLATE',
      version: 'stub',
      generate: vi.fn().mockRejectedValue(new Error('boom')),
    };
    const playerStat = buildSubGenerator([buildCandidate('stat-1')]);
    const generator = new TemplateGenerator(
      throwing as never,
      playerStat as never,
      empty() as never,
      empty() as never,
    );

    const result = await generator.generate(buildContext({ requestedCount: 4 }));

    expect(result).toHaveLength(1);
  });

  it('never returns more than requestedCount', async () => {
    const many = () =>
      buildSubGenerator(Array.from({ length: 10 }, (_, i) => buildCandidate(`x${i}`)));
    const generator = new TemplateGenerator(
      many() as never,
      many() as never,
      many() as never,
      many() as never,
    );

    const result = await generator.generate(buildContext({ requestedCount: 5 }));

    expect(result.length).toBeLessThanOrEqual(5);
  });
});
