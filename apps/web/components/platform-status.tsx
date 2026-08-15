import { connection } from 'next/server';
import { fetchHealth } from '@/lib/api';

/**
 * Renders API connectivity, proving the web to API path works end to end.
 *
 * This is scaffolding for the foundation, not a product feature: it is removed
 * once the homepage has real content. It is an async server component, so the
 * fetch happens on the server and no API URL or client-side request reaches
 * the browser.
 */
export async function PlatformStatus() {
  // Opts this component out of static prerendering. Without it, the status is
  // captured at build time (when no API is running) and every visitor is served
  // that stale answer. Only this component becomes dynamic; the rest of the
  // page is still prerendered and streams in first.
  await connection();

  let status: 'ok' | 'unreachable' = 'unreachable';
  let detail = 'The API is not responding. Start it with `pnpm dev`.';

  try {
    const health = await fetchHealth();
    status = health.status === 'ok' ? 'ok' : 'unreachable';
    detail =
      health.status === 'ok'
        ? `Connected to ${health.service} v${health.version} (${health.environment}), database reachable.`
        : 'The API responded, but a dependency is unhealthy.';
  } catch {
    // Deliberately swallowed. A missing API should render a status message,
    // not crash the homepage: the page is useful without it.
  }

  const isOk = status === 'ok';

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`size-2 rounded-full ${isOk ? 'bg-success' : 'bg-destructive'}`}
        />
        <h2 className="text-sm font-semibold">
          API status: <span className={isOk ? 'text-success' : 'text-destructive'}>{status}</span>
        </h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
