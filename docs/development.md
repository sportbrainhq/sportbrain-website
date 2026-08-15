# Development

## Setup

```bash
# Node 22
nvm use

pnpm install

cp .env.example .env
# Edit DATABASE_URL.

createdb sportbrain_web

pnpm dev
```

`pnpm dev` runs both apps. Web on 3000, API on 4000.

Verify: the homepage at <http://localhost:3000> shows **API status: ok**. If it
shows `unreachable`, the API failed to start, and its most common cause is
`DATABASE_URL` pointing at a database that does not exist.

### Postgres via Docker

If you would rather not install Postgres locally:

```bash
docker run --name sportbrain-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sportbrain_web \
  -p 5432:5432 \
  -d postgres:17-alpine
```

## Daily workflow

```bash
pnpm dev                              # both apps
pnpm --filter @sportbrain/api dev     # one app
pnpm verify                           # what CI runs, before pushing
```

`pnpm verify` runs typecheck, lint, format check and tests. Run it before
pushing: it is faster to fix locally than to wait for CI.

## Repository conventions

Carried over from the other SportBrainHQ repositories so that moving between
them is uneventful:

- **Formatting:** Prettier, single quotes, 100 columns, trailing commas. Not
  negotiable per-file; the config is at the root.
- **Linting:** flat ESLint config. Unused bindings prefixed `_` are allowed.
- **TypeScript:** strict, plus `noUnusedLocals`, `noUnusedParameters`,
  `noImplicitReturns`, `noFallthroughCasesInSwitch` and
  `noUncheckedIndexedAccess`.
- **Path alias:** `@/*` maps to the app root in web and to `src/*` in the API.
- **Files:** kebab-case (`site-header.tsx`, `all-exceptions.filter.ts`). Nest
  files keep their type suffix (`.module.ts`, `.service.ts`, `.controller.ts`).
- **British English** in comments, documentation and user-facing copy.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- **Branches:** `feat/…`, `fix/…`.

Husky formats staged files on commit and guards the remote on push. It does
**not** lint on commit: a bare `eslint` invocation resolves to whatever is on
PATH, which can be an older global install that cannot read flat configs.
Linting is enforced by `pnpm verify` and by CI, so run `pnpm verify` before
pushing.

## Adding a domain

The foundation is built for this. A worked order, using `sports` as the
example:

### 1. Define the contract first

```ts
// packages/contracts/src/sport.ts
export const sportSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
});
export type Sport = z.infer<typeof sportSchema>;
```

Export it from `packages/contracts/src/index.ts`. Both sides now share one
definition.

### 2. Define the table

```ts
// apps/api/src/database/schema/sport.schema.ts
export const sport = pgTable('sport', { ... });
```

Export it from `schema/index.ts`, then:

```bash
pnpm db:generate   # produces SQL from the diff
# read the generated SQL, every time
pnpm db:migrate
```

### 3. Build the module

```
apps/api/src/modules/sports/
  sports.module.ts
  sports.controller.ts     thin: parse, delegate, return
  sports.service.ts        business logic
  sports.repository.ts     the only place with SQL
  sports.service.spec.ts
```

Import the module in `app.module.ts`.

### 4. Consume it

Add the call to `apps/web/lib/api.ts`, validated against the contract schema.
Build the route under `apps/web/app/`.

### 5. Add the SEO surface

Export `metadata` (or `generateMetadata`) built with `buildMetadata`, and add
the entity's published rows to `app/sitemap.ts`.

### Rules worth repeating

1. Controllers hold no business logic and no SQL.
2. Repositories hold all SQL.
3. Request and response shapes come from `packages/contracts`. Never hand-write
   a matching interface.
4. Domains do not import each other's repositories.
5. Public read endpoints never return unpublished rows, enforced in the
   repository so it cannot be forgotten per-controller.

## Testing

```bash
pnpm test
pnpm --filter @sportbrain/api test
pnpm --filter @sportbrain/api test:watch
```

- API tests are `*.spec.ts` beside the code.
- Web tests are `*.test.ts(x)` beside the code.
- Contracts tests are `*.test.ts`.

Test behaviour, not implementation. A test that breaks when a function is
renamed but nothing behaves differently is a maintenance cost with no benefit.

## Troubleshooting

**API exits at start-up with "Invalid environment configuration"**
Read the message: it names the variable and what is wrong. Usually a missing
`DATABASE_URL`.

**API exits with "Database connection failed"**
Postgres is not running, or the database in `DATABASE_URL` does not exist. This
failure is deliberate: an API that cannot reach its database should not report
itself as started.

**Homepage shows "API status: unreachable"**
The API is not running, or `API_URL` in `.env` is wrong. The page renders
regardless, by design.

**Types from `@sportbrain/contracts` not found**
It is a compiled package. Run `pnpm build` once, or `pnpm --filter
@sportbrain/contracts dev` to watch it.

**Turborepo serving a stale result**
`pnpm clean && pnpm install`, or add `--force` to bypass the cache.
