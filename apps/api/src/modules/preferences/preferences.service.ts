import { Injectable } from '@nestjs/common';
import type { UpdateUserPreferencesRequest, UserPreferences } from '@sportbrain/contracts';
import { PreferencesRepository, type UserPreferencesRow } from './preferences.repository';

const DEFAULTS: UserPreferences = {
  contentTypes: [],
  newsletterWeekly: false,
  productUpdates: false,
};

/**
 * Content-type and email preferences only — not "favourite sports", which
 * this deliberately does not store: that's `user_follows` with
 * `entityType: 'sport'`, so the Preferences page's sports section reads
 * and writes through `FollowsService`, not this one. See
 * `database/schema/preference.schema.ts`'s header comment.
 */
@Injectable()
export class PreferencesService {
  constructor(private readonly repository: PreferencesRepository) {}

  async get(userId: string): Promise<UserPreferences> {
    const row = await this.repository.find(userId);
    return row ? this.toDto(row) : DEFAULTS;
  }

  async update(userId: string, input: UpdateUserPreferencesRequest): Promise<UserPreferences> {
    const row = await this.repository.upsert(userId, input);
    return this.toDto(row);
  }

  private toDto(row: UserPreferencesRow): UserPreferences {
    return {
      contentTypes: row.contentTypes as UserPreferences['contentTypes'],
      newsletterWeekly: row.newsletterWeekly,
      productUpdates: row.productUpdates,
    };
  }
}
