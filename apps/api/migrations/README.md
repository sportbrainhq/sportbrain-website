# Migrations

Generated SQL migrations live here, produced by `drizzle-kit` from the schema
in `src/database/schema/`.

This directory is empty by design. The platform foundation defines no tables.

## Workflow

```bash
# 1. Define or change a table in src/database/schema/
# 2. Generate the migration from the diff
pnpm db:generate

# 3. Read the generated SQL. Every time.
# 4. Apply it
pnpm db:migrate
```

## Rules

1. **Generated SQL is reviewed by hand before committing.** drizzle-kit
   produces a syntactically valid diff, not necessarily the right one. A column
   rename it cannot detect is emitted as a drop plus an add, which silently
   destroys the data in that column.

2. **Migrations are forward-only.** No down migrations. Rolling back a schema
   change in production is a new forward migration written with the current
   data in mind, not a mechanical inverse.

3. **Migrations run as an explicit deploy step**, never on application boot.
   See `src/database/migrate.ts` for why.

4. **Committed migrations are immutable.** Once a migration has run anywhere
   other than a local machine, editing it means two environments disagree about
   what the schema is. Write a new one instead.
