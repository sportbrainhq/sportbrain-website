import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, type JobsOptions } from 'bullmq';
import Redis from 'ioredis';
import type { AppConfig } from '../config/configuration';
import {
  NEWS_FETCH_QUEUE,
  NEWS_PROCESS_QUEUE,
  type FetchJobData,
  type ProcessJobData,
} from './queue.types';

/**
 * Thin wrapper over the two News Engine BullMQ queues.
 *
 * `REDIS_URL` is optional (see `env.schema.ts`), and BullMQ has no useful
 * degraded mode without a real Redis connection: a `Queue` constructed
 * against nothing would hang or throw on the first `add()`. So rather than
 * constructing BullMQ `Queue` instances speculatively, this service only
 * creates them when `redis.url` is configured. When it isn't, `enqueueFetch`
 * / `enqueueProcess` log a warning and return without throwing, which is what
 * "no-op" means here: nothing is queued, nothing crashes, and the rest of the
 * app (including the scheduler, which calls this on a timer) keeps running.
 *
 * This mirrors `CacheModule`'s fallback shape (in-memory instead of Redis)
 * but the News Engine has no in-process substitute for a job queue, so the
 * fallback is "don't run background ingestion" rather than "run it locally".
 * That is an acceptable Phase 2 posture: without Redis configured, no
 * environment has ever depended on the fetcher/processor running anyway.
 */
@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly connection: Redis | undefined;

  private readonly fetchQueue: Queue<FetchJobData> | undefined;
  private readonly processQueue: Queue<ProcessJobData> | undefined;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    const redisUrl = this.config.get('redis.url', { infer: true });

    if (!redisUrl) {
      this.logger.warn(
        'REDIS_URL not configured: news-fetch/news-process queues are disabled. ' +
          'Enqueue calls will log and no-op; no BullMQ Queue or Worker is created.',
      );
      return;
    }

    this.connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // required by BullMQ for blocking connections
    });
    this.connection.on('error', (error) => {
      this.logger.warn(`Queue Redis connection error: ${error.message}`);
    });

    this.fetchQueue = new Queue<FetchJobData>(NEWS_FETCH_QUEUE, { connection: this.connection });
    this.processQueue = new Queue<ProcessJobData>(NEWS_PROCESS_QUEUE, {
      connection: this.connection,
    });

    this.logger.log('REDIS_URL configured, news-fetch/news-process queues are active');
  }

  /** Whether real BullMQ queues are backing this service (Redis configured). Workers should check this before starting. */
  get enabled(): boolean {
    return this.fetchQueue !== undefined && this.processQueue !== undefined;
  }

  getConnection(): Redis | undefined {
    return this.connection;
  }

  getFetchQueue(): Queue<FetchJobData> | undefined {
    return this.fetchQueue;
  }

  getProcessQueue(): Queue<ProcessJobData> | undefined {
    return this.processQueue;
  }

  /**
   * Enqueues a fetch job for one source.
   *
   * `jobId` is deterministic per source (see `queue.module.ts` job-options
   * defaults and callers) so that a source already mid-flight is not
   * double-enqueued: BullMQ treats adding a job with an existing, unfinished
   * id as a no-op rather than an error.
   */
  async enqueueFetch(data: FetchJobData, options?: JobsOptions): Promise<void> {
    if (!this.fetchQueue) {
      this.logger.warn(
        `Queue disabled (no REDIS_URL): skipped enqueueing fetch for source ${data.sourceId}`,
      );
      return;
    }
    await this.fetchQueue.add(NEWS_FETCH_QUEUE, data, {
      // BullMQ rejects a custom id containing ':' ("Custom Id cannot contain
      // :") since it namespaces its own Redis keys with that character.
      jobId: `fetch-${data.sourceId}`,
      ...options,
    });
  }

  async enqueueProcess(data: ProcessJobData, options?: JobsOptions): Promise<void> {
    if (!this.processQueue) {
      this.logger.warn(
        `Queue disabled (no REDIS_URL): skipped enqueueing process for fetch ${data.fetchId}`,
      );
      return;
    }
    await this.processQueue.add(NEWS_PROCESS_QUEUE, data, {
      // Same reason as enqueueFetch above: BullMQ rejects ':' in custom ids.
      jobId: `process-${data.fetchId}`,
      ...options,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.fetchQueue?.close().catch(() => undefined);
    await this.processQueue?.close().catch(() => undefined);
    await this.connection?.quit().catch(() => undefined);
  }
}
