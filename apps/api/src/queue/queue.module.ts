import { Global, Module } from '@nestjs/common';
import { NewsFetcherService } from '../modules/news/news-fetcher.service';
import { NewsProcessorService } from '../modules/news/news-processor.service';
import { NewsWorkerRepository } from '../modules/news/news-worker.repository';
import { NewsFetchWorker } from './news-fetch.worker';
import { NewsProcessWorker } from './news-process.worker';
import { QueueService } from './queue.service';

/**
 * Binds the News Engine's BullMQ queues.
 *
 * Global, matching `CacheModule` and `DatabaseModule`: any module that wants
 * to enqueue a job (the scheduler, a CLI, a future admin endpoint) injects
 * `QueueService` directly. `QueueService` itself decides, at construction,
 * whether Redis is configured; see its doc comment for what happens when it
 * isn't. This module never fails to register — the "no Redis" case is
 * handled inside the service, not by conditionally omitting it here, so a
 * missing `REDIS_URL` cannot leave `QueueService` unbound for an injector
 * that expects it to exist.
 *
 * The BullMQ `Worker`s (`NewsFetchWorker`, `NewsProcessWorker`) live here
 * too, alongside the news-engine services/repository they depend on. Each
 * worker's `onModuleInit` checks `QueueService.enabled` itself and simply
 * does not start when Redis is unconfigured (see their own doc comments),
 * so registering them unconditionally is safe.
 */
@Global()
@Module({
  providers: [
    QueueService,
    NewsWorkerRepository,
    NewsFetcherService,
    NewsProcessorService,
    NewsFetchWorker,
    NewsProcessWorker,
  ],
  exports: [QueueService, NewsWorkerRepository, NewsFetcherService, NewsProcessorService],
})
export class QueueModule {}
