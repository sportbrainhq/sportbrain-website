import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsletterIssueValidationService } from './newsletter-issue-validation.service';
import type { NewsletterIssueRow } from './newsletter-issue.repository';
import { NewsletterIssueRepository } from './newsletter-issue.repository';
import { NewsletterIssueService } from './newsletter-issue.service';

function makeRow(overrides: Partial<NewsletterIssueRow> = {}): NewsletterIssueRow {
  const now = new Date('2026-09-07T00:00:00.000Z');
  return {
    id: 'issue-1',
    issueNumber: 1,
    slug: 'monday-brief-2026-09-07',
    title: 'Monday Brief',
    subject: 'Your Monday Brief',
    previewText: 'The week in sport.',
    heroTitle: null,
    issueDate: now,
    status: 'DRAFT',
    content: {},
    createdBy: 'user-1',
    updatedBy: null,
    scheduledAt: null,
    sendStartedAt: null,
    sentAt: null,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as NewsletterIssueRow;
}

const VALID_CONTENT = {
  quickRecap: [{ text: 'Big win for the underdogs.' }],
  bigStory: {
    headline: 'A real headline',
    summary: 'A real summary',
    whatHappened: 'It happened',
    whyItMatters: 'It matters',
    whatChangesNow: 'Things change',
  },
};

describe('NewsletterIssueService', () => {
  let repository: NewsletterIssueRepository;
  let validation: NewsletterIssueValidationService;
  let service: NewsletterIssueService;

  beforeEach(() => {
    repository = {
      findById: vi.fn().mockResolvedValue(makeRow()),
      findAll: vi.fn(),
      maxIssueNumber: vi.fn(),
      create: vi.fn().mockImplementation(async (input) => makeRow(input)),
      updateMeta: vi.fn().mockImplementation(async (id, fields) => makeRow(fields)),
      updateContent: vi
        .fn()
        .mockImplementation(async (id, partial) =>
          makeRow({ content: { ...VALID_CONTENT, ...partial } }),
        ),
      updateStatus: vi.fn().mockImplementation(async (id, status) => makeRow({ status })),
    } as unknown as NewsletterIssueRepository;

    validation = {
      validate: vi.fn().mockResolvedValue({ errors: [], warnings: [] }),
    } as unknown as NewsletterIssueValidationService;

    service = new NewsletterIssueService(repository, validation);
  });

  it('creates a new DRAFT issue', async () => {
    const result = await service.createIssue(
      {
        issueDate: '2026-09-07T00:00:00.000Z',
        title: 'Monday Brief',
        subject: 'Your Monday Brief',
        previewText: 'The week in sport.',
      },
      'user-1',
    );

    expect(result.status).toBe('DRAFT');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Monday Brief', createdBy: 'user-1' }),
    );
  });

  it('merges content sections without clobbering others (repository owns the merge; service just forwards)', async () => {
    await service.updateContent('issue-1', { intro: 'Hello' }, 'user-1');

    expect(repository.updateContent).toHaveBeenCalledWith('issue-1', { intro: 'Hello' }, 'user-1');
  });

  it('rejects a content update when the issue is locked (SENDING/SENT/CANCELLED)', async () => {
    repository.findById = vi.fn().mockResolvedValue(makeRow({ status: 'SENT' }));

    await expect(service.updateContent('issue-1', { intro: 'Hello' }, 'user-1')).rejects.toThrow();
    expect(repository.updateContent).not.toHaveBeenCalled();
  });

  it('rejects a meta update when the issue is SENDING', async () => {
    repository.findById = vi.fn().mockResolvedValue(makeRow({ status: 'SENDING' }));

    await expect(service.updateMeta('issue-1', { title: 'New title' }, 'user-1')).rejects.toThrow();
  });

  it('surfaces validation errors from the validation service', async () => {
    validation.validate = vi
      .fn()
      .mockResolvedValue({ errors: ['Subject is required.'], warnings: [] });

    const result = await service.validateIssue('issue-1');

    expect(result.errors).toEqual(['Subject is required.']);
  });

  it('surfaces validation warnings (placeholder detection) without blocking', async () => {
    validation.validate = vi
      .fn()
      .mockResolvedValue({ errors: [], warnings: ['Possible placeholder text found: "TODO"'] });

    const result = await service.validateIssue('issue-1');

    expect(result.warnings).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('blocks markReady when validation has errors', async () => {
    validation.validate = vi
      .fn()
      .mockResolvedValue({ errors: ['Big Story is required.'], warnings: [] });

    await expect(service.markReady('issue-1')).rejects.toThrow();
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it('marks an issue READY when validation passes', async () => {
    validation.validate = vi.fn().mockResolvedValue({ errors: [], warnings: [] });

    const result = await service.markReady('issue-1');

    expect(result.issue.status).toBe('READY');
    expect(repository.updateStatus).toHaveBeenCalledWith('issue-1', 'READY');
  });

  it('rejects markReady from a status other than DRAFT/READY', async () => {
    repository.findById = vi.fn().mockResolvedValue(makeRow({ status: 'SENT' }));

    await expect(service.markReady('issue-1')).rejects.toThrow();
  });

  it('duplicates an issue into a new DRAFT with its own issueNumber/slug, copying content but not metadata verbatim', async () => {
    repository.findById = vi
      .fn()
      .mockResolvedValue(
        makeRow({
          id: 'issue-1',
          issueNumber: 5,
          slug: 'monday-brief-2026-09-01',
          content: VALID_CONTENT,
        }),
      );
    repository.create = vi
      .fn()
      .mockResolvedValue(
        makeRow({ id: 'issue-2', issueNumber: 6, slug: 'monday-brief-2026-09-08' }),
      );
    repository.updateContent = vi
      .fn()
      .mockResolvedValue(makeRow({ id: 'issue-2', issueNumber: 6, content: VALID_CONTENT }));

    const result = await service.duplicateIssue('issue-1', 'user-1');

    expect(result.id).toBe('issue-2');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Monday Brief (copy)' }),
    );
    expect(repository.updateContent).toHaveBeenCalledWith('issue-2', VALID_CONTENT, 'user-1');
  });

  it('throws not found for a missing issue id', async () => {
    repository.findById = vi.fn().mockResolvedValue(null);

    await expect(service.getIssue('missing')).rejects.toThrow();
  });
});
