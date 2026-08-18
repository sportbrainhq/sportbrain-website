import { relations } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';

/**
 * A sport. The root of the navigation and the anchor for everything else.
 *
 * Every other sports-data table reaches a sport, directly or through one hop,
 * because the site is sport-first: the left navigation is a list of sports and
 * each one opens the same seven sections.
 */
export const sport = pgTable(
  'sport',
  {
    id: primaryId(),

    /** URL segment: `football`, `cricket`. Immutable once public; changing it breaks links. */
    slug: text('slug').notNull(),
    name: text('name').notNull(),

    /** Two-letter badge shown in the sidebar (`FB`, `CR`). Stored, not derived: `Formula 1` gives `FO`, not `F1`. */
    shortCode: text('short_code').notNull(),

    /** Sidebar ordering. Sparse values (10, 20, 30) so a sport can be inserted without renumbering. */
    displayOrder: integer('display_order').notNull().default(100),

    /**
     * Whether the sport is reachable on the site.
     *
     * The sidebar shows locked sports greyed out to signal the roadmap, so
     * "exists in the database" and "is browsable" are genuinely different
     * states and one boolean cannot carry both.
     */
    isLaunched: boolean('is_launched').notNull().default(false),

    /**
     * Structural facts that drive rendering without per-sport branching.
     *
     * These answer questions the UI must ask of every sport: does it have teams
     * at all (golf does not), is there a league table (F1 has a championship,
     * not a table), do individuals compete rather than sides. JSONB because the
     * set of questions will grow as sports are added, and each addition would
     * otherwise be a migration across every row.
     *
     * Shape is validated in the application layer, not here. See
     * `packages/contracts`.
     */
    traits: jsonb('traits').notNull().default({}),

    /** Editorial prose for the Overview tab. Human-authored, never overwritten by ingestion. */
    summary: text('summary'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('sport_slug_idx').on(table.slug),
    index('sport_display_order_idx').on(table.displayOrder),
  ],
);

/**
 * A named grouping inside one sport's Teams or Competitions tab.
 *
 * The screenshots group teams into "International teams" and "Club Teams", and
 * competitions into international and domestic. That grouping differs per sport
 * (cricket franchises are not football clubs) and is editorial as much as
 * factual, so it is data rather than a hard-coded enum branch in the API.
 *
 * `team.kind` still carries the machine-readable fact. This table carries the
 * human-facing arrangement: its label, its order, and which sport it belongs to.
 */
export const sportSection = pgTable(
  'sport_section',
  {
    id: primaryId(),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'cascade' }),

    /** Which tab this grouping appears under: `teams` or `competitions`. */
    tab: text('tab').notNull(),

    /** Displayed heading: "International teams", "Club Teams". */
    label: text('label').notNull(),
    slug: text('slug').notNull(),
    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('sport_section_unique_idx').on(table.sportId, table.tab, table.slug),
    index('sport_section_lookup_idx').on(table.sportId, table.tab, table.displayOrder),
  ],
);

/**
 * A division within a sport whose statistics are not comparable with the rest of it.
 *
 * This is the answer to a problem that only appears once a sport is modelled
 * seriously: statistics vary *inside* a sport, not merely between sports.
 *
 *   - Cricket's Test, ODI and T20 give the same player three incompatible
 *     records. A batting average of 50 in Tests and 35 in T20 are different
 *     statistics that happen to share a name, and summing or averaging them
 *     together produces a number that means nothing.
 *   - Football separates outfield from goalkeeping: clean sheets and saves
 *     belong to one discipline, goals and assists to the other.
 *   - Formula 1 separates qualifying from race.
 *   - Athletics separates each event outright.
 *
 * Modelled as a table rather than an enum because the values are per-sport and
 * open-ended: an enum would have to contain every discipline of every sport we
 * ever add, and each new sport would be a migration.
 *
 * A null discipline on a statistics row means "the sport as a whole", which is
 * the correct and common case for football outfield totals or an F1 season.
 */
export const discipline = pgTable(
  'discipline',
  {
    id: primaryId(),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'cascade' }),

    /** Stable key used by ingestion and the statistic registry: `test`, `odi`, `t20`. */
    key: text('key').notNull(),

    /** Displayed as a tab or column group on an entity page: "Test", "ODI", "T20". */
    label: text('label').notNull(),

    /**
     * What kind of division this is: `format` (Test/ODI/T20), `role`
     * (goalkeeper/outfield), `event` (100m/marathon), `phase`
     * (qualifying/race).
     *
     * Drives presentation: formats are usually tabs, roles usually change which
     * statistics are shown at all.
     */
    kind: text('kind').notNull().default('format'),

    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('discipline_unique_idx').on(table.sportId, table.key),
    index('discipline_sport_idx').on(table.sportId, table.displayOrder),
  ],
);

export const sportRelations = relations(sport, ({ many }) => ({
  sections: many(sportSection),
  disciplines: many(discipline),
}));

export const disciplineRelations = relations(discipline, ({ one }) => ({
  sport: one(sport, { fields: [discipline.sportId], references: [sport.id] }),
}));

export const sportSectionRelations = relations(sportSection, ({ one }) => ({
  sport: one(sport, { fields: [sportSection.sportId], references: [sport.id] }),
}));
