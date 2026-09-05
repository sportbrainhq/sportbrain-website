import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ActivityController } from './activity.controller';
import { ActivityRepository } from './activity.repository';
import { ActivityService } from './activity.service';

/**
 * Exports `ActivityService` so `SavedEntitiesModule`/`FollowsModule` can
 * record an activity at the end of their own mutations without owning the
 * activity table themselves.
 */
@Module({
  imports: [AuthModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityRepository],
  exports: [ActivityService],
})
export class ActivityModule {}
