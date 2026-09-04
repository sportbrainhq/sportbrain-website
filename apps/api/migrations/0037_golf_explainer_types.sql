-- Section and explainer types for the golf library.
--
-- Additive only. Postgres enum values cannot be removed, and nothing here
-- renames or reorders an existing one, so football's, cricket's, basketball's,
-- tennis's and Formula 1's rows are untouched by this migration.
--
-- ## What golf reuses
--
-- Most of the vocabulary already exists, and reusing it is what keeps a filter
-- meaningful across sports. `rule_differences` carries the divergence golf
-- genuinely has: the Rules of Golf are one code, but a professional tour's hard
-- card, a club competition and a casual round apply them differently, and the
-- USGA and R&A publish jointly while the World Handicap System is administered
-- locally. `format_differences` carries stroke play against match play, which is
-- the axis half the sport's concepts split along: a conceded putt exists in one
-- and not the other, and one bad hole is fatal in one and costs a single point
-- in the other.
--
-- The statistics quartet (`what_it_measures`, `how_it_is_calculated`,
-- `how_to_interpret`, `what_it_does_not_tell_you`) carries the statistics,
-- strokes-gained and performance-analysis categories unchanged. The last is
-- load bearing: the brief asks for course-adjusted performance, expected
-- putting and shot-value models, none of which is an official tour statistic,
-- and a page that presents a derived model without saying what it assumes is
-- how a reader ends up quoting it as a fact.
--
-- `advantages` and `risks` transfer from tennis to shot selection and course
-- management, where they are the two halves of every decision the sport is
-- about. `worked_example` carries the handicap arithmetic the brief asks for
-- by name. `the_shot` and `when_players_use_it` carry the shot templates,
-- which are the same shape as a tennis stroke.
--
-- ## What is new
--
-- `the_swing` is the golf analogue of tennis's `the_shot` for the swing
-- mechanics category: what the body and the club are doing, described before it
-- is justified. It is deliberately separate from `the_shot`, because a fade is
-- a shot and the downswing is a phase of the motion that produces it, and one
-- explainer can hold only one section per type.
--
-- `on_the_course` gives the course, design and conditions categories one home
-- for "where this is and what it looks like", which comes before how it plays.
-- Basketball's `where_it_happens` is close but describes an action's location;
-- this describes a feature of the ground itself.
--
-- `the_procedure` already exists from Formula 1 and is exactly right for a drop,
-- a relief procedure and a playoff, so golf adds nothing there.
--
-- `club_selection` is the decision every golf explainer eventually reaches and
-- no existing type expresses: wind, elevation, lie and temperature each end in
-- "so take one more club", and burying that in `how_it_works` loses the one
-- sentence the reader came for.
--
-- `penalty_and_relief` separates what a rule costs and what it permits from the
-- mechanics of the rule itself. Football's `sanctions` is a restart and a card;
-- golf's is a stroke count plus a relief area, which is a different paragraph
-- and needs a different heading.
--
-- `strategic_implications` already exists from Formula 1 and carries course
-- management, so golf adds nothing there either.

ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'the_swing';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'on_the_course';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'club_selection';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'penalty_and_relief';--> statement-breakpoint

-- Explainer types.
--
-- `club` is the one golf cannot do without. A driver is not `equipment` in the
-- tennis sense of a racket: the brief asks for eighteen separate club
-- explainers covering loft, lie, bounce, shaft flex and gapping, and typing all
-- of them as `equipment` would make the fourteen things in the bag
-- indistinguishable from the ball and the glove in a filter.
--
-- `hole` is the golf analogue of tennis's `surface` and F1's `circuit`: the
-- ground is the axis performance is split along, and a par 3, a dogleg and a
-- risk-reward par 5 are concepts a reader looks up by shape.
--
-- `swing_element` separates a phase of the motion (the backswing, impact,
-- swing path) from a `shot`, which is an outcome the player is trying to
-- produce. Both exist in the brief as full categories and they answer
-- different questions.
--
-- `handicap_concept` is its own type because the brief calls the handicap
-- category "very important" and it is neither a rule of play nor a statistic:
-- a Slope Rating is an input to an arithmetic system that decides who wins,
-- and a reader filtering for it is doing the thing the type is for.
--
-- `scoring_term` covers par, birdie, eagle and the rest. They are definitions,
-- but there are enough of them, they are the single most common lookup in the
-- sport, and a beginner filtering for "the words on the leaderboard" should
-- get them without the whole glossary.
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'club';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'hole';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'swing_element';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'handicap_concept';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'scoring_term';
