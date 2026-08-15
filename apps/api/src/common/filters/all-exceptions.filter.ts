import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ExceptionFilter,
} from '@nestjs/common';
import { ERROR_CODES, type ErrorResponse } from '@sportbrain/contracts';
import type { Request, Response } from 'express';
import { AppException } from '../errors/app.exception';
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware';

/**
 * The single place an error becomes an HTTP response.
 *
 * Three guarantees, all of which matter in production:
 *
 *   1. Every error body is the same `{ error: { code, message } }` envelope,
 *      so the web app never has to guess at a shape.
 *   2. Unrecognised errors are logged in full server-side and rendered to the
 *      client as a bare INTERNAL. Stack traces, driver messages and file paths
 *      never cross the boundary.
 *   3. Every response carries the request id, so a user-reported error can be
 *      traced to a specific log line.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.header(REQUEST_ID_HEADER) ?? undefined;

    const { status, body } = this.render(exception, requestId);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // Full detail, server-side only.
      this.logger.error(
        `${request.method} ${request.url} failed: ${this.describe(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} -> ${status} ${body.error.code}`);
    }

    response.status(status).json(body);
  }

  private render(
    exception: unknown,
    requestId: string | undefined,
  ): { status: number; body: ErrorResponse } {
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        body: {
          error: {
            code: exception.code,
            message: exception.message,
            details: exception.details,
            requestId,
          },
        },
      };
    }

    // Exceptions thrown by Nest itself (guards, pipes, the router) and by
    // third-party code that uses HttpException.
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      const message =
        typeof payload === 'string'
          ? payload
          : ((payload as { message?: string | string[] }).message ?? exception.message);

      return {
        status,
        body: {
          error: {
            code: this.codeForStatus(status),
            message: Array.isArray(message) ? message.join('; ') : message,
            requestId,
          },
        },
      };
    }

    // Anything else is a bug. Say nothing useful to the caller.
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        error: {
          code: ERROR_CODES.INTERNAL,
          message: 'Internal server error',
          requestId,
        },
      },
    };
  }

  private codeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODES.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ERROR_CODES.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ERROR_CODES.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ERROR_CODES.RATE_LIMITED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ERROR_CODES.SERVICE_UNAVAILABLE;
      default:
        return status >= 500 ? ERROR_CODES.INTERNAL : ERROR_CODES.BAD_REQUEST;
    }
  }

  private describe(exception: unknown): string {
    if (exception instanceof Error) return `${exception.name}: ${exception.message}`;
    return String(exception);
  }
}
