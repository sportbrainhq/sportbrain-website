import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import { competition, person, team } from '../../../database/schema';

export interface CandidateEntity {
  id: string;
  name: string;
  aliases: string[];
}

/**
 * Read-only queries backing `EntityClassifier`.
 *
 * Kept in `classification/` rather than folded into `NewsWorkerRepository`
 * because it queries the canonical sports-data tables (`person`, `team`,
 * `competition`), not the news schema — a different data source with a
 * different lifecycle, so it gets its own narrow repository per the 4-file
 * module convention's "only place with Drizzle/SQL" rule applied at the
 * sub-module level.
 *
 * Every query is scoped to a `sportId`, never an unbounded scan across every
 * entity in the database: once `SportClassifier` has determined a sport, that
 * is the candidate set an article's teams/players/competitions can plausibly
 * belong to.
 */
@Injectable()
export class EntityClassificationRepository {
  constructor(private readonly database: DatabaseService) {}

  async findTeamsForSport(sportId: string): Promise<CandidateEntity[]> {
    const rows = await this.database.db
      .select({ id: team.id, name: team.name, shortName: team.shortName, aliases: team.aliases })
      .from(team)
      .where(eq(team.sportId, sportId));

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      aliases: row.shortName ? [...row.aliases, row.shortName] : row.aliases,
    }));
  }

  async findPersonsForSport(sportId: string): Promise<CandidateEntity[]> {
    const rows = await this.database.db
      .select({
        id: person.id,
        fullName: person.fullName,
        displayName: person.displayName,
        aliases: person.aliases,
      })
      .from(person)
      .where(eq(person.primarySportId, sportId));

    return rows.map((row) => ({
      id: row.id,
      name: row.fullName,
      aliases: row.displayName ? [...row.aliases, row.displayName] : row.aliases,
    }));
  }

  async findCompetitionsForSport(sportId: string): Promise<CandidateEntity[]> {
    const rows = await this.database.db
      .select({
        id: competition.id,
        name: competition.name,
        shortName: competition.shortName,
        aliases: competition.aliases,
      })
      .from(competition)
      .where(eq(competition.sportId, sportId));

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      aliases: row.shortName ? [...row.aliases, row.shortName] : row.aliases,
    }));
  }
}
