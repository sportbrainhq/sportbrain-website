import { z } from 'zod';
import { questionCategorySchema, questionDifficultySchema, questionStatusSchema } from './question';

/** Admin question-bank inventory (Part 62-63) — content-gap visibility, not per-user unseen inventory (Part 63's explicit distinction). */
export const questionInventorySchema = z.object({
  total: z.number().int().nonnegative(),
  byStatus: z.record(questionStatusSchema, z.number().int().nonnegative()),
  bySport: z.array(
    z.object({
      sportId: z.string(),
      sportName: z.string(),
      count: z.number().int().nonnegative(),
    }),
  ),
  byDifficulty: z.record(questionDifficultySchema, z.number().int().nonnegative()),
});
export type QuestionInventory = z.infer<typeof questionInventorySchema>;

/** One sport's category breakdown — the underrepresented-category signal (Part 63). */
export const sportCategoryInventorySchema = z.object({
  sportId: z.string(),
  categories: z.array(
    z.object({
      category: questionCategorySchema,
      count: z.number().int().nonnegative(),
    }),
  ),
});
export type SportCategoryInventory = z.infer<typeof sportCategoryInventorySchema>;
