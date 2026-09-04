import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsWorkerRepository } from '../modules/news/news-worker.repository';
import { QueueService } from '../queue/queue.service';

/**
 * Polls `news_sources` for feeds due to be re-fetched and enqueues one
 * `news-fetch` job per due source.
 *
 * Deliberately does no fetching itself: this job's only responsibility is
 * "what is due, and does a job exist for it", so the fetch's own retry,
 * timeout and persistence logic lives in exactly one place
 * (`NewsFetcherService`, run from `queue/news-fetch.worker.ts`), reachable
 * whether it was triggered by this schedule or the manual CLI.
 *
 * `QueueService.enqueueFetch` uses a deterministic job id (`fetch:<sourceId>`,
 * see `queue.service.ts`), so if a source is still due on the next tick
 * because its in-flight fetch hasn't completed yet, BullMQ treats the
 * duplicate `add()` as a no-op rather than queuing a second concurrent fetch
 * of the same source.
 *
 * One source's enqueue failing (e.g. a Redis hiccup) is caught and logged so
 * it does not stop the loop from enqueueing the rest.
 */
@Injectable()
export class NewsSchedulerJob {
  private readonly logger = new Logger(NewsSchedulerJob.name);

  constructor(
    private readonly repository: NewsWorkerRepository,
    private readonly queue: QueueService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'news-scheduler' })
  async run(): Promise<void> {
    let dueSources: Awaited<ReturnType<NewsWorkerRepository['findDueSources']>>;
    try {
      dueSources = await this.repository.findDueSources();
    } catch (error) {
      this.logger.error(
        `Failed to query due news sources: ${error instanceof Error ? error.message : String(error)}`,
      );
      return;
    }

    if (dueSources.length === 0) return;

    this.logger.debug(`${dueSources.length} news source(s) due for fetch`);

    for (const source of dueSources) {
      try {
        await this.queue.enqueueFetch({ sourceId: source.id });
      } catch (error) {
        this.logger.error(
          `Failed to enqueue fetch for source "${source.slug}": ${error instanceof Error ? error.message : String(error)}`,
        );
        // Continue: one bad source must not stop the rest from being enqueued.
      }
    }
  }
}
