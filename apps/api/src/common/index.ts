/**
 * Cross-cutting building blocks shared by every module.
 *
 * Nothing domain-specific belongs here. If a helper is only meaningful to one
 * future module, it lives in that module.
 */

export { AppException } from './errors/app.exception';
export { AllExceptionsFilter } from './filters/all-exceptions.filter';
export { LoggingInterceptor } from './interceptors/logging.interceptor';
export { RequestIdMiddleware, REQUEST_ID_HEADER } from './middleware/request-id.middleware';
export { ZodValidationPipe, zodPipe } from './pipes/zod-validation.pipe';
export {
  guardOutboundUrl,
  type UrlGuardResult,
  type UrlGuardFailureReason,
} from './security/url-guard';
export { resolveSafeRedirect } from './security/safe-redirect';
export { signCookieValue, verifySignedCookieValue } from './security/signed-cookie';
export type { AuthenticatedUser } from './auth/authenticated-user';
export { CurrentUser } from './decorators/current-user.decorator';
export { Roles, ROLES_KEY } from './decorators/roles.decorator';
export { RolesGuard } from './guards/roles.guard';
