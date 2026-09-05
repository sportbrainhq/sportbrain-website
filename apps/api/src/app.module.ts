import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AllExceptionsFilter, LoggingInterceptor, RequestIdMiddleware } from './common';
import { ConfigModule, type AppConfig } from './config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { CompetitionsModule } from './modules/competitions/competitions.module';
import { ContentModule } from './modules/content/content.module';
import { FixturesModule } from './modules/fixtures/fixtures.module';
import { NewsModule } from './modules/news/news.module';
import { PlayersModule } from './modules/players/players.module';
import { SearchModule } from './modules/search/search.module';
import { SharedModule } from './modules/shared/shared.module';
import { SportsModule } from './modules/sports/sports.module';
import { TeamsModule } from './modules/teams/teams.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { MetricsModule } from './infrastructure/metrics/metrics.module';
import { JobsModule } from './jobs/jobs.module';
import { InternalNewsModule } from './modules/internal-news/internal-news.module';
import { ContactModule } from './modules/contact/contact.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SavedEntitiesModule } from './modules/saved-entities/saved-entities.module';
import { FollowsModule } from './modules/follows/follows.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { ActivityModule } from './modules/activity/activity.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { QuestionGenerationModule } from './modules/question-generation/question-generation.module';
import { QuizGenerationModule } from './modules/quiz-generation/quiz-generation.module';
import { QuizAttemptsModule } from './modules/quiz-attempts/quiz-attempts.module';
import { QuizStatsModule } from './modules/quiz-stats/quiz-stats.module';
import { QuestionReportsModule } from './modules/question-reports/question-reports.module';
import { QueueModule } from './queue/queue.module';

/**
 * The application root.
 *
 * Composition order reflects dependency order: configuration is available to
 * everything, then infrastructure (database, cache, jobs), then the feature
 * modules that use them.
 *
 * `modules/` is empty at this stage. Domain modules are imported here as they
 * are built.
 */
@Module({
  imports: [
    // Must be first: everything below reads configuration.
    ConfigModule,

    // Rate limiting applies to every route by default via APP_GUARD below.
    // Individual routes relax or tighten it with @Throttle.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const rateLimit = config.get('rateLimit', { infer: true });
        return [
          {
            name: 'default',
            ttl: rateLimit.ttlSeconds * 1_000,
            limit: rateLimit.limit,
          },
        ];
      },
    }),

    // Infrastructure. All three are @Global, so feature modules inject their
    // services without importing them.
    DatabaseModule,
    CacheModule,
    MetricsModule,
    // Must precede JobsModule: NewsSchedulerJob (registered by
    // JobsModule.register() when jobs are enabled) injects QueueService and
    // NewsWorkerRepository, both exported by this @Global module.
    QueueModule,
    JobsModule.register(),

    // Platform features.
    HealthModule,

    // External data sources and the ingestion pipeline.
    IntegrationsModule,

    // Domain modules. SharedModule is first because it is @Global and the
    // others inject the statistics assembler it provides. AuthModule comes
    // right after: several later modules (users, saved-entities, follows)
    // will import it for `SessionGuard`.
    SharedModule,
    AuthModule,
    ActivityModule,
    UsersModule,
    SavedEntitiesModule,
    FollowsModule,
    PreferencesModule,
    // Phase C: the canonical Question Bank. Depends on nothing sport-specific
    // beyond `sport.id`, so it sits alongside the other account-adjacent
    // domain modules rather than inside SportsModule.
    QuestionsModule,
    QuestionGenerationModule,
    QuizGenerationModule,
    QuizAttemptsModule,
    QuizStatsModule,
    QuestionReportsModule,
    SportsModule,
    TeamsModule,
    PlayersModule,
    CompetitionsModule,
    ContentModule,
    FixturesModule,
    SearchModule,
    NewsModule,
    InternalNewsModule,
    ContactModule,
  ],
  providers: [
    // Registered globally so that every route gets the same error envelope,
    // the same request logging and the same rate limit, without a controller
    // having to opt in.
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Runs before everything, so the id is available to the logger and to the
    // exception filter on any route.
    //
    // `{*path}` rather than `*`: path-to-regexp v8, which Express 5 and Nest 11
    // use, requires named wildcard parameters.
    consumer.apply(RequestIdMiddleware).forRoutes('{*path}');
  }
}
