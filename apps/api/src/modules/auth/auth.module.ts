import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { GoogleOAuthService } from './google-oauth.service';
import { SessionGuard } from './guards/session.guard';
import { SessionService } from './session.service';

/**
 * Identity, Google OAuth, and sessions.
 *
 * `SessionGuard` is exported (not just provided) so other feature modules
 * can `@UseGuards(SessionGuard)` on their own controllers without each
 * re-declaring the auth wiring — the same reason `DatabaseModule` is
 * `@Global` rather than re-imported everywhere, except this is exported
 * explicitly rather than made global, since not every module needs it.
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, GoogleOAuthService, SessionService, SessionGuard],
  exports: [AuthService, AuthRepository, SessionService, SessionGuard],
})
export class AuthModule {}
