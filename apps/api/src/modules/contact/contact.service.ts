import { randomBytes } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import type {
  ContactSubmissionDetail,
  ContactSubmissionResult,
  ContactSubmissionSummary,
  CreateContactRequest,
} from '@sportbrain/contracts';
import { buildPaginationMeta, type PaginationQuery } from '@sportbrain/contracts';
import { AppException } from '../../common';
import { ContactMailerService } from './contact-mailer.service';
import { ContactRepository, type ContactSubmissionRow } from './contact.repository';

/** Category-to-prefix map for the public reference code. */
const REFERENCE_PREFIX: Record<CreateContactRequest['category'], string> = {
  general: 'GEN',
  correction: 'COR',
  content_feedback: 'FBK',
  quiz_issue: 'QUZ',
  partnerships: 'PTR',
  press: 'PRS',
  feature_request: 'FTR',
  technical_issue: 'TEC',
  other: 'OTH',
};

export interface SubmitContactInput {
  request: CreateContactRequest;
  userId: string | null;
  /** Captured by the controller, never trusted from the client body. */
  userAgent: string | null;
  ipHash: string | null;
}

/**
 * Service layer: the domain logic for contact & feedback submissions.
 *
 * Knows nothing about HTTP or SQL. Generates the public reference code,
 * decides what goes into `metadata`, and fires the two notification emails —
 * never letting an email failure fail an otherwise-successful submission,
 * per the "email failures should not destroy a DB write" requirement.
 */
@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly repository: ContactRepository,
    private readonly mailer: ContactMailerService,
  ) {}

  async submit(input: SubmitContactInput): Promise<ContactSubmissionResult> {
    const { request } = input;
    const referenceCode = this.generateReferenceCode(request.category);

    // Only the fields the submitter actually filled in are kept in metadata —
    // never padding it with nulls for fields other categories don't use.
    const metadata: Record<string, unknown> = {
      capturedAt: new Date().toISOString(),
      userAgent: input.userAgent,
      ipHash: input.ipHash,
    };
    if (request.whatIsIncorrect) metadata.whatIsIncorrect = request.whatIsIncorrect;
    if (request.whatItShouldSay) metadata.whatItShouldSay = request.whatItShouldSay;

    const row = await this.repository.create({
      referenceCode,
      userId: input.userId,
      category: request.category,
      name: request.name,
      email: request.email,
      subject: request.subject,
      message: request.message,
      pageUrl: request.pageUrl ?? null,
      sourceUrl: request.sourceUrl ?? null,
      metadata,
    });

    await this.notify(row);

    return { referenceCode: row.referenceCode, email: row.email };
  }

  async findById(id: string): Promise<ContactSubmissionDetail> {
    const row = await this.repository.findById(id);
    if (!row) throw AppException.notFound(`No contact submission with id "${id}"`);
    return this.toDetail(row);
  }

  async findAll(
    query: PaginationQuery,
  ): Promise<{
    data: ContactSubmissionSummary[];
    pagination: ReturnType<typeof buildPaginationMeta>;
  }> {
    const { rows, total } = await this.repository.findAll(query);
    return {
      data: rows.map((row) => this.toSummary(row)),
      pagination: buildPaginationMeta(total, query),
    };
  }

  async updateStatus(
    id: string,
    status: ContactSubmissionDetail['status'],
  ): Promise<ContactSubmissionDetail> {
    const resolvedAt = status === 'resolved' ? new Date() : null;
    const row = await this.repository.updateStatus(id, status, resolvedAt);
    if (!row) throw AppException.notFound(`No contact submission with id "${id}"`);
    return this.toDetail(row);
  }

  /** Sends both notification emails, isolating failures so a DB write always stands. */
  private async notify(row: ContactSubmissionRow): Promise<void> {
    const emailInput = {
      referenceCode: row.referenceCode,
      category: row.category,
      name: row.name,
      email: row.email,
      subject: row.subject,
      message: row.message,
    };

    try {
      await this.mailer.sendAcknowledgement(emailInput);
    } catch (error) {
      this.logger.error(
        `Failed to send acknowledgement email for ${row.referenceCode}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    try {
      await this.mailer.sendInternalNotification(emailInput);
    } catch (error) {
      this.logger.error(
        `Failed to send internal notification for ${row.referenceCode}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * `SBH-<PREFIX>-XXXXXXXX`: an 8-character base32-ish token, uppercased hex
   * for simplicity. Collision risk is negligible at this volume and the
   * unique index on `reference_code` is the actual backstop.
   */
  private generateReferenceCode(category: CreateContactRequest['category']): string {
    const token = randomBytes(5).toString('hex').toUpperCase().slice(0, 8);
    return `SBH-${REFERENCE_PREFIX[category]}-${token}`;
  }

  private toSummary(row: ContactSubmissionRow): ContactSubmissionSummary {
    return {
      id: row.id,
      referenceCode: row.referenceCode,
      category: row.category,
      status: row.status,
      name: row.name,
      email: row.email,
      subject: row.subject,
      createdAt: row.createdAt.toISOString(),
      resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
    };
  }

  private toDetail(row: ContactSubmissionRow): ContactSubmissionDetail {
    return {
      ...this.toSummary(row),
      userId: row.userId,
      message: row.message,
      pageUrl: row.pageUrl,
      sourceUrl: row.sourceUrl,
      attachmentUrl: row.attachmentUrl,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
