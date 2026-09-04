import { Global, Module } from '@nestjs/common';
import { InMemoryMetricsService, MetricsService } from './metrics.service';

/**
 * Binds the metrics contract to its current implementation.
 *
 * Always `InMemoryMetricsService` for now — see `metrics.service.ts`'s doc
 * comment for the seam. When a real backend (Prometheus via `prom-client`,
 * or a hosted equivalent) is provisioned, this factory should follow
 * `CacheModule`'s pattern: check typed config for whether that backend is
 * configured, and bind a `PrometheusMetricsService` instead when it is,
 * falling back to `InMemoryMetricsService` otherwise. E.g.:
 *
 *   useFactory: (config: ConfigService<AppConfig, true>) => {
 *     const prometheusEnabled = config.get('metrics.prometheusEnabled', { infer: true });
 *     return prometheusEnabled ? new PrometheusMetricsService() : new InMemoryMetricsService();
 *   }
 *
 * Not implemented speculatively: no Prometheus client dependency exists in
 * this repo yet, and adding one is an infrastructure decision for the team,
 * not something to pre-empt here.
 */
@Global()
@Module({
  providers: [{ provide: MetricsService, useClass: InMemoryMetricsService }],
  exports: [MetricsService],
})
export class MetricsModule {}
