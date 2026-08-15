# Architecture

The boundaries in this repository, the dependency rules that keep them, and the
reasoning behind each significant choice.

## 1. Position in the SportBrainHQ ecosystem

Three separate systems:

```
CONTENT ENGINE          DESIGN SYSTEM          WEB PLATFORM
sportbrain-be           sportbrain-ui-library  this repository
      │                        │                     │
generates and            reusable visual        the public
manages social           foundations            website
content                                              │
      │                                       ┌──────┴──────┐
      │                                    Next.js       NestJS
      │                                       web          api
      │                                                     │
      └──────── future Bridge API ──────────────────▶   PostgreSQL
```

Two rules hold this apart:

1. **This repository owns its own database.** It does not read the content
   engine's. Sharing a database would couple two schemas permanently and mean
   neither could be refactored alone.
2. **Data flows one way.** Content engine to website, never back. That is what
   keeps them independently deployable.

Neither link exists yet. The extension point is `apps/api/src/integrations/`.

## 2. Dependency direction

```
apps/web  ──────────▶  packages/contracts  ◀──────────  apps/api
    │                   (zod schemas,                       │
    │                    inferred types)                    │
    │                                                       ▼
    └────────── HTTP ──────────────────────────▶  apps/api ──▶ PostgreSQL
```

Enforced rules:

| Rule                                                   | Why                                                                                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web` never imports from `apps/api`               | The web app must not depend on server internals. Importing a Nest service would drag the database driver into the client bundle. |
| `apps/web` never connects to PostgreSQL                | Database access lives behind the API, so connection limits, query safety and caching are decided in one place.                   |
| `packages/contracts` imports nothing but Zod           | A shared package that depends on an app cannot be shared.                                                                        |
| Apps do not import each other                          | They deploy separately.                                                                                                          |
| Domain modules do not import each other's repositories | Cross-domain access goes through the exported service.                                                                           |

`packages/contracts` is the only compile-time coupling between web and API, and
it contains schemas only: no logic, no I/O, no framework imports.

## 3. Technology choices

### Next.js App Router

Server components by default. The site is read-heavy, SEO-critical and mostly
static, which is exactly the case the App Router serves best: content is
rendered on the server, and the browser gets HTML rather than a JavaScript
bundle that fetches data.

Client components are the exception, added only where interaction requires
them. Today that is `app/error.tsx`, which must be a client component because
React error boundaries need state.

### NestJS

Requested, and a good fit. The module system gives each future domain a clear
boundary, and dependency injection makes services testable without a running
database. Its cost is ceremony, which is acceptable for a platform expected to
run for years.

### Drizzle over Prisma or TypeORM

Considered all three:

- **TypeORM** is the Nest default, but its active-record and decorator model
  pushes you toward defining entities immediately, which this foundation
  explicitly must not do. Migration ergonomics are also weak.
- **Prisma** would give continuity with the content-generation service. Against
  it: it needs at least one model in `schema.prisma` to generate a client, so a
  no-tables foundation is awkward, and the sibling repo had to fall back to raw
  SQL for pgvector via `Unsupported()`.
- **Drizzle** runs with zero tables defined, uses plain TypeScript with no
  codegen step, produces SQL migrations you can read, and handles the Postgres
  features the future schema needs (enums, arrays, `citext`, `tsvector`,
  and pgvector) natively.

The connection pool lives in exactly one place, `DatabaseService`. Nothing else
imports `postgres`.

### Zod for validation, not class-validator

`packages/contracts` already defines request and response shapes as Zod
schemas, and their TypeScript types are inferred from them. Reusing those
schemas as the runtime validator means the validator and the published type are
the same object and cannot drift. class-validator would require a parallel set
of decorated DTO classes describing the same shapes twice.

`ZodValidationPipe` is the single entry point.

### No Redis

Considered and deferred. There is nothing to cache yet, and Redis is a service
to run, monitor and pay for.

`CacheService` is an abstract class with an in-memory implementation. Its limits
are honest: not shared between instances, lost on restart, bounded at 5,000
entries. When any of those bites, add a `RedisCacheService` implementing the
same abstract class and change one line in `CacheModule`. No call site changes.

Page-level caching is handled by Next.js ISR, which needs no backend
involvement at all.

### No queue system

BullMQ needs Redis, so the same reasoning applies. `@nestjs/schedule` is
installed because cron was an explicit requirement and it needs no external
infrastructure.

The known limitation is documented in `apps/api/src/jobs/jobs.module.ts`:
in-process scheduling means every replica runs every cron. `JOBS_ENABLED` is
the interim control. Before scaling out with real jobs, either move to a queue
with a single consumer or take a Postgres advisory lock per job.

## 4. Package decisions

### Why `packages/contracts` exists

There is one genuine day-one need for shared types: the health endpoint's
response, which the API produces and the web app renders. Defining it once as a
Zod schema gives both sides the same type and gives the web app a runtime
validator for the response it receives.

### Why there is no `packages/api-client` yet

There is one endpoint. A package wrapping a single `fetch` call is indirection
without benefit. The client lives at `apps/web/lib/api.ts`, already structured
for extraction: typed, schema-validated, with timeout and error handling in one
place.

Extract it when a second consumer appears (an admin app, a worker) or when the
domain surface grows past a handful of calls.

### Why there is no `packages/types`

Types are inferred from the Zod schemas in `packages/contracts`. A separate
package for hand-written types would create a second place for the same
information to live and a second place for it to be wrong.

### Why there is no `packages/ui` yet

The website will need product-specific components. It does not have any yet,
and a package containing one `Container` is not a design system.

Components live in `apps/web/components/` until a second consumer needs them.

### Why config is three packages, not one

A single `packages/config` means the web app pulls in Nest-specific lint rules
and the API pulls in React ones. Splitting by concern keeps each dependency
graph honest, and each file is a few lines.

## 5. UI library integration

`sportbrain-ui-library` is the design foundation. It is **not currently
installable by another repository**, for concrete reasons found by reading it:

- `"private": true`
- no `exports`, `main`, `types` or `files` in `package.json`
- `noEmit: true`, so no type declarations are produced
- `dist/` holds a built demo site, not a library bundle
- React is a direct dependency rather than a peer, so linking it into another
  React app yields two React copies and hook errors
- no `"use client"` directives, so its interactive components would break under
  React Server Components

**Current approach:** design tokens are carried across into
`apps/web/app/globals.css` as CSS custom properties, including the library's
two documented accessibility corrections. Tokens are values, not code, so this
is not a fork of the component library. The two surfaces render identically.

**To make it a real dependency**, the library needs:

1. A library build (`vite build.lib` or tsup) emitting ESM plus `.d.ts`
2. An `exports` map, `types`, `files`, and `private` removed
3. React and React DOM moved to `peerDependencies`
4. `"sideEffects": ["**/*.css"]`, so a bundler cannot tree-shake the token layer
5. `"use client"` on the components that need it
6. `src/index.css` exported as a subpath
7. The five sport folders that exist but are missing from the barrel
   (`baseball`, `cycling`, `golf`, `mma`, `rugby`) exported

Then this repo installs it as a git dependency or from a registry and imports
components directly. Until then, do not copy component source across: copying
tokens is maintainable, copying components is a fork.

## 6. Configuration

One rule: **no application code reads `process.env` directly.**

- API: `apps/api/src/config/env.schema.ts` defines the contract,
  `configuration.ts` validates it once at start-up and reshapes it into a typed
  tree consumed through `ConfigService`.
- Web: `apps/web/lib/env.ts`, split into server and client schemas because only
  `NEXT_PUBLIC_`-prefixed variables reach the browser.

Invalid configuration fails at start-up, not at the first request that happens
to touch the bad value.

Two production guards fail closed rather than trusting the deployer to
remember: Swagger must be disabled, and `CORS_ORIGINS` must not contain
localhost.

## 7. Error handling

Every non-2xx response is `{ error: { code, message, details?, requestId? } }`,
produced by `AllExceptionsFilter`, which is registered globally.

- `code` is stable and machine-readable. Clients branch on it, never on
  `message`.
- Unrecognised errors are logged in full server-side and rendered as a bare
  `INTERNAL`. Stack traces and driver messages never cross the boundary.
- `requestId` correlates a user-reported error with a log line.

Application code throws `AppException`, which carries the code alongside the
HTTP status.

## 8. Security posture

Present:

- Helmet security headers on the API, and a header set on every Next.js
  response (HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`)
- CORS restricted to a configured origin list
- Rate limiting on every route by default, via a global `ThrottlerGuard`
- Zod validation at the boundary
- Errors that reveal nothing internal
- Production config guards that fail closed
- No `remotePatterns` for images, so the deployment cannot be used as an open
  image proxy

Deliberately absent, with the trigger for adding each:

- **Authentication.** No users and no write endpoints exist. Add it with the
  first write endpoint, before the first one ships.
- **Content Security Policy.** A permissive placeholder gives false assurance.
  Add it with the first real content. It is the primary defence for a site that
  will eventually render markdown from a content pipeline, where stored XSS is
  the highest-likelihood serious vulnerability.

One deliberate divergence from the sibling repo: its API-key middleware
disables authentication entirely when `API_KEYS` is empty, which is fail-open.
Configuration here fails closed in production.

## 9. Testing

Vitest everywhere, matching the sibling repos.

Foundation-stage tests cover the things that must be right before anything else
can work: environment validation (including both production guards), the
pagination contract, and the SEO metadata builder including its JSON-LD
escaping. That is the whole suite, on purpose. Tests for domains that do not
exist would be tests of nothing.

Nest's DI reads decorator metadata at runtime, which Vitest's default esbuild
transform strips, so `apps/api/vitest.config.ts` uses the SWC plugin.

## 10. Deployment

Web and API deploy independently and must stay that way.

See [deployment.md](deployment.md).
