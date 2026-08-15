# SportBrainHQ Website

The SportBrainHQ public web platform: a Next.js site and a NestJS API in one
pnpm monorepo.

**Status: platform foundation.** The infrastructure is in place. No product
features are built yet, and there are deliberately no domain entities: no
sports, players, teams, stories, records, rankings or statistics. See
[what is not built](#what-is-not-built).

## Requirements

- Node 22 or later (`.nvmrc` pins 22)
- pnpm 10 or later
- PostgreSQL 15 or later

## Quick start

```bash
# 1. Install
pnpm install

# 2. Configure
cp .env.example .env
#    Edit DATABASE_URL to point at your Postgres instance.

# 3. Create the database
createdb sportbrain_web

# 4. Run both apps
pnpm dev
```

- Web: <http://localhost:3000>
- API: <http://localhost:4000>
- API docs: <http://localhost:4000/docs>
- Health: <http://localhost:4000/health>

The homepage shows API connectivity, so if it reports `ok` the whole stack is
wired correctly.

## Layout

```
apps/
  web/                 Next.js 15 App Router. Public site.
  api/                 NestJS 11. Platform API.
packages/
  contracts/           Zod schemas shared by web and api. The API boundary.
  config-typescript/   Shared tsconfig bases.
  config-eslint/       Shared flat ESLint configs.
docs/                  Architecture, development, deployment.
```

## Commands

Run from the repository root. Turborepo fans each out to the packages that
define it.

| Command            | Does                                                 |
| ------------------ | ---------------------------------------------------- |
| `pnpm dev`         | Runs web and API together, in watch mode             |
| `pnpm build`       | Builds everything, in dependency order               |
| `pnpm lint`        | ESLint across all packages                           |
| `pnpm typecheck`   | TypeScript, no emit                                  |
| `pnpm test`        | Vitest across all packages                           |
| `pnpm format`      | Prettier, writes                                     |
| `pnpm verify`      | typecheck, lint, format check and test. What CI runs |
| `pnpm db:generate` | Generates a migration from schema changes            |
| `pnpm db:migrate`  | Applies pending migrations                           |
| `pnpm db:studio`   | Opens Drizzle Studio                                 |

Target one package with `--filter`:

```bash
pnpm --filter @sportbrain/api dev
pnpm --filter @sportbrain/web build
```

## How it fits together

```
Browser
   │
   ▼
apps/web ─────────────┐
   │  server          │ imports types from
   │  components      ▼
   │              packages/contracts
   │  HTTP            ▲
   ▼                  │ imports schemas from
apps/api ─────────────┘
   │
   ▼
PostgreSQL
```

The direction is one-way. The web app never touches the database and never
imports from `apps/api`. Both depend on `packages/contracts`, which depends on
nothing. Details in [docs/architecture.md](docs/architecture.md).

## What is not built

Intentionally absent, so that nobody goes looking:

- **Domain entities.** No tables at all. `apps/api/src/database/schema/` is
  empty and `migrations/` contains only a README.
- **Domain modules.** `apps/api/src/modules/` is empty.
- **Domain routes.** The site has a homepage, a 404 and an error page.
- **Authentication.** No users exist to authenticate.
- **Redis.** The cache is an in-memory implementation behind an interface.
- **Queues.** No BullMQ, because it needs Redis.
- **Scheduled jobs.** The scheduler is wired; no jobs are defined.
- **UI library dependency.** Design tokens are carried across; the component
  library is not installable yet. See
  [docs/architecture.md](docs/architecture.md).
- **Content Security Policy.** Added with the first real content.

Each has an extension point rather than an implementation. The reasoning for
each is in the architecture doc.

## Documentation

- [docs/architecture.md](docs/architecture.md) — boundaries, dependency
  direction, and the reasoning behind each technology choice
- [docs/development.md](docs/development.md) — local setup, workflow, and how
  to add a domain
- [docs/deployment.md](docs/deployment.md) — environments, deployment topology
