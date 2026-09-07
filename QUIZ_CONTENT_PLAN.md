# Quiz Question Quality — Diagnosis & Rebuild Plan

## What's actually broken (confirmed against real data)

Current `TemplateGenerator` has exactly ONE fact type: "which team won honour X"
sourced from `honour` (team-title wins). Two structural bugs follow directly from that:

1. **No variety** — every question in a quiz is the same shape, so a batch of European
   club competitions all clusters in the same era (`honour` for football skews heavily
   toward European Cup/Cup Winners' Cup entries from the 60s-70s in the seeded data,
   because that's what got ingested first).
2. **Distractor pool wasn't scoped tight enough** — `findDistractorTeamNames` filters
   by `sport_id` + `team.kind` (club vs international) but NOT by competition/league.
   That's why an IPL question got a non-IPL team as a distractor: nothing in the
   query said "give me other IPL teams," only "give me other clubs in cricket."

Third-party research (Sporcle, OpenTDB, academic distractor-generation literature)
confirms: no one publicly generates sports MCQs from a live stats DB the way we're
attempting — this is genuinely unsolved-in-public territory. But the literature is
unanimous on the fix that matters: **distractors must be constrained to the same
competition/league/scope as the correct answer, not just the same sport.** Same-era
and same-role constraints matter too, ranked below category-match in importance.

## Decision: build locally, not a 3rd-party API

Rejected third-party trivia APIs (OpenTDB etc.) — they have a single flat "Sports"
category with no per-sport/per-competition granularity, hand-authored content, and
zero relationship to _our_ canonical Question Bank/entity graph (a third-party
question can't carry `factKey`, can't dedupe against our data, can't link back to
`player.id`/`team.id` for "view player" deep-links). Not viable without abandoning
half of Phase C's architecture (canonical bank, factKey dedup, provenance).

Real fix: **more fact-type templates over data we already have**, each with its own
tightly-scoped distractor query. Confirmed available per sport (row counts from live
DB):

| Sport             | person_statistic rows | key stat fields available                                             |
| ----------------- | --------------------- | --------------------------------------------------------------------- |
| Football          | 2,909                 | career_goals, career_games, career_trophies                           |
| Cricket           | 15,696                | runs, wickets, batting_average, hundreds, highest_score, best_bowling |
| Basketball        | 1,514                 | points_per_game, rebounds_per_game, assists_per_game, field_goal_%    |
| Tennis            | 251                   | match_wins, honours_won                                               |
| F1                | 30                    | wins, podiums, pole_positions, fastest_laps                           |
| Golf              | 309                   | honours_won                                                           |
| American Football | 298                   | (needs inspection)                                                    |
| Boxing            | 305                   | honours_won                                                           |
| MMA               | 1,173                 | fight_wins, knockout_wins, submission_wins                            |

Plus: `person_team` (6,947 football rows — club history with start/end dates),
`entity_fact` (position/height/birthplace/current_club per player), `venue`
(1,309 rows), `honour` (already wired, 31k+ rows).

This closes the individual-sport gap entirely (F1/golf/boxing/MMA/tennis all have
`person_statistic`, unlike `honour` which is team-only) and gives every sport at
least 2-3 independent fact-type templates instead of one.

## New fact-type templates (each = one generator class, same `QuestionGenerator` interface)

### 1. `HonourFactGenerator` (exists, needs distractor fix)

"Which team won the {title}?" — **fix: scope distractors to same competition
inferred from title text pattern-matching**, not just same sport+kind. Where the
title contains a recognizable competition name (parseable substring match against
`competition.name`/`aliases`), use only teams that have won a title containing that
same competition name as distractors. Falls back to same-sport+kind only when no
competition match found (rare).

### 2. `PlayerStatSuperlativeGenerator` (new)

"Which of these players scored the most career goals?" / "Which of these bowlers
has taken the most wickets?" — pick correct answer = highest stat value among a
sampled set of 4 players **within the same sport and, where the data supports it,
same competition/scope**, distractors = the other 3 sampled players (all real,
all with a real but lower value for that stat). This is trivially safe: every
option is plausible by construction, since all 4 are real athletes with a real
number for the same field.

### 3. `ClubHistoryGenerator` (new, football/cricket-strength sports first)

"Which club did {player} play for between {startYear} and {endYear}?" — correct
answer from `person_team`, distractors = other clubs the _same sport_ fielded in
the _same rough era_ (birth-year-of-the-record ± N years), scoped by sport so a
1960s club never appears as a distractor for a 2020s question and vice versa.

### 4. `PlayerIdentityGenerator` (new)

"Which player is this: nationality {X}, position {Y}, plays for {Z}?" (reverse:
given attributes, name the player) or "What position does {player} play?" —
sourced from `entity_fact`. Distractors = other players sharing sport + a
_different_ value for the asked attribute.

### 5. `RecordHolderGenerator` (new, data-permitting)

"Who holds the record for {stat} in {competition}?" — sourced from
`competition_statistic.record_person_id`/`record_team_id`. **Currently near-empty
for football (0 rows)** — this template ships but yields nothing until that table
gets populated; not a blocker for the other four.

### 6. Rules/format questions — explicitly NOT auto-generated

Confirmed by research: even Sporcle's rules questions are hand-authored, not
derived from a stats DB. `explainer` table has real rules content but it's prose,
not Q&A pairs. **Recommendation: skip auto-generation here.** If rules questions
are wanted, they go through manual creation (`POST /admin/questions`, already
built) with an editor writing them off the `explainer` content directly — a
content task, not a generation-pipeline task.

## Distractor safety — the concrete rule going forward

Every generator's distractor query MUST filter on, in order of strictness:

1. **Same sport** (existing, always).
2. **Same scope/competition/league** where the fact has one (fixes the IPL bug
   directly — cricket's `person_statistic.competition_id` already carries this,
   just wasn't being used).
3. **Same era/season window** where the fact is time-bound (club history, honours).
4. **Same role/position class** where the fact is player-specific and position data
   exists (`entity_fact.key = 'position'`).

Any generator that can't satisfy (1)+(2) for a given fact should skip that fact
(same policy already in place: "fewer than 3 valid distractors → skip", per
Part 28's no-invented-content rule) rather than falling back to an unscoped pool.

## Implementation order

1. Fix `HonourFactRepository.findDistractorTeamNames` to accept an optional
   competition-name filter, wire it from title-substring matching. Smallest,
   highest-impact fix — directly addresses the IPL example.
2. Build `PlayerStatSuperlativeGenerator` + its repository — highest question-count
   yield (2,909-15,696 rows per sport) and the safest distractor model (all options
   real + comparably scaled).
3. Build `ClubHistoryGenerator` (football only first, 6,947 rows).
4. Build `PlayerIdentityGenerator` off `entity_fact` (currently sparse — 211-1,298
   rows depending on field — lower priority).
5. Leave `RecordHolderGenerator` stubbed/documented but unwired until
   `competition_statistic` has real data (ingestion gap, not a generation-pipeline
   problem).
6. Regenerate the current 356 questions' worth of inventory using the new mix, retire
   duplicative team-title-only sets where a richer template covers the same
   competition.

## Status after implementation

All four buildable items were implemented:

1. **Distractor scoping fix** (`HonourFactRepository`) — competition-scoped
   distractors (fixes the original IPL bug exactly), plus a gender-consistency
   filter (fixes a second real bug found during verification: women's teams
   leaking into men's-competition questions, and vice versa).
2. **`PlayerStatSuperlativeGenerator`** — career stat leaderboards, wired for
   all 9 sports via a curated per-sport field list, verified against real data.
3. **`ClubHistoryGenerator`** — transfer/spell history from `person_team`,
   restricted to club/franchise kinds only (excludes international caps, which
   aren't "club history" and were leaking into distractor pools before the fix).
4. **`PlayerIdentityGenerator`** — birthplace/position/current-club questions
   from `entity_fact`, with a filter excluding contaminated values (e.g.
   `"France (goalkeeping coach)"` leaking into a `current_club` fact).

`TemplateGenerator` is now a composite dispatching across all four, which is
what actually fixes the "every question in a batch is the same shape"
complaint — regenerated content across all 9 sports now mixes all four fact
types per batch, live-verified.

Per-sport stat-key audit (item 2 in the original list) was completed as part
of building the superlative generator — American Football/golf/boxing all have
usable fields, documented in `player-stat-superlative.generator.ts`.

## What remains unsolved, and why

- **Rules/explainer-based questions** — confirmed via research that even
  established platforms (Sporcle) hand-author these; deterministically parsing
  prose into a graded MCQ risks a wrong/ambiguous answer with no reliable
  automated check. Needs an LLM (`AiQuestionProvider`, already stubbed in C2)
  and an explicit API key — user declined to provide one this pass, correctly
  deferred rather than built unsafely.
- **`competition_statistic` (records) stays empty** — genuinely blocked, not
  merely deferred: the table requires `competition_id NOT NULL`, and the
  `person_statistic`/`honour` data available is `career`-scope with no
  competition attribution to honestly attach a record to. Computing one
  would mean fabricating a competition link that isn't true. This is an
  ingestion gap (a real per-competition stats feed would need to populate it),
  not something quiz generation can solve by rearranging existing data.
- **Associate-nation / off-brand distractor noise** (e.g. "Eswatini",
  "Bhutan", "blind cricket team" appearing as World Cup distractors) — found
  during verification, one tier below the two bugs the user explicitly
  reported. Fixing this needs a participant-plausibility signal (an ELO/
  ranking table, or a competition-eligibility whitelist) that doesn't exist
  yet; the competition-key + gender scoping built this pass narrows the pool
  correctly but doesn't rank within it. Flagged as the next refinement, not
  silently left in.
- **Cross-gender mixing in `PlayerStatSuperlativeGenerator`** (tennis/golf
  "most career titles" can mix ATP/WTA or PGA/LPGA players) — same root cause
  as the honour-generator's gender bug, but no team-name-style signal exists
  for individual athletes (no `person.gender` column, and guessing from a
  first name is unreliable enough to make things worse, not better).
  Documented rather than patched with an unsafe heuristic.
