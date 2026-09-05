import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { SavedEntityType } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import { savedEntities } from '../../database/schema';

export type SavedEntityRow = typeof savedEntities.$inferSelect;

@Injectable()
export class SavedEntitiesRepository {
  constructor(private readonly database: DatabaseService) {}

  async list(userId: string, entityType?: SavedEntityType): Promise<SavedEntityRow[]> {
    return this.database.db
      .select()
      .from(savedEntities)
      .where(
        entityType
          ? and(eq(savedEntities.userId, userId), eq(savedEntities.entityType, entityType))
          : eq(savedEntities.userId, userId),
      )
      .orderBy(desc(savedEntities.createdAt));
  }

  /**
   * Idempotent save: `onConflictDoNothing` on the same unique index the
   * schema enforces, so "save something already saved" is a no-op rather
   * than a constraint-violation error the client would have to handle.
   */
  async save(userId: string, entityType: SavedEntityType, entityId: string): Promise<void> {
    await this.database.db
      .insert(savedEntities)
      .values({ userId, entityType, entityId })
      .onConflictDoNothing();
  }

  async unsave(userId: string, entityType: SavedEntityType, entityId: string): Promise<void> {
    await this.database.db
      .delete(savedEntities)
      .where(
        and(
          eq(savedEntities.userId, userId),
          eq(savedEntities.entityType, entityType),
          eq(savedEntities.entityId, entityId),
        ),
      );
  }
}
