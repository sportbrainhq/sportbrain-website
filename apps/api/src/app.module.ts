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
import { PlayersModule } from './modules/players/players.module';
import { SearchModule } from './modules/search/search.module';
import { SharedModule } from './modules/shared/shared.module';
import { SportsModule } from './modules/sports/sports.module';
import { TeamsModule } from './modules/teams/teams.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { JobsModule } from './jobs/jobs.module';

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
    JobsModule.register(),

    // Platform features.
    HealthModule,

    // External data sources and the ingestion pipeline.
    IntegrationsModule,

    // Domain modules. SharedModule is first because it is @Global and the
    // others inject the statistics assembler it provides.
    SharedModule,
    SportsModule,
    TeamsModule,
    PlayersModule,
    CompetitionsModule,
    SearchModule,
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
