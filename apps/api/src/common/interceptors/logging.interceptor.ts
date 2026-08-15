import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { tap, type Observable } from 'rxjs';

/**
 * Logs one structured line per completed request.
 *
 * Health checks are skipped: an orchestrator probes them every few seconds and
 * the noise buries everything else. They are still covered by the error path,
 * so a failing health check is not silent.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private static readonly SILENT_PATHS = ['/health', '/health/liveness', '/health/readiness'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    if (LoggingInterceptor.SILENT_PATHS.includes(request.path)) {
      return next.handle();
    }

    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = http.getResponse<Response>();
        this.logger.log(
          `${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - startedAt}ms`,
        );
      }),
    );
  }
}
