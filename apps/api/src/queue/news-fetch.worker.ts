import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Worker, type Job } from 'bullmq';
import type { TypedConfigService } from '../config';
import { NewsFetcherService } from '../modules/news/news-fetcher.service';
import { NewsWorkerRepository } from '../modules/news/news-worker.repository';
import { NEWS_FETCH_QUEUE, type FetchJobData } from './queue.types';
import { QueueService } from './queue.service';

/**
 * Consumes `news-fetch` jobs.
 *
 * Only started when `QueueService.enabled` is true (Redis configured) — see
 * `QueueModule`/`QueueService` for why a Worker cannot meaningfully exist
 * without a real Redis connection. Concurrency and retry/backoff come from
 * typed config, not hardcoded, per the task spec.
 *
 * Persistence (the `news_feed_fetches` row and `news_sources` health fields)
 * happens inside `NewsFetcherService.fetchSource` unconditionally — it is
 * not gated on this job succeeding. This handler enqueues the follow-up
 * `news-process` job on success and lets a genuine fetch failure re-throw so
 * BullMQ's own retry/backoff (attempts from `news.rss.retryCount`,
 * exponential) governs whether the job is retried; the bookkeeping already
 * written to Postgres does not depend on that outcome.
 */
@Injectable()
export class NewsFetchWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NewsFetchWorker.name);
  private worker: Worker<FetchJobData> | undefined;

  constructor(
    private readonly queueService: QueueService,
    private readonly fetcher: NewsFetcherService,
    private readonly repository: NewsWorkerRepository,
    private readonly config: TypedConfigService,
  ) {}

  onModuleInit(): void {
    const connection = this.queueService.getConnection();
    if (!this.queueService.enabled || !connection) {
      this.logger.warn('Queue disabled (no REDIS_URL): news-fetch worker not started');
      return;
    }

    const concurrency = this.config.get('news.queue.fetchConcurrency', { infer: true });

    this.worker = new Worker<FetchJobData>(
      NEWS_FETCH_QUEUE,
      async (job: Job<FetchJobData>) => this.handle(job),
      { connection, concurrency },
    );

    this.worker.on('failed', (job, error) => {
      this.logger.error(`news-fetch job ${job?.id} failed: ${error.message}`);
    });

    this.logger.log(`news-fetch worker started (concurrency ${concurrency})`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }

  private async handle(job: Job<FetchJobData>): Promise<void> {
    const source = await this.repository.findSourceById(job.data.sourceId);
    if (!source) {
      // Not retryable: the source no longer exists. Throwing lets BullMQ
      // record the failure, but retrying an unknown source id can never
      // succeed, so this is logged loudly rather than looped on forever by
      // BullMQ's attempts (attempts are still bounded, but there's no point
      // spending them).
      throw new Error(`news-fetch job referenced unknown source "${job.data.sourceId}"`);
    }

    const result = await this.fetcher.fetchSource(source);

    if (result.outcome === 'processed') {
      await this.queueService.enqueueProcess({ fetchId: result.fetchId });
      return;
    }

    if (result.outcome === 'unchanged') {
      return;
    }

    // 'rejected' (SSRF-guard failure, invalid URL) and 'failed' (network/HTTP
    // failure) have already been persisted to news_feed_fetches and
    // news_sources by fetchSource. Throwing here lets BullMQ apply its
    // configured retry/backoff for genuine transient failures; a 'rejected'
    // URL will simply fail the same way on every retry, which is acceptable
    // — it surfaces clearly in the worker's failure logs for an operator to
    // fix the source configuration.
    const detail = result.outcome === 'rejected' ? result.reason : result.errorMessage;
    throw new Error(`news-fetch failed for source "${source.slug}": ${detail}`);
  }
}
