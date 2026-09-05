import { describe, expect, it } from 'vitest';
import { allocateMasterQuizSlots } from './master-allocation';

describe('allocateMasterQuizSlots', () => {
  it('distributes evenly across sports with ample inventory', () => {
    const available = new Map([
      ['football', 100],
      ['cricket', 100],
      ['tennis', 100],
    ]);
    const allocation = allocateMasterQuizSlots(available, 9);
    expect([...allocation.values()].reduce((a, b) => a + b, 0)).toBe(9);
    for (const count of allocation.values()) {
      expect(count).toBe(3);
    }
  });

  it('never allocates more than a sport has available', () => {
    const available = new Map([
      ['football', 2],
      ['cricket', 100],
    ]);
    const allocation = allocateMasterQuizSlots(available, 20);
    expect(allocation.get('football')).toBeLessThanOrEqual(2);
    expect([...allocation.values()].reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(20);
  });

  it('backfills from other sports when one sport is exhausted', () => {
    const available = new Map([
      ['football', 1],
      ['cricket', 100],
      ['tennis', 100],
    ]);
    const allocation = allocateMasterQuizSlots(available, 20);
    const total = [...allocation.values()].reduce((a, b) => a + b, 0);
    expect(total).toBe(20);
    expect(allocation.get('football')).toBe(1);
  });

  it('excludes sports with zero inventory entirely', () => {
    const available = new Map([
      ['football', 0],
      ['cricket', 100],
    ]);
    const allocation = allocateMasterQuizSlots(available, 10);
    expect(allocation.has('football')).toBe(false);
    expect(allocation.get('cricket')).toBe(10);
  });

  it('returns an empty allocation when no sport has inventory', () => {
    const available = new Map([['football', 0]]);
    const allocation = allocateMasterQuizSlots(available, 10);
    expect(allocation.size).toBe(0);
  });

  it('never exceeds total available inventory across all sports', () => {
    const available = new Map([
      ['football', 2],
      ['cricket', 3],
    ]);
    const allocation = allocateMasterQuizSlots(available, 20);
    const total = [...allocation.values()].reduce((a, b) => a + b, 0);
    expect(total).toBe(5);
  });

  it('distributes a small count across many sports without leaving all-zero allocations', () => {
    const available = new Map(
      [
        'football',
        'cricket',
        'basketball',
        'tennis',
        'formula-1',
        'golf',
        'american-football',
        'mma',
        'boxing',
      ].map((sport) => [sport, 50]),
    );
    const allocation = allocateMasterQuizSlots(available, 10);
    const total = [...allocation.values()].reduce((a, b) => a + b, 0);
    expect(total).toBe(10);
  });
});
