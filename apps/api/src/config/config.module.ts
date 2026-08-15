import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { loadConfiguration, type AppConfig } from './configuration';

/**
 * Typed accessor for application config.
 *
 * `ConfigService<AppConfig, true>` makes `get()` infer return types from the
 * AppConfig tree, and the `true` marks it infer-strict so a missing key is a
 * compile error rather than `undefined` at runtime.
 */
export type TypedConfigService = ConfigService<AppConfig, true>;

/**
 * Global configuration module.
 *
 * Global because nearly every module needs config, and threading an import
 * through each one adds noise without adding safety.
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfiguration],
      // Validation happens inside loadConfiguration via Zod, so Nest's own
      // envFilePath/validationSchema options are deliberately unused.
      cache: true,
      // In development, `.env` at the repo root is the single source. In
      // production, real environment variables are expected and no file is read.
      envFilePath: process.env.NODE_ENV === 'production' ? [] : ['../../.env', '.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}

export { ConfigService };
