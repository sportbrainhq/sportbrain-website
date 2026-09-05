import { Injectable } from '@nestjs/common';
import type { SavedEntity, SavedEntityType } from '@sportbrain/contracts';
import { ActivityService } from '../activity/activity.service';
import { SavedEntitiesRepository, type SavedEntityRow } from './saved-entities.repository';

@Injectable()
export class SavedEntitiesService {
  constructor(
    private readonly repository: SavedEntitiesRepository,
    private readonly activity: ActivityService,
  ) {}

  async list(userId: string, entityType?: SavedEntityType): Promise<SavedEntity[]> {
    const rows = await this.repository.list(userId, entityType);
    return rows.map(this.toDto);
  }

  async save(userId: string, entityType: SavedEntityType, entityId: string): Promise<void> {
    await this.repository.save(userId, entityType, entityId);
    await this.activity.record(userId, 'content_saved', { entityType, entityId });
  }

  async unsave(userId: string, entityType: SavedEntityType, entityId: string): Promise<void> {
    await this.repository.unsave(userId, entityType, entityId);
  }

  private toDto(row: SavedEntityRow): SavedEntity {
    return {
      entityType: row.entityType,
      entityId: row.entityId,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
