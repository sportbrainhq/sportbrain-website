import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { paginationQuerySchema, type PaginationQuery } from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { ExampleService } from './example.service';

/**
 * Controller layer: the HTTP surface. This is also where routes come from.
 *
 * There is no routes/ folder anywhere in this project, and there should not be
 * one. Nest builds the route table by reading these decorators at start-up:
 * `@Controller('examples')` plus `@Get(':slug')` registers
 * `GET /v1/examples/:slug`. The `/v1` prefix is applied globally in main.ts.
 *
 * Controllers stay thin. Parse the request, delegate, return the result.
 * Three things that do not belong here:
 *
 *   1. Business logic. It goes in the service, so a job can reuse it.
 *   2. Database access. It goes in the repository.
 *   3. try/catch. Throw an AppException and let the global filter render it.
 *
 * The return value is serialised as JSON automatically. There is no `res.json`
 * because taking the response object couples the method to Express.
 */
@ApiTags('examples')
@Controller('examples')
export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  /**
   * Route order matters: literal segments must be registered before parameter
   * segments, or `/examples/featured` is captured by `/examples/:slug` with
   * slug set to "featured".
   */
  @Get()
  @ApiOperation({ summary: 'List examples' })
  @ApiOkResponse({ description: 'A paginated list' })
  async list(
    // Validation is declarative: the pipe parses the query against the Zod
    // schema from @sportbrain/contracts and throws VALIDATION_FAILED with
    // field-level detail if it does not match. The method body can then trust
    // its arguments completely.
    @Query(zodPipe(paginationQuerySchema)) query: PaginationQuery,
  ) {
    const data = await this.service.findAll();

    // Lists are always returned in a paginated envelope, never as a naked
    // array: an array cannot carry a total, and adding one later breaks
    // every client. See buildPaginationMeta in @sportbrain/contracts.
    return { data, pagination: { ...query, total: 0, totalPages: 0, hasMore: false } };
  }

  /**
   * ```ts
   * @Get(':slug')
   * async bySlug(@Param('slug') slug: string) {
   *   // The service throws AppException.notFound if there is no such row.
   *   // No try/catch, no manual 404.
   *   return this.service.findBySlug(slug);
   * }
   * ```
   */
  @Get(':slug')
  @ApiOperation({ summary: 'Fetch one example by slug' })
  bySlug(@Param('slug') slug: string): { slug: string } {
    return { slug };
  }
}
