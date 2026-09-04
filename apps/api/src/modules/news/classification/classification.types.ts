import type { newsArticleEntityTypeEnum } from '../../../database/schema/news.schema';

export type NewsArticleEntityTypeValue = (typeof newsArticleEntityTypeEnum.enumValues)[number];
