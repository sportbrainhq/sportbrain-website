import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { userPreferences } from '../../database/schema';

export type UserPreferencesRow = typeof userPreferences.$inferSelect;

@Injectable()
export class PreferencesRepository {
  constructor(private readonly database: DatabaseService) {}

  async find(userId: string): Promise<UserPreferencesRow | null> {
    const [row] = await this.database.db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
    return row ?? null;
  }

  /**
   * Upsert on the same unique index the schema enforces: a user's first
   * preferences write creates the row, every subsequent one merges into it
   * — there is no separate "create defaults on signup" step to keep in
   * sync with this.
   */
  async upsert(
    userId: string,
    input: {
      contentTypes?: string[];
      newsletterWeekly?: boolean;
      productUpdates?: boolean;
    },
  ): Promise<UserPreferencesRow> {
    const [row] = await this.database.db
      .insert(userPreferences)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...input, updatedAt: new Date() },
      })
      .returning();
    if (!row) throw new Error('Upsert of user_preferences row returned no row');
    return row;
  }
}
