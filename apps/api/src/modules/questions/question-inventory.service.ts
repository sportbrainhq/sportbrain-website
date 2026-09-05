import { Injectable } from '@nestjs/common';
import type {
  QuestionCategory,
  QuestionDifficulty,
  QuestionInventory,
  QuestionStatus,
  SportCategoryInventory,
} from '@sportbrain/contracts';
import { QuestionInventoryRepository } from './question-inventory.repository';

/** Admin question-bank inventory (Part 62-63): identifies content gaps, distinct from a user's unseen-question inventory (Part 63's explicit warning not to conflate the two). */
@Injectable()
export class QuestionInventoryService {
  constructor(private readonly repository: QuestionInventoryRepository) {}

  async summary(): Promise<QuestionInventory> {
    const [total, byStatusRows, bySportRows, byDifficultyRows] = await Promise.all([
      this.repository.total(),
      this.repository.byStatus(),
      this.repository.bySport(),
      this.repository.byDifficulty(),
    ]);

    const byStatus = Object.fromEntries(
      byStatusRows.map((row) => [row.status as QuestionStatus, row.count]),
    ) as Record<QuestionStatus, number>;
    const byDifficulty = Object.fromEntries(
      byDifficultyRows.map((row) => [row.difficulty as QuestionDifficulty, row.count]),
    ) as Record<QuestionDifficulty, number>;

    return {
      total,
      byStatus,
      bySport: bySportRows,
      byDifficulty,
    };
  }

  async categoryBreakdown(sportId: string): Promise<SportCategoryInventory> {
    const rows = await this.repository.byCategoryForSport(sportId);
    return {
      sportId,
      categories: rows.map((row) => ({
        category: row.category as QuestionCategory,
        count: row.count,
      })),
    };
  }
}
