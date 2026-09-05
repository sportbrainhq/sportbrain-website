import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { AuthModule } from '../auth/auth.module';
import { SavedEntitiesController } from './saved-entities.controller';
import { SavedEntitiesRepository } from './saved-entities.repository';
import { SavedEntitiesService } from './saved-entities.service';

@Module({
  imports: [AuthModule, ActivityModule],
  controllers: [SavedEntitiesController],
  providers: [SavedEntitiesService, SavedEntitiesRepository],
  exports: [SavedEntitiesRepository],
})
export class SavedEntitiesModule {}
