import { Module } from '@nestjs/common';
import { ExampleController } from './example.controller';
import { ExampleRepository } from './example.repository';
import { ExampleService } from './example.service';

/**
 * Module: the wiring that makes a domain a unit.
 *
 * `controllers` are instantiated and their routes registered. `providers` are
 * available for injection inside this module. `exports` is the module's public
 * surface: another domain may inject `ExampleService`, but not
 * `ExampleRepository`, which is what stops one domain reaching into another's
 * database access.
 *
 * DatabaseService and CacheService are not imported here because their modules
 * are marked @Global. They are injectable anywhere.
 *
 * This module is deliberately NOT imported in app.module.ts, so none of these
 * routes are served. Adding a line to AppModule's `imports` is the single step
 * that activates a domain.
 */
@Module({
  controllers: [ExampleController],
  providers: [ExampleService, ExampleRepository],
  exports: [ExampleService],
})
export class ExampleModule {}
