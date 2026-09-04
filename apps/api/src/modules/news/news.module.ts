import { Module } from '@nestjs/common';
import { ClassificationRepository } from './classification/classification.repository';
import { ClassificationService } from './classification/classification.service';
import { EntityClassificationRepository } from './classification/entity-classification.repository';
import { EntityClassifier } from './classification/entity-classifier';
import { NoopLlmClassificationFallback } from './classification/llm-classification-fallback';
import { SportClassifier } from './classification/sport-classifier';
import { TopicClassifier } from './classification/topic-classifier';
import { NewsController } from './news.controller';
import { NewsRepository } from './news.repository';
import { NewsService } from './news.service';

@Module({
  controllers: [NewsController],
  providers: [
    NewsService,
    NewsRepository,
    ClassificationService,
    ClassificationRepository,
    EntityClassificationRepository,
    EntityClassifier,
    SportClassifier,
    TopicClassifier,
    NoopLlmClassificationFallback,
  ],
  exports: [NewsService, ClassificationService],
})
export class NewsModule {}
