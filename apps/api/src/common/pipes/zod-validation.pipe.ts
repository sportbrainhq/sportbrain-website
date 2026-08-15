import { Injectable, type PipeTransform } from '@nestjs/common';
import { ZodError, type ZodSchema } from 'zod';
import { AppException } from '../errors/app.exception';

/**
 * Validates and parses input against a Zod schema.
 *
 * Zod rather than class-validator because the contracts package already
 * defines request and response shapes as Zod schemas: reusing them means the
 * validator and the published type are the same object, and there is no
 * second set of decorated DTO classes to keep in step.
 *
 * Usage on a future domain controller:
 *
 *   @Get()
 *   list(@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery) {}
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw AppException.validationFailed(
          'Request validation failed',
          error.issues.map((issue) => ({
            path: issue.path.join('.') || '(root)',
            message: issue.message,
          })),
        );
      }
      throw error;
    }
  }
}

/** Convenience factory, so call sites read as `zodPipe(schema)`. */
export function zodPipe<T>(schema: ZodSchema<T>): ZodValidationPipe<T> {
  return new ZodValidationPipe(schema);
}
