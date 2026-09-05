import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { question, sport } from '../../database/schema';

export interface StatusCountRow {
  status: string;
  count: number;
}

export interface SportCountRow {
  sportId: string;
  sportName: string;
  count: number;
}

export interface DifficultyCountRow {
  difficulty: string;
  count: number;
}

export interface CategoryCountRow {
  category: string;
  count: number;
}

/** Admin inventory reads (Part 62-63) — global content-gap visibility, kept separate from `QuestionsRepository`'s per-question CRUD since these are always full-table aggregates. */
@Injectable()
export class QuestionInventoryRepository {
  constructor(private readonly database: DatabaseService) {}

  async total(): Promise<number> {
    const [row] = await this.database.db.select({ value: sql<number>`count(*)` }).from(question);
    return Number(row?.value ?? 0);
  }

  async byStatus(): Promise<StatusCountRow[]> {
    const rows = await this.database.db
      .select({ status: question.status, count: sql<number>`count(*)` })
      .from(question)
      .groupBy(question.status);
    return rows.map((row) => ({ status: row.status, count: Number(row.count) }));
  }

  async bySport(): Promise<SportCountRow[]> {
    const rows = await this.database.db
      .select({ sportId: question.sportId, sportName: sport.name, count: sql<number>`count(*)` })
      .from(question)
      .innerJoin(sport, eq(question.sportId, sport.id))
      .groupBy(question.sportId, sport.name);
    return rows.map((row) => ({
      sportId: row.sportId,
      sportName: row.sportName,
      count: Number(row.count),
    }));
  }

  async byDifficulty(): Promise<DifficultyCountRow[]> {
    const rows = await this.database.db
      .select({ difficulty: question.difficulty, count: sql<number>`count(*)` })
      .from(question)
      .groupBy(question.difficulty);
    return rows.map((row) => ({ difficulty: row.difficulty, count: Number(row.count) }));
  }

  async byCategoryForSport(sportId: string): Promise<CategoryCountRow[]> {
    const rows = await this.database.db
      .select({ category: question.category, count: sql<number>`count(*)` })
      .from(question)
      .where(eq(question.sportId, sportId))
      .groupBy(question.category);
    return rows.map((row) => ({ category: row.category, count: Number(row.count) }));
  }
}
