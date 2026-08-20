/**
 * Hand-entered appearance and goalscoring leaderboards.
 *
 * Ingestion reads these tables from a club or country's Wikipedia records
 * article. Around a hundred notable teams have no such article, or have one
 * that states records only in prose, and no amount of parser work reaches them:
 * Ghana, Egypt, Cameroon and Senegal have no records article at all, Serbia has
 * a list of internationals with no tables in it, and Lazio's article covers team
 * records without ranking a single player.
 *
 * Those teams are filled from here instead. Rows are written with
 * `MANUAL_RANKING_SOURCE` as their `source_title`, which the ingestion upsert
 * refuses to overwrite, so a later crawl cannot replace a curated leaderboard
 * with a worse table it happens to find.
 *
 * ## Rules for adding to this file
 *
 * 1. **Every ranking records where it came from.** A figure with no attribution
 *    is indistinguishable from a guess once it is in the database. Where the
 *    figures were supplied by an editor rather than read from a public page,
 *    say exactly that (`SUPPLIED_BY_EDITOR`) rather than citing a URL nobody
 *    checked.
 * 2. **Omit rather than approximate.** A team whose figures cannot be obtained
 *    is left out; there is a list of those at the foot of this file.
 * 3. `asOf` records when the figures were last true. Active players' totals go
 *    stale, and a stale number presented as current is the failure mode that
 *    matters here.
 * 4. Confidence is `partial`, never `high`. These are compiled figures rather
 *    than a maintained records article, and the UI says so.
 *
 * ## What these figures count
 *
 * Club tables are senior first-team appearances and goals in official
 * competitive matches across all competitions. National tables are senior
 * men's caps and goals. Totals compiled on a different basis are not
 * comparable, which is why the basis is stated rather than assumed.
 *
 * Keyed by team slug, matching the convention in `entity-editorial.ts`.
 */

export interface TeamRankingEntrySeed {
  rank: number;
  name: string;
  value: number;
  /** Career span or club, shown beside the figure where it aids reading. */
  detail?: string;
}

export interface TeamRankingSeed {
  kind: 'most_appearances' | 'top_scorers';
  label: string;
  /** Where the figures came from. Rendered as the table's provenance note. */
  source: string;
  /** ISO date the figures were last verified true. */
  asOf: string;
  entries: TeamRankingEntrySeed[];
}

/**
 * Attribution for figures handed over by an editor rather than read from a page.
 *
 * Named rather than written out at each use so that it reads the same on every
 * table, and so that replacing it with a citation later is one edit. It is
 * deliberately not a URL: inventing a plausible-looking source for a number
 * somebody typed is worse than admitting where it came from, because a reader
 * cannot tell a fabricated citation from a real one.
 */
const SUPPLIED_BY_EDITOR = 'figures supplied by the SportBrainHQ editorial team';

export const TEAM_RANKING_SEEDS: Record<string, TeamRankingSeed[]> = {
  'ss-lazio': [
    {
      kind: 'most_appearances',
      label: 'Most appearances',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Stefan Radu', value: 427 },
        { rank: 2, name: 'Giuseppe Favalli', value: 401 },
        { rank: 3, name: 'Giuseppe Wilson', value: 396 },
        { rank: 4, name: 'Paolo Negro', value: 378 },
        { rank: 5, name: 'Senad Lulic', value: 371 },
        { rank: 6, name: 'Adam Marusic', value: 355 },
        { rank: 7, name: 'Aldo Puccinelli', value: 343 },
        { rank: 8, name: 'Sergej Milinkovic-Savic', value: 341 },
        { rank: 9, name: 'Ciro Immobile', value: 340 },
        { rank: 10, name: 'Luca Marchegiani', value: 339 },
      ],
    },
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Ciro Immobile', value: 207 },
        { rank: 2, name: 'Silvio Piola', value: 159 },
        { rank: 3, name: 'Giuseppe Signori', value: 127 },
        { rank: 4, name: 'Giorgio Chinaglia', value: 124 },
        { rank: 5, name: 'Bruno Giordano', value: 116 },
        { rank: 6, name: 'Tommaso Rocchi', value: 105 },
        { rank: 7, name: 'Aldo Puccinelli', value: 79 },
        { rank: 8, name: 'Sergej Milinkovic-Savic', value: 69 },
        { rank: 9, name: 'Fulvio Bernardini', value: 67 },
        { rank: 10, name: 'Renzo Garlaschelli', value: 67 },
      ],
    },
  ],

  'palermo-f-c': [
    {
      kind: 'most_appearances',
      label: 'Most appearances',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Roberto Biffi', value: 338 },
        { rank: 2, name: 'Enzo Benedetti', value: 282 },
        { rank: 3, name: 'Antonio De Bellis', value: 274 },
        { rank: 4, name: 'Mauro Di Cicco', value: 269 },
        { rank: 5, name: 'Alberto Malavasi', value: 264 },
        { rank: 6, name: 'Valerio Majo', value: 240 },
        { rank: 7, name: 'Franco Landri', value: 234 },
        { rank: 8, name: 'Erminio Favalli', value: 228 },
        { rank: 9, name: 'Ignazio Arcoleo', value: 221 },
        { rank: 10, name: 'Franco Brienza', value: 218 },
      ],
    },
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Fabrizio Miccoli', value: 81 },
        { rank: 2, name: 'Matteo Brunori', value: 76 },
        { rank: 3, name: 'Ghito', value: 53 },
        { rank: 4, name: 'Luca Toni', value: 51 },
        { rank: 5, name: 'Gaetano Troja', value: 48 },
        { rank: 6, name: 'Dante Di Maso', value: 43 },
        { rank: 7, name: 'Silvino Bercellino', value: 42 },
        { rank: 8, name: 'Ilija Nestorovski', value: 39 },
        { rank: 9, name: 'Edinson Cavani', value: 37 },
        { rank: 10, name: 'Massimo De Stefanis', value: 37 },
      ],
    },
  ],

  'atalanta-bc': [
    {
      kind: 'most_appearances',
      label: 'Most appearances',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Marten de Roon', value: 445 },
        { rank: 2, name: 'Gianpaolo Bellini', value: 435 },
        { rank: 3, name: 'Mario Pasalic', value: 344 },
        { rank: 4, name: 'Berat Djimsiti', value: 334 },
        { rank: 5, name: 'Valter Bonacina', value: 327 },
        { rank: 6, name: 'Cristiano Doni', value: 323 },
        { rank: 7, name: 'Stefano Angeleri', value: 322 },
        { rank: 8, name: 'Rafael Toloi', value: 313 },
        { rank: 9, name: 'Livio Roncoli', value: 293 },
        { rank: 10, name: 'Fabrizio Ferron', value: 292 },
      ],
    },
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Cristiano Doni', value: 112 },
        { rank: 2, name: 'Duvan Zapata', value: 82 },
        { rank: 3, name: 'Mario Pasalic', value: 69 },
        { rank: 4, name: 'Luis Muriel', value: 68 },
        { rank: 5, name: 'Josip Ilicic', value: 60 },
        { rank: 6, name: 'Papu Gomez', value: 59 },
        { rank: 7, name: 'Adriano Bassetto', value: 56 },
        { rank: 8, name: 'German Denis', value: 56 },
        { rank: 9, name: 'Ademola Lookman', value: 55 },
        { rank: 10, name: 'Poul Rasmussen', value: 54 },
      ],
    },
  ],

  'genoa-cfc': [
    {
      kind: 'most_appearances',
      label: 'Most appearances',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Gennaro Ruotolo', value: 502 },
        { rank: 2, name: 'Vincenzo Torrente', value: 455 },
        { rank: 3, name: 'Fosco Becattini', value: 435 },
        { rank: 4, name: 'Amedeo Cattani', value: 311 },
        { rank: 5, name: 'Marco Rossi', value: 298 },
        { rank: 6, name: 'Domenico Criscito', value: 291 },
        { rank: 7, name: 'Mario Bortolazzi', value: 290 },
        { rank: 8, name: 'Franco Rivara', value: 263 },
        { rank: 9, name: 'Nicola Caricola', value: 261 },
        { rank: 10, name: 'Claudio Onofri', value: 252 },
      ],
    },
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Edoardo Catto', value: 89 },
        { rank: 2, name: 'Virgilio Levratto', value: 85 },
        { rank: 3, name: 'Cosimo Francioso', value: 77 },
        { rank: 4, name: 'Roberto Pruzzo', value: 68 },
        { rank: 5, name: 'Tomas Skuhravy', value: 67 },
        { rank: 6, name: 'Diego Milito', value: 60 },
        { rank: 7, name: 'Attilio Frizzi', value: 58 },
        { rank: 8, name: 'Giorgio Dal Monte', value: 51 },
        { rank: 9, name: 'Marco Nappi', value: 49 },
        { rank: 10, name: 'Gastone Bean', value: 48 },
      ],
    },
  ],

  'fulham-f-c': [
    {
      kind: 'most_appearances',
      label: 'Most appearances',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Johnny Haynes', value: 658 },
        { rank: 2, name: 'Eddie Lowe', value: 511 },
        { rank: 3, name: 'Les Barrett', value: 491 },
        { rank: 4, name: 'John Marshall', value: 467 },
        { rank: 5, name: 'Frank Penn', value: 459 },
        { rank: 6, name: 'George Cohen', value: 459 },
        { rank: 7, name: 'Gordon Davies', value: 450 },
        { rank: 8, name: 'Arthur Reynolds', value: 446 },
        { rank: 9, name: 'Len Oliver', value: 434 },
        { rank: 10, name: 'Jim Stannard', value: 430 },
      ],
    },
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Gordon Davies', value: 178 },
        { rank: 2, name: 'Johnny Haynes', value: 158 },
        { rank: 3, name: 'Bedford Jezzard', value: 154 },
        { rank: 4, name: 'Jim Hammond', value: 150 },
        { rank: 5, name: 'Graham Leggat', value: 134 },
        { rank: 6, name: 'Arthur Stevens', value: 124 },
        { rank: 7, name: 'Aleksandar Mitrovic', value: 111 },
        { rank: 8, name: 'Steve Earle', value: 108 },
        { rank: 9, name: 'Maurice Cook', value: 97 },
        { rank: 10, name: 'Les Barrett', value: 90 },
      ],
    },
  ],

  'southampton-f-c': [
    {
      kind: 'most_appearances',
      label: 'Most appearances',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Matt Le Tissier', value: 520 },
        { rank: 2, name: 'Jason Dodd', value: 476 },
        { rank: 3, name: 'Mick Channon', value: 449 },
        { rank: 4, name: 'Claus Lundekvam', value: 411 },
        { rank: 5, name: 'James Ward-Prowse', value: 410 },
        { rank: 6, name: 'Terry Paine', value: 387 },
        { rank: 7, name: 'Nick Holmes', value: 375 },
        { rank: 8, name: 'Francis Benali', value: 364 },
        { rank: 9, name: 'Glenn Cockerill', value: 332 },
        { rank: 10, name: 'Matt Oakley', value: 308 },
      ],
    },
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Matt Le Tissier', value: 195 },
        { rank: 2, name: 'Mick Channon', value: 158 },
        { rank: 3, name: 'Ron Davies', value: 145 },
        { rank: 4, name: 'Rickie Lambert', value: 117 },
        { rank: 5, name: 'Steve Moran', value: 87 },
        { rank: 6, name: 'James Beattie', value: 76 },
        { rank: 7, name: 'Danny Wallace', value: 65 },
        { rank: 8, name: 'David Armstrong', value: 61 },
        { rank: 9, name: 'Adam Lallana', value: 60 },
        { rank: 10, name: 'James Ward-Prowse', value: 55 },
      ],
    },
  ],

  'sv-werder-bremen': [
    {
      kind: 'most_appearances',
      label: 'Most appearances',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Dieter Burdenski', value: 581 },
        { rank: 2, name: 'Arnold Schutz', value: 558 },
        { rank: 3, name: 'Dieter Eilts', value: 516 },
        { rank: 4, name: 'Karl-Heinz Kamp', value: 498 },
        { rank: 5, name: 'Marco Bode', value: 495 },
        { rank: 6, name: 'Horst-Dieter Hottges', value: 483 },
        { rank: 7, name: 'Mirko Votava', value: 481 },
        { rank: 8, name: 'Oliver Reck', value: 453 },
        { rank: 9, name: 'Jonny Otten', value: 452 },
        { rank: 10, name: 'Torsten Frings', value: 449 },
      ],
    },
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Arnold Schutz', value: 211 },
        { rank: 2, name: 'Willi Schroder', value: 155 },
        { rank: 3, name: 'Claudio Pizarro', value: 153 },
        { rank: 4, name: 'Karl-Heinz Preusse', value: 148 },
        { rank: 5, name: 'Frank Neubarth', value: 141 },
        { rank: 6, name: 'Marco Bode', value: 134 },
        { rank: 7, name: 'Rudi Voller', value: 119 },
        { rank: 8, name: 'Uwe Reinders', value: 118 },
        { rank: 9, name: 'Norbert Meier', value: 113 },
        { rank: 10, name: 'Ailton', value: 106 },
      ],
    },
  ],

  'fc-zenit-saint-petersburg': [
    {
      kind: 'most_appearances',
      label: 'Most appearances',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Anatoliy Davydov', value: 446 },
        { rank: 2, name: 'Vyacheslav Malafeev', value: 442 },
        { rank: 3, name: 'Lev Burchalkin', value: 423 },
        { rank: 4, name: 'Aleksandr Anyukov', value: 417 },
        { rank: 5, name: 'Aleksandr Kerzhakov', value: 386 },
        { rank: 6, name: 'Vladimir Golubev', value: 384 },
        { rank: 7, name: 'Andrey Arshavin', value: 376 },
        { rank: 8, name: 'Mikhail Biryukov', value: 371 },
        { rank: 9, name: 'Mikhail Lokhov', value: 371 },
        { rank: 10, name: 'Pavel Sadyrin', value: 360 },
      ],
    },
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Aleksandr Kerzhakov', value: 162 },
        { rank: 2, name: 'Artem Dzyuba', value: 108 },
        { rank: 3, name: 'Vladimir Kulik', value: 102 },
        { rank: 4, name: 'Yuriy Zheludkov', value: 87 },
        { rank: 5, name: 'Vladimir Klementjev', value: 84 },
        { rank: 6, name: 'Lev Burchalkin', value: 82 },
        { rank: 7, name: 'Andrey Arshavin', value: 80 },
        { rank: 8, name: 'Vladimir Kazachenok', value: 78 },
        { rank: 9, name: 'Hulk', value: 77 },
        { rank: 10, name: 'Danny', value: 68 },
      ],
    },
  ],

  'udinese-calcio': [
    {
      kind: 'most_appearances',
      label: 'Most appearances',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Antonio Di Natale', value: 445 },
        { rank: 2, name: 'Valerio Bertotto', value: 406 },
        { rank: 3, name: 'Giampiero Pinzi', value: 356 },
        { rank: 4, name: 'Pietro Zampa', value: 329 },
        { rank: 5, name: 'Dino Galparoli', value: 307 },
        { rank: 6, name: 'Alessandro Calori', value: 286 },
        { rank: 7, name: 'Danilo', value: 282 },
        { rank: 8, name: 'Roberto Sensini', value: 265 },
        { rank: 9, name: 'Renato Valenti', value: 247 },
        { rank: 10, name: 'Felipe', value: 235 },
      ],
    },
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Antonio Di Natale', value: 227 },
        { rank: 2, name: 'Lorenzo Bettini', value: 73 },
        { rank: 3, name: 'Abel Balbo', value: 70 },
        { rank: 4, name: 'Vincenzo Iaquinta', value: 69 },
        { rank: 5, name: 'Oliver Bierhoff', value: 62 },
        { rank: 6, name: 'Paolo Poggi', value: 54 },
        { rank: 7, name: 'Giorgio Blasig', value: 52 },
        { rank: 8, name: 'Roberto Sosa', value: 46 },
        { rank: 9, name: 'Roberto Muzzi', value: 45 },
        { rank: 10, name: 'Marcio Amoroso', value: 42 },
      ],
    },
  ],

  'slovenia-men-s-national-football-team': [
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Zlatko Zahovic', value: 36 },
        { rank: 2, name: 'Milivoje Novakovic', value: 32 },
        { rank: 3, name: 'Josip Ilicic', value: 17 },
        { rank: 4, name: 'Saso Udovic', value: 16 },
        { rank: 5, name: 'Primoz Gliha', value: 16 },
        { rank: 6, name: 'Benjamin Sesko', value: 16 },
        { rank: 7, name: 'Ermin Siljak', value: 15 },
        { rank: 8, name: 'Milenko Acimovic', value: 13 },
        { rank: 9, name: 'Andraz Sporar', value: 11 },
        { rank: 10, name: 'Tim Matavz', value: 11 },
      ],
    },
  ],

  'india-men-s-national-football-team': [
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Sunil Chhetri', value: 95 },
        { rank: 2, name: 'I. M. Vijayan', value: 32 },
        { rank: 3, name: 'Bhaichung Bhutia', value: 29 },
        { rank: 4, name: 'Jeje Lalpekhlua', value: 23 },
        { rank: 5, name: 'P. K. Banerjee', value: 16 },
        { rank: 6, name: 'Magan Singh Rajvi', value: 16 },
        { rank: 7, name: 'Chuni Goswami', value: 12 },
        { rank: 8, name: 'Jo Paul Ancheri', value: 11 },
        { rank: 9, name: 'Tulsidas Balaram', value: 11 },
        { rank: 10, name: 'Mohammed Habib', value: 11 },
      ],
    },
  ],

  'blackburn-rovers-f-c': [
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Simon Garner', value: 192 },
        { rank: 2, name: 'Tommy Briggs', value: 143 },
        { rank: 3, name: 'Alan Shearer', value: 130 },
        { rank: 4, name: 'Ted Harper', value: 122 },
        { rank: 5, name: 'Jack Southworth', value: 121 },
        { rank: 6, name: 'Jack Bruton', value: 115 },
        { rank: 6, name: 'Bryan Douglas', value: 115 },
        { rank: 8, name: 'Peter Dobing', value: 104 },
        { rank: 8, name: 'Eddie Latheron', value: 104 },
        { rank: 10, name: 'Andy McEvoy', value: 103 },
      ],
    },
  ],

  'brighton-hove-albion-f-c': [
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Tommy Cook', value: 123 },
        { rank: 2, name: 'Glenn Murray', value: 111 },
        { rank: 3, name: 'Kit Napier', value: 99 },
        { rank: 4, name: 'Bert Stephens', value: 96 },
        { rank: 5, name: 'Peter Ward', value: 95 },
        { rank: 6, name: 'Albert Mundy', value: 90 },
        { rank: 6, name: 'Bobby Zamora', value: 90 },
        { rank: 8, name: 'Bert Longstaff', value: 86 },
        { rank: 9, name: 'Bobby Farrell', value: 84 },
        { rank: 10, name: 'Dan Kirkwood', value: 82 },
      ],
    },
  ],

  'tsg-1899-hoffenheim': [
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Andrej Kramaric', value: 158 },
        { rank: 2, name: 'Sejad Salihovic', value: 67 },
        { rank: 3, name: 'Vedad Ibisevic', value: 54 },
        { rank: 4, name: 'Roberto Firmino', value: 49 },
        { rank: 5, name: 'Thomas Ollhoff', value: 42 },
        { rank: 6, name: 'Demba Ba', value: 40 },
        { rank: 7, name: 'Ihlas Bebou', value: 37 },
        { rank: 8, name: 'Kevin Volland', value: 36 },
        { rank: 9, name: 'Christoph Teinert', value: 34 },
        { rank: 10, name: 'Mark Uth', value: 33 },
      ],
    },
  ],

  'spartak-moscow': [
    {
      kind: 'top_scorers',
      label: 'Top scorers',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Nikita Simonyan', value: 159 },
        { rank: 2, name: 'Sergey Rodionov', value: 154 },
        { rank: 3, name: 'Galimzyan Khusainov', value: 129 },
        { rank: 4, name: 'Fedor Cherenkov', value: 121 },
        { rank: 5, name: 'Yuriy Gavrilov', value: 115 },
        { rank: 6, name: 'Quincy Promes', value: 114 },
        { rank: 7, name: 'Egor Titov', value: 105 },
        { rank: 8, name: 'Andrey Tikhonov', value: 90 },
        { rank: 9, name: 'Roman Pavlyuchenko', value: 89 },
        { rank: 10, name: 'Anatoliy Ilyin', value: 87 },
      ],
    },
  ],

  'fc-twente': [
    {
      kind: 'most_appearances',
      label: 'Most appearances',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Sander Boschker', value: 683 },
        { rank: 2, name: 'Epi Drost', value: 521 },
        { rank: 3, name: 'Theo Pahlplatz', value: 481 },
        { rank: 4, name: 'Kick van der Vall', value: 448 },
        { rank: 5, name: 'Wout Brama', value: 406 },
        { rank: 6, name: 'Jan Jeuring', value: 399 },
        { rank: 7, name: 'Cees van Ierssel', value: 397 },
        { rank: 8, name: 'Andre Karnebeek', value: 365 },
        { rank: 9, name: 'Willem de Vries', value: 353 },
        { rank: 10, name: 'Fred Rutten', value: 350 },
      ],
    },
  ],

  'us-sassuolo-calcio': [
    {
      kind: 'most_appearances',
      label: 'Most appearances',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Francesco Magnanelli', value: 511 },
        { rank: 2, name: 'Domenico Berardi', value: 426 },
        { rank: 3, name: 'Andrea Consigli', value: 372 },
        { rank: 4, name: 'Gaetano Masucci', value: 243 },
        { rank: 5, name: 'Marco Piccioni', value: 232 },
        { rank: 6, name: 'Nicolo Consolini', value: 230 },
        { rank: 7, name: 'Gregoire Defrel', value: 208 },
        { rank: 8, name: 'Alberto Pomini', value: 204 },
        { rank: 9, name: 'Simone Missiroli', value: 202 },
        { rank: 10, name: 'Gian Marco Ferrari', value: 194 },
      ],
    },
  ],

  'club-de-gimnasia-y-esgrima-la-plata': [
    {
      kind: 'most_appearances',
      label: 'Most appearances',
      source: SUPPLIED_BY_EDITOR,
      asOf: '2026-08-20',
      entries: [
        { rank: 1, name: 'Jorge San Esteban', value: 451 },
        { rank: 2, name: 'Guillermo Sanguinetti', value: 393 },
        { rank: 3, name: 'Lucas Licht', value: 356 },
        { rank: 4, name: 'Oscar Montanez', value: 343 },
        { rank: 5, name: 'Rodolfo Smargiassi', value: 332 },
        { rank: 6, name: 'Enzo Noce', value: 317 },
        { rank: 7, name: 'Gabino Arregui', value: 288 },
        { rank: 8, name: 'Hugo Pedraza', value: 257 },
        { rank: 9, name: 'Antonio Rosl', value: 256 },
        { rank: 10, name: 'Hugo Echauri', value: 253 },
      ],
    },
  ],
};

/**
 * Teams still without a leaderboard, and why.
 *
 * Recorded so the next person does not spend an afternoon rediscovering it.
 * Every team here was checked against its own article, its records article and
 * its list of internationals: none carries a ranked list of players in any
 * shape, and several state a single record holder in prose, which is a name
 * rather than a table.
 *
 * These are candidates for a licensed feed or for editorial compilation, not
 * for transcription from an unverifiable page: a ten-row table typed from a
 * forum post is worse than an absent one, because nothing on the page tells a
 * reader which it is.
 */
export const RANKINGS_WITHOUT_A_SOURCE = [
  'yugoslavia-men-s-national-football-team',
  '1-fc-koln',
  'hertha-bsc',
  'watford-f-c',
  'sc-freiburg',
  'norwich-city-f-c',
  'hannover-96',
  'cagliari-calcio',
  'al-nassr',
  'rayo-vallecano',
  'rubin-kazan',
  'fc-lokomotiv-moscow',
  'queens-park-rangers-f-c',
  'hull-city-a-f-c',
  'levante-ud',
  'club-atletico-osasuna',
  'sheffield-united-f-c',
  's-c-braga',
  'getafe-cf',
  'club-brugge-k-v',
  '1-fc-kaiserslautern',
  'malaga-cf',
  'granada-cf',
  'ogc-nice',
  '1-fc-nurnberg',
  '1-fsv-mainz-05',
  'az-alkmaar',
  'fc-nantes',
  'real-valladolid',
  'derby-county-f-c',
  'empoli-fc',
  'trabzonspor',
  'deportivo-alaves',
  'r-c-lens',
  'stade-rennais-f-c',
  'portsmouth-f-c',
  'racing-de-santander',
] as const;
