import { describe, expect, it } from 'vitest';
import { InMemoryMetricsService } from './metrics.service';

describe('InMemoryMetricsService', () => {
  it('increments a counter from zero and accumulates repeated increments', () => {
    const metrics = new InMemoryMetricsService();
    metrics.incrementCounter('rss_fetch_total');
    metrics.incrementCounter('rss_fetch_total');
    metrics.incrementCounter('rss_fetch_total', undefined, 3);

    const snapshot = metrics.getSnapshot();
    expect(snapshot.counters).toHaveLength(1);
    expect(snapshot.counters[0]).toMatchObject({ name: 'rss_fetch_total', value: 5 });
  });

  it('keeps distinct label sets as separate series', () => {
    const metrics = new InMemoryMetricsService();
    metrics.incrementCounter('rss_fetch_total', { sourceId: 'a' });
    metrics.incrementCounter('rss_fetch_total', { sourceId: 'b' });
    metrics.incrementCounter('rss_fetch_total', { sourceId: 'a' });

    const snapshot = metrics.getSnapshot();
    expect(snapshot.counters).toHaveLength(2);
    const bySource = Object.fromEntries(
      snapshot.counters.map((counter) => [counter.labels.sourceId, counter.value]),
    );
    expect(bySource.a).toBe(2);
    expect(bySource.b).toBe(1);
  });

  it('treats label sets as equal regardless of key insertion order', () => {
    const metrics = new InMemoryMetricsService();
    metrics.incrementCounter('x', { a: '1', b: '2' });
    metrics.incrementCounter('x', { b: '2', a: '1' });

    const snapshot = metrics.getSnapshot();
    expect(snapshot.counters).toHaveLength(1);
    expect(snapshot.counters[0].value).toBe(2);
  });

  it('sets a gauge to the latest absolute value, not accumulating', () => {
    const metrics = new InMemoryMetricsService();
    metrics.setGauge('source_health', 3, { status: 'healthy' });
    metrics.setGauge('source_health', 5, { status: 'healthy' });

    const snapshot = metrics.getSnapshot();
    expect(snapshot.gauges).toHaveLength(1);
    expect(snapshot.gauges[0].value).toBe(5);
  });

  it('aggregates histogram observations into count/sum/min/max/avg', () => {
    const metrics = new InMemoryMetricsService();
    metrics.observeHistogram('rss_fetch_duration', 100);
    metrics.observeHistogram('rss_fetch_duration', 300);
    metrics.observeHistogram('rss_fetch_duration', 200);

    const snapshot = metrics.getSnapshot();
    expect(snapshot.histograms).toHaveLength(1);
    expect(snapshot.histograms[0]).toMatchObject({
      count: 3,
      sum: 600,
      min: 100,
      max: 300,
      avg: 200,
    });
  });

  it('getSnapshot returns independent copies that do not mutate internal state', () => {
    const metrics = new InMemoryMetricsService();
    metrics.incrementCounter('a');
    const snapshot = metrics.getSnapshot();
    snapshot.counters[0].value = 999;

    const secondSnapshot = metrics.getSnapshot();
    expect(secondSnapshot.counters[0].value).toBe(1);
  });

  it('getSnapshot starts empty', () => {
    const metrics = new InMemoryMetricsService();
    expect(metrics.getSnapshot()).toEqual({ counters: [], gauges: [], histograms: [] });
  });
});
