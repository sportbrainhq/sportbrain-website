import { describe, expect, it, vi } from 'vitest';
import { AppException } from '../../common';
import type { NewsletterIssueRenderService } from '../newsletter-issues/newsletter-issue-render.service';
import type {
  NewsletterIssueRepository,
  NewsletterIssueRow,
} from '../newsletter-issues/newsletter-issue.repository';
import { NewsletterArchiveService } from './newsletter-archive.service';

function issueRow(overrides: Partial<NewsletterIssueRow> = {}): NewsletterIssueRow {
  return {
    id: 'issue-1',
    issueNumber: 12,
    slug: 'monday-brief-2026-09-07',
    title: 'The Monday Brief',
    subject: 'This week in sport',
    previewText: 'The week, explained.',
    heroTitle: null,
    issueDate: new Date('2026-09-07T08:00:00.000Z'),
    status: 'SENDING',
    content: { intro: 'Hello' },
    createdBy: null,
    updatedBy: null,
    scheduledAt: new Date('2026-09-07T08:00:00.000Z'),
    scheduleTimezone: 'Asia/Kolkata',
    sendStartedAt: new Date('2026-09-07T08:00:00.000Z'),
    sentAt: null,
    publishedAt: new Date('2026-09-07T08:00:00.000Z'),
    createdAt: new Date('2026-09-01T08:00:00.000Z'),
    updatedAt: new Date('2026-09-07T08:00:00.000Z'),
    ...overrides,
  } as NewsletterIssueRow;
}

describe('NewsletterArchiveService', () => {
  describe('getPublishedBySlug', () => {
    it('returns the rendered view model for a published issue', async () => {
      const issues = {
        findPublishedBySlug: vi.fn().mockResolvedValue(issueRow()),
      } as unknown as NewsletterIssueRepository;
      const render = {
        render: vi.fn().mockReturnValue({ issueNumber: 12 }),
      } as unknown as NewsletterIssueRenderService;

      const service = new NewsletterArchiveService(issues, render);
      const result = await service.getPublishedBySlug('monday-brief-2026-09-07');

      expect(issues.findPublishedBySlug).toHaveBeenCalledWith('monday-brief-2026-09-07');
      expect(result.issue.slug).toBe('monday-brief-2026-09-07');
      expect(result.issue.publishedAt).toBe('2026-09-07T08:00:00.000Z');
      expect(render.render).toHaveBeenCalled();
    });

    it('throws not-found for a slug the repository could not match (unpublished or nonexistent — same result either way)', async () => {
      const issues = {
        findPublishedBySlug: vi.fn().mockResolvedValue(null),
      } as unknown as NewsletterIssueRepository;
      const render = {} as unknown as NewsletterIssueRenderService;

      const service = new NewsletterArchiveService(issues, render);

      await expect(service.getPublishedBySlug('never-published')).rejects.toThrow(AppException);
    });
  });

  describe('listPublished', () => {
    it('maps rows to summaries and builds pagination meta', async () => {
      const issues = {
        listPublished: vi.fn().mockResolvedValue({ rows: [issueRow()], total: 1 }),
      } as unknown as NewsletterIssueRepository;
      const render = {} as unknown as NewsletterIssueRenderService;

      const service = new NewsletterArchiveService(issues, render);
      const result = await service.listPublished({ page: 1, limit: 20 });

      expect(issues.listPublished).toHaveBeenCalledWith(1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.slug).toBe('monday-brief-2026-09-07');
      expect(result.pagination.total).toBe(1);
    });
  });
});
