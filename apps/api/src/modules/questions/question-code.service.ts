import { Injectable } from '@nestjs/common';
import { QuestionsRepository } from './questions.repository';

/**
 * Assigns human-readable question identifiers: `SBQ-FB-000001`. These are the
 * only reference an admin, a support conversation, or a "report this
 * question" flow should ever have to quote — the UUID stays internal (Part
 * 3.1: "Do not expose UUID as the primary visible reference").
 *
 * Short codes are two letters chosen by hand, not derived from the sport
 * slug, because slugs are free text ("formula-1") and codes must read well
 * concatenated (`SBQ-F1-000001`, not `SBQ-FORMULA-1-000001`). Add a sport's
 * launch entry here alongside its `sport` row.
 */
const SPORT_SHORT_CODES: Record<string, string> = {
  football: 'FB',
  cricket: 'CR',
  basketball: 'BK',
  tennis: 'TN',
  'formula-1': 'F1',
  golf: 'GF',
  'american-football': 'AF',
  mma: 'MM',
  boxing: 'BX',
};

@Injectable()
export class QuestionCodeService {
  constructor(private readonly repository: QuestionsRepository) {}

  shortCodeFor(sportSlug: string): string {
    const shortCode = SPORT_SHORT_CODES[sportSlug];
    if (!shortCode) {
      throw new Error(`No question-code short code configured for sport "${sportSlug}"`);
    }
    return shortCode;
  }

  /**
   * Next sequential code for a sport. Not race-proof by itself — under
   * concurrent generation the count-then-insert can collide — so callers
   * relying on uniqueness under load should retry once against
   * `question_code_idx` rather than trust this in isolation. Phase C1's
   * write paths (manual creation, one row at a time) do not need more than
   * that.
   */
  async nextCode(sportSlug: string): Promise<string> {
    const shortCode = this.shortCodeFor(sportSlug);
    const prefix = `SBQ-${shortCode}-`;
    const existing = await this.repository.countByCodePrefix(prefix);
    const sequence = (existing + 1).toString().padStart(6, '0');
    return `${prefix}${sequence}`;
  }
}
