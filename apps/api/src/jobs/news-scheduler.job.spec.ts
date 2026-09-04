import { describe, expect, it, vi } from 'vitest';
import type { NewsWorkerRepository, DueSource } from '../modules/news/news-worker.repository';
import type { QueueService } from '../queue/queue.service';
import { NewsSchedulerJob } from './news-scheduler.job';

/**
 * No repository *.repository.spec.ts convention exists elsewhere in the
 * codebase (a SQL-touching repository test would need a live database, and
 * none of the existing repositories have one). This tests the scheduler
 * job's own logic — the due-sources query result being turned into enqueue
 * calls, with per-source error isolation — against a mocked repository and
 * queue, which is what `findDueSources`'s SQL predicate cannot be
 * meaningfully unit-tested without a database in the first place.
 */
describe('NewsSchedulerJob', () => {
  function source(id: string): DueSource {
    return {
      id,
      slug: `source-${id}`,
      name: `Source ${id}`,
      feedUrl: 'https://example.com/rss',
      etag: null,
      lastModified: null,
    };
  }

  it('enqueues one fetch job per due source', async () => {
    const repository = {
      findDueSources: vi.fn().mockResolvedValue([source('a'), source('b')]),
    } as unknown as NewsWorkerRepository;
    const queue = { enqueueFetch: vi.fn().mockResolvedValue(undefined) } as unknown as QueueService;

    const job = new NewsSchedulerJob(repository, queue);
    await job.run();

    expect(queue.enqueueFetch).toHaveBeenCalledTimes(2);
    expect(queue.enqueueFetch).toHaveBeenCalledWith({ sourceId: 'a' });
    expect(queue.enqueueFetch).toHaveBeenCalledWith({ sourceId: 'b' });
  });

  it('does nothing when no sources are due', async () => {
    const repository = {
      findDueSources: vi.fn().mockResolvedValue([]),
    } as unknown as NewsWorkerRepository;
    const queue = { enqueueFetch: vi.fn() } as unknown as QueueService;

    const job = new NewsSchedulerJob(repository, queue);
    await job.run();

    expect(queue.enqueueFetch).not.toHaveBeenCalled();
  });

  it('continues enqueueing remaining sources when one enqueue fails', async () => {
    const repository = {
      findDueSources: vi.fn().mockResolvedValue([source('a'), source('b'), source('c')]),
    } as unknown as NewsWorkerRepository;
    const queue = {
      enqueueFetch: vi
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('redis blip'))
        .mockResolvedValueOnce(undefined),
    } as unknown as QueueService;

    const job = new NewsSchedulerJob(repository, queue);
    await expect(job.run()).resolves.toBeUndefined();

    expect(queue.enqueueFetch).toHaveBeenCalledTimes(3);
  });

  it('does not throw when the due-sources query itself fails', async () => {
    const repository = {
      findDueSources: vi.fn().mockRejectedValue(new Error('db down')),
    } as unknown as NewsWorkerRepository;
    const queue = { enqueueFetch: vi.fn() } as unknown as QueueService;

    const job = new NewsSchedulerJob(repository, queue);
    await expect(job.run()).resolves.toBeUndefined();
    expect(queue.enqueueFetch).not.toHaveBeenCalled();
  });
});
