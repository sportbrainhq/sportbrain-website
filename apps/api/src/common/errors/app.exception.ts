import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES, type ErrorCode } from '@sportbrain/contracts';

/**
 * The exception type application code throws for expected failures.
 *
 * Carrying an explicit `code` alongside the HTTP status is what lets clients
 * branch on a stable identifier rather than parsing the message, and what
 * keeps the message free to change without breaking anyone.
 *
 * Ported from the pattern in the content-generation service, adapted to Nest's
 * HttpException so the framework's own filters and pipes interoperate with it.
 */
export class AppException extends HttpException {
  readonly code: ErrorCode;
  readonly details?: Array<{ path: string; message: string }>;

  constructor(
    status: HttpStatus,
    code: ErrorCode,
    message: string,
    details?: Array<{ path: string; message: string }>,
  ) {
    super({ code, message, details }, status);
    this.code = code;
    this.details = details;
  }

  static badRequest(message = 'Bad request'): AppException {
    return new AppException(HttpStatus.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, message);
  }

  static validationFailed(
    message: string,
    details: Array<{ path: string; message: string }>,
  ): AppException {
    return new AppException(
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.VALIDATION_FAILED,
      message,
      details,
    );
  }

  static unauthorized(message = 'Authentication required'): AppException {
    return new AppException(HttpStatus.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Not permitted'): AppException {
    return new AppException(HttpStatus.FORBIDDEN, ERROR_CODES.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found'): AppException {
    return new AppException(HttpStatus.NOT_FOUND, ERROR_CODES.NOT_FOUND, message);
  }

  static conflict(message = 'Conflict'): AppException {
    return new AppException(HttpStatus.CONFLICT, ERROR_CODES.CONFLICT, message);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable'): AppException {
    return new AppException(
      HttpStatus.SERVICE_UNAVAILABLE,
      ERROR_CODES.SERVICE_UNAVAILABLE,
      message,
    );
  }
}
