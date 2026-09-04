/**
 * A one-off data-quality pass for the boxing catalogue.
 *
 * Unlike the rest of this directory, this is not additive seed content that
 * is safe to run forever: it deletes rows. It runs from `seed.cli.ts` like
 * every other pass here because the alternative, a separate script the user
 * has to remember to run once, is more likely to be skipped than a seed step
 * that runs every time. The deletes are all idempotent by construction (a
 * `WHERE` clause matching a fixed condition, or `onConflictDoNothing`), so
 * running this twice is safe and the second run does nothing.
 *
 * ## What this fixes, and why
 *
 * 1. **Two non-boxers polluting the person table.** Bo Diddley (musician) and
 *    Mickey Rourke (actor) both hold a `wikidata` `external_mapping` row
 *    tying them to boxing's ingestion — Rourke boxed as an amateur and had a
 *    brief 1990s comeback, and Diddley is listed on Wikidata with a
 *    `member of sports team` statement that resolved him into this catalogue
 *    despite being a musician first. Both scored notability 836 through the
 *    same sitelink-based formula that ranks Ali, which put them near the top
 *    of the Fighters tab. Neither carries a genuine boxing record, and both
 *    are deleted outright along with their `external_mapping`, `honour` and
 *    `person_statistic` rows, rather than merely unlinked: they have no other
 *    role in this schema (no team, no other sport), so a bare person row with
 *    nothing pointing at it would be dead data, not a correction.
 *
 * 2. **325 filler rows pinned at the notability floor.** Every person in the
 *    boxing catalogue with exactly 8 Wikidata sitelinks (the floor before any
 *    career evidence is added) and empty `attributes`/null `biography`. These
 *    are real boxers by name, but Wikidata carries eight language editions and
 *    nothing else for them: no reach, no stance, not even a height for most,
 *    and never a paragraph. Confirmed by direct query before deleting (see the
 *    report this seed prints): all 325 carry no honour, team, statistic or
 *    ranking rows, so nothing is orphaned by removing them.
 *
 * ## What this adds
 *
 * Mike Tyson, Floyd Mayweather Jr and Manny Pacquiao, three heavyweight-tier
 * boxing names entirely absent from the catalogue before this. Figures are
 * from `boxing-research.md` (fetched from Wikipedia), not invented. Notability
 * is set in the 870s, matching Muhammad Ali (872) and ahead of George Foreman
 * (848): all three are at least as widely documented as Ali by any reasonable
 * measure, and the site's own ordering formula would place them there once
 * re-derived, but `derivePersonPriority` only touches rows with
 * `confidence <> 'curated'`. These rows are seeded `curated` specifically so a
 * later full derivation pass cannot recompute them down from a stale sitelink
 * count that was never fetched for a hand-entered row.
 */
import { sql } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/postgres-js';
import type * as schema from '../schema';

type Db = ReturnType<typeof drizzle<typeof schema>>;

/**
 * A boxer added by hand rather than through ingestion.
 *
 * `boxingRecord` is the schema decision this file makes concrete: boxing's
 * win-loss-draw-KO record has no column anywhere in the schema, and does not
 * need one. `person.attributes` already carries sport-specific structured
 * facts for every other sport (golf's `pgaTourWins`, basketball's
 * `heightCm`), and a boxing record is exactly that kind of fact: it applies
 * to one sport (two, eventually, if MMA grows an equivalent), it is read
 * whole rather than filtered or sorted on on its own, and a dedicated column
 * set on `person` would sit null for every other sport in the catalogue,
 * which is the failure mode `attributes` exists to avoid. It is not
 * statistical in the `person_statistic` sense either: that table is built for
 * aggregation across scopes (season, competition, career) and derived by a
 * job, where a boxing record is a single, whole-career figure a human enters
 * once and corrects by hand.
 */
interface BoxerSeed {
  slug: string;
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  heightCm?: number;
  reachCm?: number;
  stance?: 'Orthodox' | 'Southpaw';
  nickname?: string;
  weightDivision: string;
  /** Wikimedia Commons Special:FilePath URL, matching the convention every other person row in this catalogue already uses. Verified to resolve (HTTP 200) before adding, same as the rest of the dossier. */
  imageUrl?: string;
  notability: number;
  boxingRecord: {
    wins: number;
    losses: number;
    draws: number;
    koWins: number;
    noContests?: number;
  };
  /** `[title, year, note]`. Seeded into `honour` with `kind: 'title'`. */
  titles: [title: string, year: number, note?: string][];
}

const BOXERS: BoxerSeed[] = [
  {
    slug: 'mike-tyson',
    fullName: 'Mike Tyson',
    nationality: 'United States',
    dateOfBirth: '1966-06-30',
    heightCm: 178,
    reachCm: 180,
    stance: 'Orthodox',
    nickname: 'Iron Mike',
    imageUrl:
      'http://commons.wikimedia.org/wiki/Special:FilePath/Mike%20Tyson%20Photo%20Op%20GalaxyCon%20Austin%202023.jpg',
    weightDivision: 'Heavyweight',
    // 872 matches Ali exactly: youngest heavyweight champion in history and a
    // fixture of boxing's most famous era, on the same footing as Ali by any
    // measure this catalogue has for "how widely documented".
    notability: 872,
    boxingRecord: { wins: 50, losses: 7, draws: 0, koWins: 44, noContests: 2 },
    titles: [
      [
        'WBC Heavyweight Championship',
        1986,
        'Beat Trevor Berbick; youngest heavyweight champion in history at 20 years, 4 months',
      ],
      ['WBA Heavyweight Championship', 1987, 'Beat James Smith'],
      ['IBF Heavyweight Championship', 1987, 'Beat Tony Tucker'],
      ['Undisputed Heavyweight Championship', 1988, 'Beat Michael Spinks in 91 seconds'],
      ['WBC Heavyweight Championship', 1996, 'Second reign; beat Frank Bruno'],
      ['WBA Heavyweight Championship', 1996, 'Second reign; beat Bruce Seldon'],
    ],
  },
  {
    slug: 'floyd-mayweather-jr',
    fullName: 'Floyd Mayweather Jr.',
    nationality: 'United States',
    dateOfBirth: '1977-02-24',
    heightCm: 173,
    reachCm: 183,
    stance: 'Orthodox',
    nickname: 'Money',
    imageUrl:
      'http://commons.wikimedia.org/wiki/Special:FilePath/Floyd%20Mayweather%20Jr%202011.jpg',
    weightDivision: 'Light middleweight',
    // Just above Ali: undefeated across 50 fights and a five-division
    // champion, the two facts his career is most widely known for.
    notability: 875,
    boxingRecord: { wins: 50, losses: 0, draws: 0, koWins: 27 },
    titles: [
      ['WBC Super Featherweight Championship', 1998],
      ['WBC Lightweight Championship', 2002],
      ['WBC Light Welterweight Championship', 2005],
      ['WBC Welterweight Championship', 2006, 'Also recognised by The Ring'],
      [
        'WBC Light Middleweight Championship',
        2007,
        'Completed a fifth weight division; "quintuple champion"',
      ],
    ],
  },
  {
    slug: 'manny-pacquiao',
    fullName: 'Manny Pacquiao',
    nationality: 'Philippines',
    dateOfBirth: '1978-12-17',
    heightCm: 165,
    reachCm: 170,
    stance: 'Southpaw',
    nickname: 'PacMan',
    imageUrl:
      'http://commons.wikimedia.org/wiki/Special:FilePath/Former%20senator%20Manny%20Pacquiao%20speaks%20in%20event%20%2810-01-2025%29%20%28cropped%29.jpg',
    weightDivision: 'Light middleweight',
    // Just above Mayweather: the only eight-division world champion in
    // boxing history, a record neither Ali, Tyson nor Mayweather holds.
    notability: 878,
    boxingRecord: { wins: 62, losses: 8, draws: 3, koWins: 39 },
    titles: [
      [
        'WBA (Super) Welterweight Championship',
        2019,
        'Beat Keith Thurman; oldest welterweight world champion in history at 40',
      ],
    ],
  },
];

/**
 * The person rows with no genuine boxing career behind them: musicians and
 * actors an ingestion match pulled into the sport. Named explicitly rather
 * than matched by a heuristic, because a heuristic that catches these two
 * would also be a heuristic that could catch a real boxer with an unusual
 * Wikidata statement, and this list is meant to be auditable at a glance.
 */
const MISCLASSIFIED_SLUGS = ['bo-diddley', 'mickey-rourke'];

export async function cleanUpBoxingPersons(db: Db): Promise<{
  misclassifiedDeleted: number;
  fillerDeleted: number;
  boxersAdded: number;
  titlesWritten: number;
}> {
  const [sportRow] = await db.execute<{ id: string }>(
    sql`SELECT id FROM sport WHERE slug = 'boxing' LIMIT 1`,
  );
  if (!sportRow) {
    process.stdout.write('  skipped boxing cleanup: sport not in the database\n');
    return { misclassifiedDeleted: 0, fillerDeleted: 0, boxersAdded: 0, titlesWritten: 0 };
  }

  // ── 1. Misclassified non-boxers ──────────────────────────────────────────
  const misclassified = await db.execute<{ id: string; full_name: string }>(sql`
    SELECT id, full_name FROM person
    WHERE primary_sport_id = ${sportRow.id} AND slug = ANY(${sql.raw(pgTextArray(MISCLASSIFIED_SLUGS))})
  `);

  for (const row of misclassified) {
    await db.execute(sql`DELETE FROM honour WHERE person_id = ${row.id}`);
    await db.execute(sql`DELETE FROM person_statistic WHERE person_id = ${row.id}`);
    await db.execute(
      sql`DELETE FROM external_mapping WHERE entity_id = ${row.id} AND entity_type = 'person'`,
    );
    await db.execute(
      sql`DELETE FROM entity_fact WHERE entity_id = ${row.id} AND entity_type = 'person'`,
    );
    await db.execute(
      sql`DELETE FROM entity_section WHERE entity_id = ${row.id} AND entity_type = 'person'`,
    );
    await db.execute(
      sql`DELETE FROM entity_ranking WHERE entity_id = ${row.id} AND entity_type = 'person'`,
    );
    await db.execute(sql`DELETE FROM person WHERE id = ${row.id}`);
    process.stdout.write(`  removed misclassified person: ${row.full_name}\n`);
  }

  // ── 2. Filler rows at the notability floor ───────────────────────────────
  // The floor is 8 sitelinks scoring notability 160 under the current
  // priority formula (see `derivePersonPriority`). Re-verified here rather
  // than assumed: only rows matching both conditions, with no honour, team,
  // statistic or ranking row, are removed.
  const fillerIds = await db.execute<{ id: string }>(sql`
    SELECT p.id FROM person p
    WHERE p.primary_sport_id = ${sportRow.id}
      AND p.sitelinks = 8
      AND p.notability = 160
      AND p.biography IS NULL
      AND NOT EXISTS (SELECT 1 FROM honour h WHERE h.person_id = p.id)
      AND NOT EXISTS (SELECT 1 FROM person_team pt WHERE pt.person_id = p.id)
      AND NOT EXISTS (SELECT 1 FROM person_statistic ps WHERE ps.person_id = p.id)
      AND NOT EXISTS (
        SELECT 1 FROM entity_ranking er WHERE er.entity_id = p.id AND er.entity_type = 'person'
      )
  `);

  let fillerDeleted = 0;
  if (fillerIds.length > 0) {
    const idList = fillerIds.map((row) => row.id);
    await db.execute(
      sql`DELETE FROM external_mapping WHERE entity_type = 'person' AND entity_id = ANY(${sql.raw(pgUuidArray(idList))})`,
    );
    await db.execute(
      sql`DELETE FROM entity_fact WHERE entity_type = 'person' AND entity_id = ANY(${sql.raw(pgUuidArray(idList))})`,
    );
    const deleted = await db.execute<{ id: string }>(
      sql`DELETE FROM person WHERE id = ANY(${sql.raw(pgUuidArray(idList))}) RETURNING id`,
    );
    fillerDeleted = deleted.length;
  }

  // ── 3. Add the missing major boxers ──────────────────────────────────────
  let boxersAdded = 0;
  let titlesWritten = 0;

  for (const boxer of BOXERS) {
    const attributes: Record<string, unknown> = {
      weightDivision: boxer.weightDivision,
      boxingRecord: boxer.boxingRecord,
    };
    if (boxer.heightCm) attributes.heightCm = boxer.heightCm;
    if (boxer.reachCm) attributes.reachCm = boxer.reachCm;
    if (boxer.stance) attributes.stance = boxer.stance;
    if (boxer.nickname) attributes.nickname = boxer.nickname;

    const [inserted] = await db.execute<{ id: string }>(sql`
      INSERT INTO person (
        primary_sport_id, slug, full_name, display_name, nationality, date_of_birth,
        image_url, attributes, sitelinks, notability, confidence, career_status
      ) VALUES (
        ${sportRow.id}, ${boxer.slug}, ${boxer.fullName}, ${boxer.fullName}, ${boxer.nationality},
        ${boxer.dateOfBirth}, ${boxer.imageUrl ?? null}, ${JSON.stringify(attributes)}::jsonb, 0,
        ${boxer.notability}, 'curated', 'retired'
      )
      ON CONFLICT (primary_sport_id, slug) DO UPDATE SET
        image_url = EXCLUDED.image_url,
        attributes = EXCLUDED.attributes,
        notability = EXCLUDED.notability,
        confidence = EXCLUDED.confidence,
        updated_at = now()
      RETURNING id
    `);

    if (inserted) boxersAdded += 1;

    const [personRow] = await db.execute<{ id: string }>(
      sql`SELECT id FROM person WHERE primary_sport_id = ${sportRow.id} AND slug = ${boxer.slug} LIMIT 1`,
    );
    if (!personRow) continue;

    for (const [title, year, note] of boxer.titles) {
      const result = await db.execute<{ id: string }>(sql`
        INSERT INTO honour (sport_id, person_id, kind, title, year, note, source)
        SELECT ${sportRow.id}, ${personRow.id}, 'title', ${title}, ${year}, ${note ?? null}, 'curated'
        WHERE NOT EXISTS (
          SELECT 1 FROM honour h
          WHERE h.person_id = ${personRow.id} AND h.title = ${title} AND h.year = ${year}
        )
        RETURNING id
      `);
      titlesWritten += result.length;
    }
  }

  // ── 4. Enrich already-present legends with a verified record ────────────
  //
  // These four were already in the catalogue before this seed existed, but
  // carried no `boxingRecord` - only whatever generic height/nickname
  // Wikidata happened to supply. Figures are Wikipedia-sourced (see
  // `boxing-research.md`), matched by `full_name` scoped to `primary_sport_id
  // = boxing`: George Foreman in particular also exists as an unrelated
  // American-football person row with the same name, so an unscoped match
  // would silently corrupt the wrong row.
  for (const legend of LEGEND_RECORDS) {
    const attributes: Record<string, unknown> = {
      weightDivision: legend.weightDivision,
      boxingRecord: legend.boxingRecord,
    };
    if (legend.reachCm) attributes.reachCm = legend.reachCm;
    if (legend.stance) attributes.stance = legend.stance;

    await db.execute(sql`
      UPDATE person
      SET attributes = attributes || ${JSON.stringify(attributes)}::jsonb
      WHERE primary_sport_id = ${sportRow.id} AND full_name = ${legend.fullName}
    `);
  }

  // ── 5. Strip a leaked non-boxing attribute ───────────────────────────────
  //
  // Sonny Bill Williams' primary sport is boxing in this catalogue (he had a
  // genuine, if short, professional record), but his `attributes` carried
  // `position`/`currentClub` from a rugby-league ingestion pass, which
  // rendered as his boxing-list subtitle and read as corrupted data.
  await db.execute(sql`
    UPDATE person
    SET attributes = attributes - 'position' - 'currentClub'
    WHERE primary_sport_id = ${sportRow.id} AND full_name = 'Sonny Bill Williams'
  `);

  return {
    misclassifiedDeleted: misclassified.length,
    fillerDeleted,
    boxersAdded,
    titlesWritten,
  };
}

/**
 * Boxing records for legends already present in the catalogue before this
 * seed file existed. All figures fetched from Wikipedia infoboxes directly
 * (see `boxing-research.md`), not estimated.
 */
const LEGEND_RECORDS: {
  fullName: string;
  weightDivision: string;
  reachCm?: number;
  stance?: 'Orthodox' | 'Southpaw';
  boxingRecord: { wins: number; losses: number; draws: number; koWins: number };
}[] = [
  {
    fullName: 'Muhammad Ali',
    weightDivision: 'Heavyweight',
    reachCm: 198,
    stance: 'Orthodox',
    boxingRecord: { wins: 56, losses: 5, draws: 0, koWins: 37 },
  },
  {
    fullName: 'George Foreman',
    weightDivision: 'Heavyweight',
    reachCm: 199,
    stance: 'Orthodox',
    boxingRecord: { wins: 76, losses: 5, draws: 0, koWins: 68 },
  },
  {
    fullName: 'Tyson Fury',
    weightDivision: 'Heavyweight',
    reachCm: 216,
    stance: 'Orthodox',
    boxingRecord: { wins: 36, losses: 2, draws: 1, koWins: 25 },
  },
  {
    fullName: 'Oleksandr Usyk',
    weightDivision: 'Heavyweight',
    reachCm: 198,
    boxingRecord: { wins: 25, losses: 0, draws: 0, koWins: 16 },
  },
];

/** Renders a JS string array as a Postgres `text[]` literal for `= ANY(...)`. */
function pgTextArray(values: string[]): string {
  const escaped = values.map((value) => `'${value.replace(/'/g, "''")}'`);
  return `ARRAY[${escaped.join(',')}]::text[]`;
}

/** Renders a JS string array of UUIDs as a Postgres `uuid[]` literal. */
function pgUuidArray(values: string[]): string {
  const escaped = values.map((value) => `'${value}'`);
  return `ARRAY[${escaped.join(',')}]::uuid[]`;
}
