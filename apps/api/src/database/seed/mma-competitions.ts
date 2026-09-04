import type { CuratedCompetition } from './football-competitions';

/**
 * The MMA promotions worth showing.
 *
 * Generic ingestion for this sport left 8 competition rows and not one of
 * them was the UFC: the catalogue held the Professional Fighters League, TKO
 * Major League MMA, the Inoki Genome Federation, the Global Fight League, the
 * Kumite 1 League, Ice Cage Fighting, the Prospect Fighting Championships and
 * the Zambian National Amateur League, all at notability 18 or below. The
 * promotion the sport is actually watched through was simply absent, and with
 * it any possibility of a fighter's UFC championship being recorded.
 *
 * This file follows `american-football-competitions.ts` exactly: a short
 * curated list, with everything not named here deleted by
 * `seedCuratedCompetitions`.
 *
 * ## What earns a place
 *
 * The UFC only, by explicit product decision: it is the promotion a reader
 * opening this site means by "MMA", and the only one carrying honour and
 * record data worth showing on a competition page.
 *
 * ## What is deliberately absent
 *
 * Bellator, ONE Championship and the Professional Fighters League were
 * curated in an earlier pass and are real, major promotions, but are cut here
 * to keep the sport's competition list to the one promotion readers actually
 * look up. Pride Fighting Championships and Strikeforce were never curated.
 * Any of these can be re-added in a later pass once there is reason to.
 *
 * ## On `kind`
 *
 * `domestic` in the schema's terms despite fighters from every country
 * competing in it, the same choice basketball and the NBA made:
 * `international` in this schema means a national-team competition, and a
 * promotion is a commercial company signing individual fighters, not a
 * tournament between countries.
 */
export const MMA_CURATED_COMPETITIONS: CuratedCompetition[] = [
  {
    slug: 'ultimate-fighting-championship',
    wikidata: 'Q186471',
    name: 'Ultimate Fighting Championship',
    kind: 'domestic',
    format: 'league',
    country: 'United States',
    tier: 1,
    notability: 100,
    foundedYear: 1993,
  },
];

export const MMA_CURATED_SLUGS: ReadonlySet<string> = new Set(
  MMA_CURATED_COMPETITIONS.map((entry) => entry.slug),
);
