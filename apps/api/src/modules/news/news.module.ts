import { Module } from '@nestjs/common';
import { ClassificationRepository } from './classification/classification.repository';
import { ClassificationService } from './classification/classification.service';
import { EntityClassificationRepository } from './classification/entity-classification.repository';
import { EntityClassifier } from './classification/entity-classifier';
import { NoopLlmClassificationFallback } from './classification/llm-classification-fallback';
import { SportClassifier } from './classification/sport-classifier';
import { TopicClassifier } from './classification/topic-classifier';
import { ClusteringRepository } from './clustering/clustering.repository';
import { ClusteringService } from './clustering/clustering.service';
import { NewsController } from './news.controller';
import { NewsRepository } from './news.repository';
import { NewsService } from './news.service';
import { NewsWorkerRepository } from './news-worker.repository';
import { ImportanceScorer } from './ranking/importance-scorer';
import { RankingRepository } from './ranking/ranking.repository';

@Module({
  controllers: [NewsController],
  providers: [
    NewsService,
    NewsRepository,
    NewsWorkerRepository,
    ClassificationService,
    ClassificationRepository,
    EntityClassificationRepository,
    EntityClassifier,
    SportClassifier,
    TopicClassifier,
    NoopLlmClassificationFallback,
    ClusteringService,
    ClusteringRepository,
    ImportanceScorer,
    RankingRepository,
  ],
  exports: [NewsService, ClassificationService, ClusteringService],
})
export class NewsModule {}
