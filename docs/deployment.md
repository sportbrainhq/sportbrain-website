# Deployment

Nothing is deployed yet. This records the intended topology and the decisions
that the foundation has already committed to.

## Topology

```
          ┌──────────────┐
Browser ─▶│  apps/web    │  Next.js, edge/serverless
          │  Vercel      │
          └──────┬───────┘
                 │ HTTPS, server-side only
                 ▼
          ┌──────────────┐
          │  apps/api    │  NestJS, container
          │  Railway /   │
          │  Render/Fly  │
          └──────┬───────┘
                 ▼
          ┌──────────────┐
          │  PostgreSQL  │  Neon / Supabase / RDS
          └──────────────┘
```

**Web and API deploy independently.** They are separate build artefacts with
separate lifecycles, and nothing in the repository couples them into one. A
change to the API does not require redeploying the site.

## Web

Vercel, chosen because the site is Next.js and its ISR and on-demand
revalidation are the deciding factor for a content site.

- Build: `pnpm --filter @sportbrain/web build`
- Root directory: repository root (Turborepo handles the workspace)
- Environment: `API_URL`, `NEXT_PUBLIC_SITE_URL`

`NEXT_PUBLIC_SITE_URL` must be the real public origin. Every canonical URL,
Open Graph tag and sitemap entry is built from it, so a wrong value means every
absolute URL the site emits is wrong.

## API

Any container host. Railway, Render or Fly.io all suit a small stateless
service.

- Build: `pnpm --filter @sportbrain/api build`
- Start: `node dist/main.js`
- Health check: `GET /health/readiness`
- Liveness probe: `GET /health/liveness`

**Configure the probes separately.** Pointing liveness at readiness turns a
transient database outage into a restart loop across every replica. Liveness
checks nothing external for exactly this reason.

## Database

Managed Postgres. Neon's branching is genuinely useful for testing migrations
against production-shaped data.

Set `DATABASE_SSL=true` in production and size `DATABASE_POOL_MAX` to the
host's connection limit divided by the replica count. A pool larger than the
server allows fails at the worst possible moment, under load.

## Migrations

**Run as an explicit deploy step, before the new version starts.** Never on
application boot: booting-and-migrating means N replicas racing to apply the
same DDL.

```bash
pnpm db:migrate
```

CI proves migrations apply cleanly to an empty database on every pull request.

Migrations are forward-only. Rolling back a schema change in production is a
new forward migration written with the current data in mind, not a mechanical
inverse.

## Environments

|             | Web               | API            | Database            |
| ----------- | ----------------- | -------------- | ------------------- |
| Development | localhost:3000    | localhost:4000 | local Postgres      |
| Preview     | per-PR Vercel URL | staging API    | branch database     |
| Production  | the public domain | production API | production database |

Preview deployments are disallowed in `robots.ts` when the origin is not the
production one, so staging cannot be indexed and compete with the real site.

## Production checklist

Configuration guards enforce the first two automatically, and the API refuses
to start if either is wrong:

- [ ] `SWAGGER_ENABLED=false`
- [ ] `CORS_ORIGINS` contains no localhost, only the real web origin
- [ ] `DATABASE_SSL=true`
- [ ] `NEXT_PUBLIC_SITE_URL` is the real public origin
- [ ] `DATABASE_POOL_MAX` sized against the host's connection limit
- [ ] `JOBS_ENABLED=false` unless exactly one replica runs jobs
- [ ] Secrets come from the host's secret store, never from a committed file
- [ ] Migrations applied before the new version starts
- [ ] Readiness and liveness probes configured separately

## Before real traffic

Deliberately deferred, and each should be closed before launch rather than
after:

- **Content Security Policy.** The primary defence once the site renders
  content from a pipeline.
- **Error tracking.** The extension point is the `useEffect` in
  `apps/web/app/error.tsx` and `AllExceptionsFilter` in the API.
- **Log aggregation.** Logs are structured and carry a request id; nothing
  ships them anywhere yet.
- **Uptime monitoring** against `/health/readiness`.
- **A backup and restore drill.** An untested backup is not a backup.
