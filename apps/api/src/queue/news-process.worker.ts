import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, type Job } from 'bullmq';
import type { AppConfig } from '../config/configuration';
import { MetricsService } from '../infrastructure/metrics/metrics.service';
import { NewsProcessorService } from '../modules/news/news-processor.service';
import { NEWS_PROCESS_QUEUE, type ProcessJobData } from './queue.types';
import { QueueService } from './queue.service';

/**
 * Consumes `news-process` jobs: parses one fetch's raw body and inserts
 * `news_articles` rows. See `NewsProcessorService` for the per-item
 * resilience (one malformed article does not fail the batch); this handler
 * only needs to fail the whole job when the fetch row itself could not be
 * loaded, which `NewsProcessorService.processFetch` signals by throwing.
 */
@Injectable()
export class NewsProcessWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NewsProcessWorker.name);
  private worker: Worker<ProcessJobData> | undefined;

  constructor(
    private readonly queueService: QueueService,
    private readonly processor: NewsProcessorService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly metrics: MetricsService,
  ) {}

  onModuleInit(): void {
    const connection = this.queueService.getConnection();
    if (!this.queueService.enabled || !connection) {
      this.logger.warn('Queue disabled (no REDIS_URL): news-process worker not started');
      return;
    }

    const concurrency = this.config.get('news.queue.processConcurrency', { infer: true });

    this.worker = new Worker<ProcessJobData>(
      NEWS_PROCESS_QUEUE,
      async (job: Job<ProcessJobData>) => {
        await this.processor.processFetch(job.data.fetchId);
      },
      { connection, concurrency },
    );

    this.worker.on('failed', (job, error) => {
      this.metrics.incrementCounter('queue_failure_total', { queue: NEWS_PROCESS_QUEUE });
      this.logger.error(
        `news-process job ${job?.id} failed (fetchId "${job?.data?.fetchId}"): ${error.message}`,
      );
    });

    this.logger.log(`news-process worker started (concurrency ${concurrency})`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
