import 'reflect-metadata';
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import type { AppConfig } from './config';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    // Buffer start-up logs until the configured log level is known, so a
    // production process does not emit debug output for its first second.
    bufferLogs: true,
  });

  const config = app.get(ConfigService<AppConfig, true>);
  const isProduction = config.get('isProduction', { infer: true });
  const port = config.get('port', { infer: true });

  // --- Security -----------------------------------------------------------

  app.use(
    helmet({
      // The API serves JSON, never HTML, so the restrictive defaults are
      // right. CSP is disabled because it would only apply to the Swagger UI,
      // which helmet's default policy breaks.
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const corsOrigins = config.get('http.corsOrigins', { infer: true });
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    exposedHeaders: ['x-request-id'],
    credentials: true,
    maxAge: 86_400,
  });

  // Trust the first proxy hop so that rate limiting and logging see the real
  // client IP rather than the load balancer's.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // --- Routing ------------------------------------------------------------

  // Everything lives under /v1 from the first commit. Retrofitting a version
  // prefix after clients exist means maintaining both forever.
  app.setGlobalPrefix('', {
    // Probes stay at the root: orchestrators and uptime checks should not have
    // to know the API's versioning scheme.
    exclude: ['health', 'health/liveness', 'health/readiness'],
  });

  // URI versioning supplies the `v1` segment on its own, producing `/v1/sports`.
  //
  // This previously combined `setGlobalPrefix('v1')` with URI versioning, and
  // the two compose rather than overlap: every route was served at `/v1/v1/...`
  // while the documentation, the Swagger UI and every controller comment said
  // `/v1/...`. Nothing caught it because the foundation had no domain routes to
  // request. Versioning owns the prefix; the global prefix stays empty.
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // --- Documentation ------------------------------------------------------

  if (config.get('swagger.enabled', { infer: true })) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('SportBrainHQ Website API')
        .setDescription(
          'Platform API for the SportBrainHQ website. Only infrastructure endpoints exist at this stage.',
        )
        .setVersion('0.1.0')
        .addTag('health', 'Liveness, readiness and service status')
        .build(),
    );

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log(`API documentation at http://localhost:${port}/docs`);
  }

  // --- Lifecycle ----------------------------------------------------------

  // Lets onModuleDestroy hooks run, so the database pool closes cleanly rather
  // than the container being killed mid-query.
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`API listening on port ${port} in ${config.get('env', { infer: true })} mode`);
}

bootstrap().catch((error: unknown) => {
  // The Nest logger may not exist yet if the failure was in configuration.
  process.stderr.write(
    `Failed to start API: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exit(1);
});
