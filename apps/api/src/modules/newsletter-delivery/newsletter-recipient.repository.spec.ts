import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * `createRecipientSnapshot` locks in the guarantee D6 depends on: a
 * suppressed (BOUNCED/COMPLAINED/UNSUBSCRIBED) subscription must never be
 * included in a NEW campaign's recipient snapshot. D6 is what actually
 * *produces* BOUNCED/COMPLAINED subscriptions in practice (a webhook-driven
 * bounce/complaint — see `NewsletterWebhookService`), so this guarantee only
 * becomes exercisable once D6 exists, even though the filter itself was
 * written in D5.
 *
 * This repo has no DB-integration test harness (no testcontainers/real-DB
 * spec anywhere in this codebase — every repository spec here is a plain
 * unit test against mocked collaborators), so `createRecipientSnapshot`
 * itself — a raw Drizzle query with nothing to inject a fake DB into short
 * of a real Postgres — cannot be exercised end-to-end in this suite. This
 * test instead pins the guarantee at the source level: the snapshot query's
 * `WHERE` clause is filtered by `eq(newsletterSubscription.status,
 * 'SUBSCRIBED')` and nothing else, so a BOUNCED/COMPLAINED/UNSUBSCRIBED/
 * PENDING/SUPPRESSED row is structurally excluded regardless of what data
 * exists. If this method is ever changed to select on a different or
 * additional predicate, this test forces a deliberate look at whether the
 * suppression guarantee still holds.
 */
describe('NewsletterRecipientRepository.createRecipientSnapshot', () => {
  it('only ever selects subscriptions with status = SUBSCRIBED (suppression enforcement)', () => {
    const source = readFileSync(join(__dirname, 'newsletter-recipient.repository.ts'), 'utf8');
    const method = source.slice(
      source.indexOf('async createRecipientSnapshot'),
      source.indexOf('async findPendingRecipients'),
    );

    expect(method).toContain("eq(newsletterSubscription.status, 'SUBSCRIBED')");
    // Guard against a future edit that widens the predicate to also match a
    // suppressed status without updating this test's expectations.
    expect(method).not.toMatch(/BOUNCED|COMPLAINED|UNSUBSCRIBED|SUPPRESSED/);
  });
});
