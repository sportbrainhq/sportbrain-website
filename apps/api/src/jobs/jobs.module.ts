import { Logger, Module, type DynamicModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { loadConfiguration } from '../config/configuration';
import { NewsSchedulerJob } from './news-scheduler.job';

/**
 * Scheduled and background work.
 *
 * Contains no jobs. It exists so that adding the first one is a matter of
 * writing a provider and listing it here, rather than deciding scheduling
 * infrastructure under time pressure.
 *
 * ## Adding a job
 *
 * ```ts
 * @Injectable()
 * export class WarmHomepageCacheJob {
 *   private readonly logger = new Logger(WarmHomepageCacheJob.name);
 *
 *   constructor(private readonly cache: CacheService) {}
 *
 *   @Cron(CronExpression.EVERY_10_MINUTES, { name: 'warm-homepage-cache' })
 *   async run(): Promise<void> {
 *     // Jobs catch their own errors. An unhandled rejection in a scheduled
 *     // callback has no request to fail, so it surfaces nowhere useful.
 *   }
 * }
 * ```
 *
 * Then add it to `providers` in the object returned by `register()`.
 *
 * ## The multi-replica problem
 *
 * `@nestjs/schedule` runs in-process, so every replica runs every cron. With
 * one instance that is fine. With more, a job that sends email or writes to an
 * external system will do so N times.
 *
 * `JOBS_ENABLED` is the interim control: run one replica with it on. Before
 * scaling out with real jobs, either move to a queue with a single consumer
 * (BullMQ, which needs Redis) or take a Postgres advisory lock at the top of
 * each job. That decision is deferred because it has no answer worth
 * committing to until the first real job exists.
 */
@Module({})
export class JobsModule {
  /**
   * Registers the scheduler only when jobs are enabled.
   *
   * When disabled, ScheduleModule is never imported and no timers are created,
   * which is what makes `JOBS_ENABLED=false` a genuine off switch rather than
   * a flag each job has to remember to check.
   *
   * Configuration is read directly rather than through ConfigService because
   * this runs at module-definition time, before the DI container exists.
   */
  static register(): DynamicModule {
    const enabled = loadConfiguration().jobs.enabled;

    // Logged once at boot, so "why did my cron not run" is answerable from
    // the start-up log.
    new Logger(JobsModule.name).log(
      enabled ? 'Scheduled jobs enabled' : 'Scheduled jobs disabled (JOBS_ENABLED=false)',
    );

    return {
      module: JobsModule,
      imports: enabled ? [ScheduleModule.forRoot()] : [],
      providers: [
        // Job providers go here. See the class comment.
        //
        // NewsSchedulerJob depends on NewsWorkerRepository and QueueService,
        // both exported by the @Global QueueModule, so no import is needed
        // here beyond ScheduleModule for @Cron to work.
        ...(enabled ? [NewsSchedulerJob] : []),
      ],
    };
  }
}
