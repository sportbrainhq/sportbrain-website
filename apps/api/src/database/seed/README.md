# Seed data

## `five-sports.sql`

A feasibility fixture, not production data. It exists to answer one question:
**does the canonical model hold across sports that are structurally unalike, or
does it only fit football?**

The five sports were chosen to break it rather than to flatter it:

| Sport      | The problem it poses                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| Football   | The easy case. Teams, league table, goals.                                     |
| Cricket    | Three formats whose statistics must never merge into one career total.         |
| Basketball | No divisions at all, so the discipline mechanism must be optional.             |
| Tennis     | **No teams.** No league table. Individual competitors, knockout draws.         |
| Formula 1  | **Two parallel championships** from the same events: drivers and constructors. |

Within football it also covers the disjoint-set case: an outfielder and a
goalkeeper are the same sport, and share no statistics at all.

### What it demonstrates

Applied to a clean database, a single query with **no sport named anywhere in
it** renders correct headline statistics for all five, each with its own
vocabulary, categories and number formatting:

```
   sport    |  player  |  division  |  category   |      stat       | value
------------+----------+------------+-------------+-----------------+--------
 Football   | Martinez | Goalkeeper | Goalkeeping | Clean Sheets    | 112
 Football   | Messi    | Outfield   | Attacking   | Goals           | 745
 Cricket    | Kohli    | Test       | Batting     | Batting Average | 47.83
 Cricket    | Kohli    | T20I       | Batting     | Strike Rate     | 137.04
 Basketball | Tatum    | —          | Scoring     | Points Per Game | 24.40
 Tennis     | Djokovic | —          | Career      | Grand Slams     | 24
 Formula 1  | Hamilton | Qualifying | Qualifying  | Pole Positions  | 104
```

Tennis renders **nothing** on the Teams tab, driven by `sport.traits.hasTeams`
rather than by a hard-coded exception. Formula 1 produces a drivers' row and a
constructors' row from one set of events, because a constructor is a team and
`statistic_definition.applies_to = 'both'` lets one definition serve either.

### Running it

```bash
# against a scratch database, never a real one
docker run --rm -d --name sb-seed -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sbtest -p 55432:5432 postgres:17-alpine

docker exec -i sb-seed psql -U postgres -d sbtest < apps/api/migrations/0000_*.sql
docker exec -i sb-seed psql -U postgres -d sbtest < apps/api/src/database/seed/five-sports.sql
```

### What it is not

The statistics here are approximate and illustrative. They are shaped correctly
and are not a source of truth: several are rounded, and none should reach a
page. Real figures arrive through ingestion.

Nothing in the application reads this file. It is a fixture for schema
verification, and it should be re-run whenever the statistics tables change,
because it is the cheapest way to find out that a change has quietly made one of
these five sports unrepresentable.
