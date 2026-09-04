import { describe, expect, it } from 'vitest';
import { TopicClassifier } from './topic-classifier';

describe('TopicClassifier', () => {
  const classifier = new TopicClassifier();

  it('matches "transfer" from "signs for" / "completes move"', () => {
    const result = classifier.classify({
      headline: 'Striker completes move to new club',
      summary: null,
    });
    expect(result.topics).toContain('transfer');
  });

  it('matches "injury" from "ruled out"', () => {
    const result = classifier.classify({
      headline: 'Star midfielder ruled out for six weeks with injury',
      summary: null,
    });
    expect(result.topics).toContain('injury');
  });

  it('matches "result" from "beat"/"wins"', () => {
    const result = classifier.classify({
      headline: 'Champions beat rivals to seal the title',
      summary: null,
    });
    expect(result.topics).toContain('result');
  });

  it('matches "match-preview" from "how to watch"/"kick-off time"', () => {
    const result = classifier.classify({
      headline: "How to watch tonight's game: kick-off time and team news",
      summary: null,
    });
    expect(result.topics).toContain('match-preview');
  });

  it('supports multiple topics per article', () => {
    const result = classifier.classify({
      headline: 'Captain ruled out ahead of Saturday preview clash with injury concern',
      summary: 'Team news: kick-off time confirmed after fitness test.',
    });
    expect(result.topics).toContain('injury');
    expect(result.topics).toContain('match-preview');
    expect(result.topics.length).toBeGreaterThanOrEqual(2);
  });

  it('returns an empty topics array (not a fabricated default) when nothing matches', () => {
    const result = classifier.classify({
      headline: 'A short, generic headline with no signal words',
      summary: null,
    });
    expect(result.topics).toEqual([]);
    expect(result.confidence).toBe(0);
  });

  it('never returns a topic outside the fixed taxonomy', () => {
    const result = classifier.classify({
      headline:
        'Breaking news: player signs for new club after injury, wins award, retires, banned for one match',
      summary: null,
    });
    const allowed = new Set([
      'breaking',
      'transfer',
      'injury',
      'match-preview',
      'match-report',
      'result',
      'selection',
      'contract',
      'rumour',
      'interview',
      'analysis',
      'record',
      'milestone',
      'disciplinary',
      'retirement',
      'business',
      'governance',
    ]);
    for (const topic of result.topics) {
      expect(allowed.has(topic)).toBe(true);
    }
  });
});
