import type { CompetitionRankingSeed } from './competition-rankings';

/**
 * History prose and champion rolls for the six curated boxing competitions.
 *
 * `boxing-competitions.ts` seeds the six rows themselves; this file fills in
 * the detail those rows otherwise leave empty, following
 * `golf-competition-rankings.ts`'s pattern for a sport ingestion cannot reach.
 *
 * ## `about`
 *
 * Written as encyclopedia-style prose from `boxing-research.md`'s Wikipedia
 * research, not copied verbatim from its terse notes. Every fact stated here
 * traces to that dossier.
 *
 * ## Winners
 *
 * Seeded as `entity_ranking` rows with `kind: 'roll_of_honour'`, the same
 * kind football's competition roll-of-honour tables use, because these are
 * the same shape of fact: a list of notable champions in a sanctioning
 * body's history. `value` carries the year the reign began where the dossier
 * states one, and is null where it does not (the Ring's pound-for-pound
 * reigns, and the two Spinks brothers' Olympic weight classes). Only
 * champions named in the dossier appear; a champion whose exact date is not
 * in it is not included rather than approximated, and the list is
 * deliberately not exhaustive — each is "notable champions", not "every
 * champion", matching what the dossier itself calls out as notable.
 *
 * ## No competition_statistic rows
 *
 * `competition_statistic` is built for genuinely numeric competition facts —
 * attendance, participant counts, records held by a person or team. None of
 * that applies to an abstract sanctioning body: the WBC does not have a
 * "highest attendance" or a "most goals" in the way a league does, and
 * inventing a stat to fill the table (e.g. "number of weight classes") would
 * be a fact nobody asked for rather than a genuine record. Every one of the
 * six competitions is skipped for this table for that reason, deliberately,
 * rather than left empty without explanation.
 */
export const BOXING_COMPETITION_ABOUT: Record<string, string> = {
  'wbc-world-championship': `The World Boxing Council was formed on 14 February 1963 in Mexico City, when representatives of several national boxing commissions met at the invitation of Mexican President Adolfo López Mateos to unify the sport's fractured commissions and manage its growing international expansion. It has since become one of boxing's four major sanctioning bodies, today encompassing 161 member countries. Its heavyweight title has been held by some of the sport's most recognisable champions, including Muhammad Ali, Joe Frazier, Larry Holmes, Mike Tyson, Lennox Lewis, Vitali Klitschko, Tyson Fury and Oleksandr Usyk.`,
  'wba-world-championship': `The World Boxing Association traces its origins to 1921, when it was founded as the National Boxing Association by a group of US state athletic commissions to counterbalance the influence the New York State Athletic Commission held over the sport. It was renamed the World Boxing Association in 1962 as professional boxing globalised beyond the United States. Its heavyweight championship has passed through champions including Lennox Lewis, Floyd Mayweather Jr, Anthony Joshua and Oleksandr Usyk.`,
  'ibf-world-championship': `The International Boxing Federation was founded on 6 November 1983 in Springfield, New Jersey, by Robert W. Lee Sr and other officials who broke away from a World Boxing Association convention held in Puerto Rico. Its first heavyweight champion was Marvin Camel in 1983, with Larry Holmes taking the title the following year. The organisation weathered a serious corruption scandal in the 1990s: its founder was later convicted of racketeering and money laundering, and the IBF operated under federal oversight between 2001 and 2004.`,
  'wbo-world-championship': `The World Boxing Organization was formed in 1988 in San Juan, Puerto Rico, after a group of Puerto Rican and Dominican promoters broke away from a World Boxing Association convention in Isla Margarita, Venezuela, over a dispute about the sanctioning body's rules. Long considered boxing's junior sanctioning body, the WBO gained real prestige through the heavyweight reigns of Wladimir Klitschko in the 2000s and 2010s, and later Anthony Joshua and Oleksandr Usyk. Francesco Damiani was its first heavyweight champion, in 1989.`,
  'the-ring-championship': `The Ring magazine, launched in 1922, began awarding championship belts the same year: the first went to reigning heavyweight champion Jack Dempsey, the second to flyweight champion Pancho Villa. Unlike the sanctioning bodies' titles, a Ring championship carries no sanctioning fee and is intended to recognise boxing's "true" champion of a weight class by editorial criteria rather than commercial affiliation. The championship lapsed for periods over the following decades and was formally reintroduced in April 2002, with Lennox Lewis recognised as heavyweight champion. Roy Jones Jr and Bernard Hopkins are among the fighters who have held Ring titles at middleweight and light heavyweight; Mike Tyson and Manny Pacquiao have each held the magazine's pound-for-pound number-one ranking.`,
  'olympic-boxing': `Boxing has been part of the Summer Olympics since the 1904 Games in St Louis, where the tournament was contested only by North American boxers. It was absent from the 1912 Stockholm Games because Swedish law banned the sport at the time, but has been held at every Olympics since. Women's boxing was added to the programme in 2012, and the Games now stage 14 medal events across seven weight classes for men and seven for women. Professional boxers were permitted to compete for the first time at the 2016 Rio Games; before that, Olympic boxing was strictly an amateur competition. Several Olympic gold medallists went on to become professional world champions, among them Muhammad Ali (as Cassius Clay, light heavyweight gold in 1960), Joe Frazier (heavyweight gold in 1964) and Sugar Ray Leonard (light welterweight gold in 1976).`,
};

export const BOXING_COMPETITION_RANKINGS: Record<string, CompetitionRankingSeed[]> = {
  'wbc-world-championship': [
    {
      kind: 'roll_of_honour',
      label: 'Notable heavyweight champions',
      source: 'https://en.wikipedia.org/wiki/World_Boxing_Council',
      asOf: '2026-09-04',
      caveat:
        'Heavyweight division only; the WBC crowns champions across seventeen weight classes.',
      entries: [
        { rank: 1, name: 'Muhammad Ali', value: null, detail: null },
        { rank: 2, name: 'Joe Frazier', value: null, detail: null },
        { rank: 3, name: 'Larry Holmes', value: null, detail: null },
        { rank: 4, name: 'Mike Tyson', value: 1986, detail: 'First reign began 1986' },
        { rank: 5, name: 'Lennox Lewis', value: null, detail: null },
        { rank: 6, name: 'Vitali Klitschko', value: null, detail: null },
        { rank: 7, name: 'Tyson Fury', value: null, detail: null },
        { rank: 8, name: 'Oleksandr Usyk', value: null, detail: null },
      ],
    },
  ],
  'wba-world-championship': [
    {
      kind: 'roll_of_honour',
      label: 'Notable heavyweight champions',
      source: 'https://en.wikipedia.org/wiki/World_Boxing_Association',
      asOf: '2026-09-04',
      caveat:
        'Heavyweight division only. As of August 2024, BoxRec no longer recognises WBA world title fights or champions.',
      entries: [
        { rank: 1, name: 'Lennox Lewis', value: null, detail: null },
        { rank: 2, name: 'Floyd Mayweather Jr.', value: null, detail: 'Super champion status' },
        { rank: 3, name: 'Anthony Joshua', value: null, detail: null },
        {
          rank: 4,
          name: 'Oleksandr Usyk',
          value: 2023,
          detail: 'Beat Daniel Dubois by knockout, 26 August 2023',
        },
      ],
    },
  ],
  'ibf-world-championship': [
    {
      kind: 'roll_of_honour',
      label: 'Notable heavyweight champions',
      source: 'https://en.wikipedia.org/wiki/International_Boxing_Federation',
      asOf: '2026-09-04',
      caveat: 'Heavyweight division only.',
      entries: [
        { rank: 1, name: 'Marvin Camel', value: 1983, detail: "The IBF's first champion" },
        { rank: 2, name: 'Larry Holmes', value: 1984, detail: null },
      ],
    },
  ],
  'wbo-world-championship': [
    {
      kind: 'roll_of_honour',
      label: 'Notable heavyweight champions',
      source: 'https://en.wikipedia.org/wiki/World_Boxing_Organization',
      asOf: '2026-09-04',
      caveat: 'Heavyweight division only.',
      entries: [
        {
          rank: 1,
          name: 'Francesco Damiani',
          value: 1989,
          detail: "The WBO's first heavyweight champion",
        },
        { rank: 2, name: 'Michael Moorer', value: null, detail: null },
        { rank: 3, name: 'Riddick Bowe', value: null, detail: null },
        { rank: 4, name: 'Wladimir Klitschko', value: null, detail: null },
        { rank: 5, name: 'Anthony Joshua', value: 2016, detail: null },
        { rank: 6, name: 'Oleksandr Usyk', value: 2021, detail: null },
      ],
    },
  ],
  'the-ring-championship': [
    {
      kind: 'roll_of_honour',
      label: 'Notable champions',
      source: 'https://en.wikipedia.org/wiki/The_Ring_(magazine)',
      asOf: '2026-09-04',
      caveat: 'Spans multiple weight classes and eras; not a single continuous division.',
      entries: [
        {
          rank: 1,
          name: 'Jack Dempsey',
          value: 1922,
          detail: 'Heavyweight; the first Ring champion',
        },
        {
          rank: 2,
          name: 'Pancho Villa',
          value: 1922,
          detail: 'Flyweight; the second Ring champion',
        },
        {
          rank: 3,
          name: 'Lennox Lewis',
          value: 2002,
          detail: 'Heavyweight, on the title’s 2002 reintroduction',
        },
        { rank: 4, name: 'Roy Jones Jr.', value: null, detail: 'Multiple weight classes' },
        { rank: 5, name: 'Bernard Hopkins', value: null, detail: 'Middleweight' },
        { rank: 6, name: 'Kostya Tszyu', value: null, detail: 'Junior welterweight' },
      ],
    },
  ],
  'olympic-boxing': [
    {
      kind: 'roll_of_honour',
      label: 'Notable gold medallists who became professional champions',
      source: 'https://en.wikipedia.org/wiki/Boxing_at_the_Summer_Olympics',
      asOf: '2026-09-04',
      entries: [
        {
          rank: 1,
          name: 'Muhammad Ali',
          value: 1960,
          detail: 'Light heavyweight gold, Rome, as Cassius Clay',
        },
        { rank: 2, name: 'Joe Frazier', value: 1964, detail: 'Heavyweight gold, Tokyo' },
        {
          rank: 3,
          name: 'Sugar Ray Leonard',
          value: 1976,
          detail: 'Light welterweight gold, Montreal',
        },
        {
          rank: 4,
          name: 'Michael Spinks',
          value: 1976,
          detail: 'Gold, Montreal; weight class not specified in source',
        },
        {
          rank: 5,
          name: 'Leon Spinks',
          value: 1976,
          detail: 'Gold, Montreal; weight class not specified in source',
        },
      ],
    },
  ],
};
