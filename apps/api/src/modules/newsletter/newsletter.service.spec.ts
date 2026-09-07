import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config';
import { NewsletterMailerService } from './newsletter-mailer.service';
import { NewsletterRepository, type NewsletterSubscriptionRow } from './newsletter.repository';
import { NewsletterService } from './newsletter.service';

function makeRow(overrides: Partial<NewsletterSubscriptionRow> = {}): NewsletterSubscriptionRow {
  const now = new Date('2026-01-05T00:00:00.000Z');
  return {
    id: 'sub-1',
    userId: null,
    email: 'reader@example.com',
    status: 'SUBSCRIBED',
    source: 'NEWSLETTER_PAGE',
    timezone: null,
    preferences: null,
    subscribedAt: now,
    confirmedAt: now,
    unsubscribedAt: null,
    unsubscribeToken: 'unsub-token-1',
    confirmToken: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as NewsletterSubscriptionRow;
}

describe('NewsletterService', () => {
  let repository: NewsletterRepository;
  let mailer: NewsletterMailerService;
  let config: ConfigService<AppConfig, true>;
  let service: NewsletterService;

  beforeEach(() => {
    repository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      findByUnsubscribeToken: vi.fn(),
      findByConfirmToken: vi.fn(),
      findByUserId: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      create: vi.fn().mockImplementation(async (input) => makeRow(input)),
      reactivate: vi.fn(),
      confirmSubscription: vi.fn(),
      unsubscribeByToken: vi.fn(),
      updatePreferences: vi.fn(),
      linkUserId: vi.fn(),
    } as unknown as NewsletterRepository;

    mailer = {
      sendConfirmationEmail: vi.fn().mockResolvedValue(undefined),
      sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
    } as unknown as NewsletterMailerService;

    config = {
      get: vi.fn().mockReturnValue(false),
    } as unknown as ConfigService<AppConfig, true>;

    service = new NewsletterService(repository, mailer, config);
  });

  it('subscribes a new address and sends a welcome email when double opt-in is off', async () => {
    const result = await service.subscribe({
      email: 'Reader@Example.com',
      source: 'FOOTER',
    });

    expect(result).toEqual({ status: 'subscribed' });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'reader@example.com', status: 'SUBSCRIBED' }),
    );
    expect(mailer.sendWelcomeEmail).toHaveBeenCalled();
  });

  it('subscribes a new address as PENDING and sends a confirmation email when double opt-in is on', async () => {
    config.get = vi.fn().mockReturnValue(true);

    const result = await service.subscribe({ email: 'reader@example.com', source: 'FOOTER' });

    expect(result).toEqual({ status: 'pending_confirmation' });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'PENDING' }));
    expect(mailer.sendConfirmationEmail).toHaveBeenCalled();
  });

  it('is idempotent for a duplicate subscribe of an already-subscribed address', async () => {
    repository.findByEmail = vi.fn().mockResolvedValue(makeRow({ status: 'SUBSCRIBED' }));

    const result = await service.subscribe({ email: 'reader@example.com', source: 'FOOTER' });

    expect(result).toEqual({ status: 'already_subscribed' });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('does not re-send a confirmation for a duplicate subscribe while still PENDING', async () => {
    repository.findByEmail = vi.fn().mockResolvedValue(makeRow({ status: 'PENDING' }));

    const result = await service.subscribe({ email: 'reader@example.com', source: 'FOOTER' });

    expect(result).toEqual({ status: 'pending_confirmation' });
    expect(mailer.sendConfirmationEmail).not.toHaveBeenCalled();
  });

  it('reactivates an unsubscribed address on resubscribe', async () => {
    repository.findByEmail = vi.fn().mockResolvedValue(makeRow({ status: 'UNSUBSCRIBED' }));
    repository.reactivate = vi.fn().mockResolvedValue(makeRow({ status: 'SUBSCRIBED' }));

    const result = await service.subscribe({ email: 'reader@example.com', source: 'FOOTER' });

    expect(result).toEqual({ status: 'subscribed' });
    expect(repository.reactivate).toHaveBeenCalledWith('sub-1', 'SUBSCRIBED', null);
  });

  it('refuses to automatically reactivate a COMPLAINED address', async () => {
    repository.findByEmail = vi.fn().mockResolvedValue(makeRow({ status: 'COMPLAINED' }));

    await expect(
      service.subscribe({ email: 'reader@example.com', source: 'FOOTER' }),
    ).rejects.toThrow();
  });

  it('unsubscribes via token and never deletes the row', async () => {
    repository.unsubscribeByToken = vi
      .fn()
      .mockResolvedValue(makeRow({ status: 'UNSUBSCRIBED', unsubscribedAt: new Date() }));

    const result = await service.unsubscribe('unsub-token-1');

    expect(result).toEqual({ status: 'unsubscribed' });
    expect(repository.unsubscribeByToken).toHaveBeenCalledWith('unsub-token-1');
  });

  it('reports invalid_token for an unknown unsubscribe token', async () => {
    repository.unsubscribeByToken = vi.fn().mockResolvedValue(null);

    const result = await service.unsubscribe('does-not-exist');

    expect(result).toEqual({ status: 'invalid_token' });
  });

  it('reports invalid_token for an unknown confirm token', async () => {
    repository.confirmSubscription = vi.fn().mockResolvedValue(null);

    const result = await service.confirm('does-not-exist');

    expect(result).toEqual({ status: 'invalid_token' });
  });

  it('confirms a pending subscription', async () => {
    repository.confirmSubscription = vi.fn().mockResolvedValue(makeRow({ status: 'SUBSCRIBED' }));

    const result = await service.confirm('confirm-token-1');

    expect(result).toEqual({ status: 'confirmed' });
  });

  it('links userId when an authenticated user subscribes a new address', async () => {
    await service.subscribe({ email: 'reader@example.com', source: 'PROFILE' }, 'user-1');

    expect(repository.linkUserId).toHaveBeenCalledWith('sub-1', 'user-1');
  });

  it('subscribes anonymously when no userId is given', async () => {
    await service.subscribe({ email: 'reader@example.com', source: 'FOOTER' });

    expect(repository.linkUserId).not.toHaveBeenCalled();
  });

  it('returns null status for a signed-in user who has never subscribed', async () => {
    repository.findByUserId = vi.fn().mockResolvedValue(null);

    const result = await service.getMyStatus('user-1');

    expect(result).toBeNull();
  });

  it('returns the subscription summary for a signed-in subscriber', async () => {
    repository.findByUserId = vi.fn().mockResolvedValue(makeRow({ userId: 'user-1' }));

    const result = await service.getMyStatus('user-1');

    expect(result).toEqual({
      status: 'SUBSCRIBED',
      subscribedAt: '2026-01-05T00:00:00.000Z',
      preferences: null,
    });
  });

  it('updates preferences for an existing subscription', async () => {
    repository.findByUserId = vi.fn().mockResolvedValue(makeRow({ userId: 'user-1' }));
    repository.updatePreferences = vi
      .fn()
      .mockResolvedValue(makeRow({ userId: 'user-1', preferences: { sports: ['football'] } }));

    const result = await service.updateMyPreferences('user-1', { sports: ['football'] });

    expect(result.preferences).toEqual({ sports: ['football'] });
  });

  it('rejects updating preferences when no subscription exists', async () => {
    repository.findByUserId = vi.fn().mockResolvedValue(null);

    await expect(service.updateMyPreferences('user-1', { sports: ['football'] })).rejects.toThrow();
  });
});
