import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import {
  createContactRequestSchema,
  type ContactConfig,
  type ContactSubmissionResult,
  type CreateContactRequest,
} from '@sportbrain/contracts';
import type { AppConfig } from '../../config';
import { zodPipe } from '../../common';
import { ContactService } from './contact.service';

/**
 * Public surface: submitting a message. Nothing here lets a caller read
 * submissions back — see `ContactAdminController` for that, gated behind
 * `InternalApiKeyGuard`.
 *
 * `@Throttle` tightens the bucket for this one route on top of the global
 * `ThrottlerGuard` default, since an unauthenticated write endpoint is the
 * one place in this API that invites spam. The limit mirrors
 * `CONTACT_RATE_LIMIT_*`'s defaults (3/60s); `@Throttle` requires a
 * compile-time value, so unlike most of this config tree it cannot be read
 * from `ConfigService` at request time — change both if the default changes.
 */
@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(
    private readonly service: ContactService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /**
   * Literal route registered before the implicit root `POST /` collides with
   * nothing here, but kept above `submit` to match this codebase's stated
   * convention (literal segments before parameter segments) even though this
   * controller has no parameter segments today.
   */
  @Get('config')
  @ApiOperation({ summary: 'Direct-contact addresses safe to display publicly' })
  @ApiOkResponse({ description: 'Only addresses that are actually configured' })
  getConfig(): ContactConfig {
    const emails = this.config.get('contact.emails', { infer: true });
    // Only defined addresses are included — omitted, not empty-stringed, so
    // the frontend's "does this exist" check is a simple presence check.
    return {
      emails: {
        ...(emails.general ? { general: emails.general } : {}),
        ...(emails.corrections ? { corrections: emails.corrections } : {}),
        ...(emails.partnerships ? { partnerships: emails.partnerships } : {}),
        ...(emails.press ? { press: emails.press } : {}),
      },
    };
  }

  @Post()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit a contact/feedback message' })
  @ApiCreatedResponse({ description: 'Message received, with its reference code' })
  async submit(
    @Body(zodPipe(createContactRequestSchema)) body: CreateContactRequest,
    @Req() request: Request,
  ): Promise<ContactSubmissionResult> {
    return this.service.submit({
      request: body,
      // No auth system exists yet (see InternalApiKeyGuard's header comment
      // for the wider caveat) — there is no authenticated user to attach.
      userId: null,
      userAgent: request.header('user-agent') ?? null,
      ipHash: hashIp(request.ip),
    });
  }
}

/**
 * Coarse, non-reversible fingerprint for basic abuse tracking in `metadata`.
 * Never the raw IP: this repo's confidentiality standard treats an IP as
 * personal data not to be retained in the clear without a stated purpose.
 */
function hashIp(ip: string | undefined): string | null {
  if (!ip) return null;
  // A short non-cryptographic-strength hash is enough here: this is a
  // deduplication aid for abuse review, not a security boundary.
  let hash = 0;
  for (let i = 0; i < ip.length; i += 1) {
    hash = (hash * 31 + ip.charCodeAt(i)) | 0;
  }
  return `ip_${Math.abs(hash).toString(16)}`;
}
