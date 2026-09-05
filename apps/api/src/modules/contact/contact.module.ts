import { Module } from '@nestjs/common';
import { ContactAdminController } from './contact-admin.controller';
import { ContactMailerService } from './contact-mailer.service';
import { ContactController } from './contact.controller';
import { ContactRepository } from './contact.repository';
import { ContactService } from './contact.service';

/**
 * Contact & feedback domain: public submission, admin listing/status updates,
 * and the (stubbed) email notifications a submission triggers.
 *
 * `ContactMailerService` lives inside this module rather than as shared
 * infrastructure — no other domain sends email yet, and promoting it to a
 * `@Global` module before a second consumer exists is speculative.
 */
@Module({
  controllers: [ContactController, ContactAdminController],
  providers: [ContactService, ContactRepository, ContactMailerService],
  // Exported for `QuestionReportsModule`: reporting a question composes
  // into the existing contact/correction pipeline (Part 44) rather than
  // building a second submission-and-notification path.
  exports: [ContactService],
})
export class ContactModule {}
