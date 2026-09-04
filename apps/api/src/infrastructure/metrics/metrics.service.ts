import { Injectable } from '@nestjs/common';

/**
 * The metrics contract the application codes against.
 *
 * Deliberately narrow, mirroring `CacheService`'s abstract-class-with-
 * swappable-binding pattern: everything here is satisfiable by a plain
 * in-process store, or later by a real Prometheus client, so swapping the
 * implementation does not require touching a single call site.
 */
export abstract class MetricsService {
  /** Increments a counter (a value that only ever goes up — e.g. `rss_fetch_total`). */
  abstract incrementCounter(name: string, labels?: Record<string, string>, value?: number): void;

  /** Records one observation into a histogram (e.g. `rss_fetch_duration`, in milliseconds). */
  abstract observeHistogram(name: string, value: number, labels?: Record<string, string>): void;

  /** Sets a gauge to an absolute value (a value that can go up or down — e.g. `source_health`). */
  abstract setGauge(name: string, value: number, labels?: Record<string, string>): void;

  /** Returns every recorded metric, for the internal status API (or a future `/metrics` exporter) to read. */
  abstract getSnapshot(): MetricsSnapshot;
}

export interface CounterSnapshot {
  name: string;
  labels: Record<string, string>;
  value: number;
}

export interface GaugeSnapshot {
  name: string;
  labels: Record<string, string>;
  value: number;
}

export interface HistogramSnapshot {
  name: string;
  labels: Record<string, string>;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
}

export interface MetricsSnapshot {
  counters: CounterSnapshot[];
  gauges: GaugeSnapshot[];
  histograms: HistogramSnapshot[];
}

interface HistogramAccumulator {
  count: number;
  sum: number;
  min: number;
  max: number;
}

/** Deterministic key for a (name, labels) pair, so identical label sets always aggregate into the same series. */
function seriesKey(name: string, labels: Record<string, string> | undefined): string {
  if (!labels || Object.keys(labels).length === 0) return name;
  const sortedEntries = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b));
  const labelPart = sortedEntries.map(([key, value]) => `${key}=${value}`).join(',');
  return `${name}{${labelPart}}`;
}

/**
 * In-process metrics store, the default (and for now only) implementation.
 *
 * Chosen for the same reason `InMemoryCacheService` is the cache default:
 * there is no Prometheus (or other metrics backend) provisioned yet, and
 * standing one up is a real infrastructure decision, not something to bolt
 * on speculatively for one phase's internal status endpoint. This
 * implementation is correct for a single instance, is lost on restart, and
 * is not aggregated across replicas.
 *
 * SEAM FOR A REAL BACKEND: when Prometheus (or equivalent) is provisioned,
 * add a `PrometheusMetricsService` implementing this same abstract class
 * (using `prom-client` to back `incrementCounter`/`observeHistogram`/
 * `setGauge`, and exposing a `toPrometheusText()`-style method for a scrape
 * endpoint) and rebind the provider in `MetricsModule`, exactly as
 * `CacheModule` rebinds `CacheService` to `RedisCacheService` when
 * `REDIS_URL` is configured. No call site elsewhere in the app changes.
 */
@Injectable()
export class InMemoryMetricsService extends MetricsService {
  private readonly counters = new Map<string, CounterSnapshot>();
  private readonly gauges = new Map<string, GaugeSnapshot>();
  private readonly histograms = new Map<
    string,
    { labels: Record<string, string>; name: string } & HistogramAccumulator
  >();

  incrementCounter(name: string, labels: Record<string, string> = {}, value = 1): void {
    const key = seriesKey(name, labels);
    const existing = this.counters.get(key);
    if (existing) {
      existing.value += value;
      return;
    }
    this.counters.set(key, { name, labels, value });
  }

  observeHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = seriesKey(name, labels);
    const existing = this.histograms.get(key);
    if (existing) {
      existing.count += 1;
      existing.sum += value;
      existing.min = Math.min(existing.min, value);
      existing.max = Math.max(existing.max, value);
      return;
    }
    this.histograms.set(key, { name, labels, count: 1, sum: value, min: value, max: value });
  }

  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = seriesKey(name, labels);
    this.gauges.set(key, { name, labels, value });
  }

  getSnapshot(): MetricsSnapshot {
    return {
      counters: [...this.counters.values()].map((entry) => ({ ...entry })),
      gauges: [...this.gauges.values()].map((entry) => ({ ...entry })),
      histograms: [...this.histograms.values()].map(({ name, labels, count, sum, min, max }) => ({
        name,
        labels,
        count,
        sum,
        min,
        max,
        avg: count > 0 ? sum / count : 0,
      })),
    };
  }
}
