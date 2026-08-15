# Domain modules

No real domains yet, by design.

The platform foundation deliberately ships without sports, players, teams,
stories, records, rankings, timelines or statistics. Creating placeholder
modules for them would mean inventing their shape before the domain model is
agreed, which is the expensive kind of wrong.

`_example/` is the exception: a structural reference showing where a controller,
service and repository go and how they connect. It is not imported by
`app.module.ts`, so it serves no routes, and it defines no tables. Copy it to
start a domain, delete it once a real one exists. See
[\_example/README.md](_example/README.md).

## Where routes come from

There is no `routes/` folder, and there should not be one. Nest builds the route
table at start-up from the decorators on a controller: `@Controller('sports')`
plus `@Get(':slug')` registers `GET /v1/sports/:slug`, with the `/v1` prefix
applied globally in `main.ts`.

## Adding a domain

Each domain is a self-contained folder that owns its routes, its services and
its database access:

```
modules/
  <domain>/
    <domain>.module.ts       wiring
    <domain>.controller.ts   HTTP surface, thin
    <domain>.service.ts      business logic
    <domain>.repository.ts   database access, the only place with SQL
    dto/                     request and response shapes
    <domain>.service.spec.ts tests
```

Then import the module in `app.module.ts`.

## Rules

1. **Controllers stay thin.** Parse, delegate, return. No business logic and
   no database access in a controller.

2. **Repositories own all SQL.** A service that builds a query is a service
   that cannot be tested without a database.

3. **Request and response shapes come from `@sportbrain/contracts`.** Define
   the Zod schema there, validate with `ZodValidationPipe`, and the web app
   gets the type for free. Do not hand-write a matching interface.

4. **Domains do not import each other's internals.** If `stories` needs
   something from `players`, it goes through the exported service, never the
   repository. Circular imports between domains are the first sign a boundary
   is wrong.

5. **Public read endpoints never return unpublished rows.** Enforce it in the
   repository, not in each controller, so it cannot be forgotten.
