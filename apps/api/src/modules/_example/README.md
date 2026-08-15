# \_example

A structural reference, not a feature. It shows where a controller, service and
repository go, and how they connect.

**It is not wired up.** `ExampleModule` is deliberately absent from
`app.module.ts`, so no routes are served and nothing runs. It defines no
entities and touches no tables.

Underscore-prefixed so it sorts above the real domains and reads as
non-production at a glance.

## The four files

| File                    | Layer  | Owns                                   | Never contains                 |
| ----------------------- | ------ | -------------------------------------- | ------------------------------ |
| `example.controller.ts` | HTTP   | Route definitions, request parsing     | Business logic, SQL, try/catch |
| `example.service.ts`    | Domain | Business rules, caching, orchestration | HTTP objects, SQL              |
| `example.repository.ts` | Data   | All queries                            | Business rules                 |
| `example.module.ts`     | Wiring | What is provided and exported          | Logic of any kind              |

## Where routes come from

There is no `routes/` folder in this project, and there should not be one.
Nest builds the route table at start-up by reading decorators:

```ts
@Controller('examples')   // -> /examples
export class ExampleController {
  @Get(':slug')           // -> GET /examples/:slug
```

`main.ts` adds the global `/v1` prefix, so the served path is
`GET /v1/examples/:slug`. Health endpoints are the exception: they are marked
`VERSION_NEUTRAL` so probes stay at a stable root path.

**Route ordering matters.** Literal segments must be declared before parameter
segments. With `@Get(':slug')` above `@Get('featured')`, a request for
`/examples/featured` matches the first and arrives with `slug = "featured"`.

## Creating a real domain

```bash
cp -r src/modules/_example src/modules/sports
cd src/modules/sports && for f in example.*; do mv "$f" "sports.${f#example.}"; done
```

Then rename the classes, and:

1. **Define the contract first** in `packages/contracts/src/sport.ts`. Both the
   API and the web app import the type from there, so it is written once.
2. **Define the table** in `apps/api/src/database/schema/sport.schema.ts`,
   export it from the schema barrel, then `pnpm db:generate` and read the
   generated SQL before applying it.
3. **Import the module** in `app.module.ts`. Until this line exists, the routes
   do not serve.
4. **Add the web route** under `apps/web/app/` and the API call in
   `apps/web/lib/api.ts`.

## Deleting this

Once the first real domain exists, this has served its purpose:

```bash
rm -rf apps/api/src/modules/_example
```

Nothing imports it, so nothing breaks.
