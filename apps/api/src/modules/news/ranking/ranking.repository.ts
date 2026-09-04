import { Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import { competition, newsArticleEntities, person, team } from '../../../database/schema';

/**
 * Read path for the ranking factor that needs data outside `news_articles`
 * itself: an article's linked teams/players/competitions' `notability`
 * columns (see `entity.schema.ts`). Kept separate from `ClusteringRepository`
 * because it reads a different set of tables (`team`/`person`/`competition`)
 * for a different purpose (a ranking factor, not clustering candidates).
 */
@Injectable()
export class RankingRepository {
  constructor(private readonly database: DatabaseService) {}

  /** `notability` for every team/player/competition linked to `articleId`. Country/sport links are not notability-scored (neither table has the column) and are excluded. */
  async findLinkedEntityNotabilityScores(articleId: string): Promise<number[]> {
    const links = await this.database.db
      .select({
        entityType: newsArticleEntities.entityType,
        entityId: newsArticleEntities.entityId,
      })
      .from(newsArticleEntities)
      .where(
        and(
          eq(newsArticleEntities.articleId, articleId),
          inArray(newsArticleEntities.entityType, ['team', 'player', 'competition']),
        ),
      );

    if (links.length === 0) return [];

    const teamIds = links.filter((l) => l.entityType === 'team').map((l) => l.entityId);
    const playerIds = links.filter((l) => l.entityType === 'player').map((l) => l.entityId);
    const competitionIds = links
      .filter((l) => l.entityType === 'competition')
      .map((l) => l.entityId);

    const [teamRows, playerRows, competitionRows] = await Promise.all([
      teamIds.length > 0
        ? this.database.db
            .select({ notability: team.notability })
            .from(team)
            .where(inArray(team.id, teamIds))
        : Promise.resolve([]),
      playerIds.length > 0
        ? this.database.db
            .select({ notability: person.notability })
            .from(person)
            .where(inArray(person.id, playerIds))
        : Promise.resolve([]),
      competitionIds.length > 0
        ? this.database.db
            .select({ notability: competition.notability })
            .from(competition)
            .where(inArray(competition.id, competitionIds))
        : Promise.resolve([]),
    ]);

    return [...teamRows, ...playerRows, ...competitionRows].map((row) => row.notability);
  }
}
