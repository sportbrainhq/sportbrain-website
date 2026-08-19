import { Module } from '@nestjs/common';
import { CompetitionsController } from './competitions.controller';
import { CompetitionsRepository } from './competitions.repository';
import { CompetitionsService } from './competitions.service';

@Module({
  controllers: [CompetitionsController],
  providers: [CompetitionsService, CompetitionsRepository],
  exports: [CompetitionsService],
})
export class CompetitionsModule {}
