import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

/**
 * Global so that future domain modules can inject DatabaseService without each
 * one importing DatabaseModule. There is a single connection pool for the
 * process, and making the module global reflects that.
 */
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
