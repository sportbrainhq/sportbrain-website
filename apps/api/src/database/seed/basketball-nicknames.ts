/**
 * Curated nicknames for well-known basketball players.
 *
 * Overrides what the ingest reads from Wikidata's `P1449`, which is a list of
 * every nickname ever applied to a person with no indication of which one people
 * actually use. Wikidata's own ranking mechanism would answer that, and for
 * basketball it is unused: exactly **one** basketball player has a preferred-rank
 * nickname statement, so there is nothing to sort by.
 *
 * The ingest therefore guesses from the string, and on the players a reader is
 * most likely to open it guesses badly. Three kinds of failure, all observed:
 *
 *   - **An obscure nickname beating the famous one.** Magic Johnson holds both
 *     "Magic" and "E.J. the Deejay"; Wilt Chamberlain holds "The Big Dipper",
 *     "Wilt the Stilt" and "The Record Book". Length picked the wrong one each
 *     time, and no rule over the raw strings separates them.
 *   - **An abbreviation or a variant.** Shaquille O'Neal came out as "Shaqqy"
 *     rather than "Shaq".
 *   - **A slur.** Larry Bird's list includes "The Great White Hope", a racially
 *     loaded epithet applied to him by others. It is a matter of record and it is
 *     not what the page should call him.
 *
 * That last one is the reason this file is not optional. A heuristic over
 * community-supplied strings will occasionally surface something offensive, and
 * the fix for the most-viewed players is a list somebody has read.
 *
 * ## Scope
 *
 * Deliberately short. It covers the players whose pages get opened and whose
 * ingested value was wrong, not every player with a nickname: 122 basketball
 * players have one from the ingest and most are right ("The Greek Freak", "The
 * Answer", "The Mailman", "Dr. J"), so overriding them all would be work with no
 * benefit and a new way to be wrong.
 *
 * Keyed by slug rather than name, because a slug is what the page is served at
 * and two people can share a display name.
 *
 * A player mapped to `null` shows no nickname at all. That is for cases where
 * every recorded nickname is unsuitable and none is worth substituting.
 */
export const BASKETBALL_NICKNAMES: Record<string, string | null> = {
  // Holds "Magic" itself, which is how he is universally known.
  'magic-johnson': 'Magic',
  // "The Big Dipper" was his own preference; "Wilt the Stilt" he disliked.
  'wilt-chamberlain': 'The Big Dipper',
  'shaquille-o-neal': 'Shaq',
  // The ingest surfaced a racial epithet. "Larry Legend" is the one used in
  // tribute, and is what the Celtics themselves use.
  'larry-bird': 'Larry Legend',
  // "Dunking Deutschman" is real but rare; this is the one that stuck.
  'dirk-nowitzki': 'Dirkules',
  // "Chuck" is a diminutive; "Sir Charles" is the nickname.
  'charles-barkley': 'Sir Charles',
  // "Splash Brother" is a pair, shared with Klay Thompson, so it reads oddly on
  // one player's page. "Chef Curry" is his own.
  'stephen-curry': 'Chef Curry',
  // "Air Canada Carter" is a mangling of "Air Canada", and "Half Man, Half
  // Amazing" is the one people quote.
  'vince-carter': 'Half Man, Half Amazing',
  // "Jesus" comes from his role in a film, not from basketball.
  'ray-allen': 'Sugar Ray',
  // "Zeke" is real but the page reads better with neither, since his more
  // common identifier is simply the full name.
  'isiah-thomas': null,
  // "Jimmy G. Buckets (the G. stands for Gets)" is a joke recorded verbatim.
  'jimmy-butler': 'Jimmy Buckets',
  // "Mr. Inside" was half of a pairing with Jerry West's "Mr. Outside".
  'elgin-baylor': null,
  // "The Goods" is obscure; his recorded alternative is not clearly better.
  'lamar-odom': null,
  // "Lieutenant Deng" is a fan coinage rather than a recognised nickname.
  'luol-deng': null,
};

/**
 * Former names, added as aliases so historical records resolve to the person.
 *
 * These are not nicknames. They are the name someone competed under before
 * changing it, and the league's own record books still use them: the NBA's MVP
 * list credits the 1971 award to Lew Alcindor, and the Defensive Player of the
 * Year list credits 2004 to Ron Artest. Both rows failed to link to a player
 * page, because the catalogue holds each person only under their current name.
 *
 * Stored as an alias rather than by renaming the person. The current name is the
 * right one for the page heading; the former name only needs to be findable.
 */
export const BASKETBALL_FORMER_NAMES: Record<string, string[]> = {
  // Changed his name in 1971, having won the 1970 Rookie of the Year and the
  // 1971 MVP as Lew Alcindor.
  'kareem-abdul-jabbar': ['Lew Alcindor'],
  // Ron Artest until 2011, then Metta World Peace, then Metta Sandiford-Artest
  // in 2020. All three appear across different articles.
  'metta-sandiford-artest': ['Ron Artest', 'Metta World Peace'],
};
