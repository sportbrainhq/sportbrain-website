import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './database.health';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule.forRoot({
      // Terminus logs a full error object on a failed check by default, which
      // can include the connection string. The indicator already reports a
      // safe message, so its own logger is suppressed.
      logger: false,
    }),
  ],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator],
})
export class HealthModule {}
