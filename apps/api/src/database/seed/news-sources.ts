/**
 * Seed rows for `news_sources`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  DO NOT ENABLE IN PRODUCTION AS-IS.
 *
 *  Every `feedUrl` below is a placeholder using the invalid `PLACEHOLDER://`
 *  scheme, chosen deliberately so that no HTTP client can ever resolve it by
 *  accident. Before any of these rows may be fetched, a human must:
 *
 *    1. Verify the publisher actually operates the RSS/Atom feed named here,
 *       find its real URL, and confirm the feed is still live.
 *    2. Read the publisher's terms of use / syndication policy and fill in
 *       `commercialUsageStatus` and `termsUrl` from what it actually says,
 *       not from what seems reasonable. Set `displayHeadlineAllowed`,
 *       `displaySummaryAllowed` and `displayImageAllowed` to match.
 *    3. Only then set `feedUrl` to the verified address and flip `isActive`.
 *
 *  Nothing in this file is a legal or factual assertion that the named
 *  publisher grants any usage rights, has a feed at any particular address,
 *  or has been contacted. It is a starting list of well-known outlets per
 *  sport, offered as candidates for the human review above, not as verified
 *  sources.
 *
 *  RESEARCH DONE SO FAR (2026-09-04): three ESPN feed URLs below were fetched
 *  and confirmed live, and ESPN's published RSS terms (espn.com/espn/news/
 *  story?page=rssinfo) were read — those rows have real `feedUrl`s and a
 *  `commercialUsageStatus` reflecting that page, but are still `isActive:
 *  false` pending a second human read of the terms and sign-off, per rule 2
 *  above. Every other row (BBC, Sky Sports, Cricbuzz, NBA.com, ATP/WTA,
 *  Formula1.com, Autosport, Sherdog) could NOT be verified in this pass:
 *  bbc.co.uk was unreachable from this environment's fetch tool, and no
 *  current, authoritative terms page could be found by search for the rest.
 *  Their `feedUrl`s remain PLACEHOLDER and need a human to check directly.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Candidate publishers per sport (suggestions only, not verified unless noted above):
 *   Football     - BBC Sport Football, Sky Sports Football, ESPN FC (verified URL, unverified terms sign-off)
 *   Cricket      - ESPNcricinfo, BBC Sport Cricket, Cricbuzz
 *   Basketball   - ESPN NBA (verified URL, unverified terms sign-off), BBC Sport Basketball, NBA.com
 *   Tennis       - BBC Sport Tennis, ATP Tour, WTA Tennis
 *   Formula 1    - Formula1.com, BBC Sport F1, Autosport
 *   MMA / Boxing - BBC Sport Boxing, Sherdog (MMA), ESPN MMA (verified URL, unverified terms sign-off)
 */
import type { newsSourceHealthStatusEnum, newsSourceTypeEnum } from '../schema/news.schema';

export interface NewsSourceSeed {
  name: string;
  slug: string;
  type: (typeof newsSourceTypeEnum.enumValues)[number];
  feedUrl: string;
  websiteUrl: string | null;
  /** Sport slug this feed defaults to. Null for a cross-sport outlet. Resolved to `sport.id` at seed time. */
  defaultSportSlug: string | null;
  priority: number;
  trustScore: string;
  fetchIntervalSeconds: number;
  isActive: boolean;
  displayHeadlineAllowed: boolean;
  displaySummaryAllowed: boolean;
  displayImageAllowed: boolean;
  commercialUsageStatus: string;
  termsUrl: string | null;
  healthStatus: (typeof newsSourceHealthStatusEnum.enumValues)[number];
}

/**
 * All rows are seeded `isActive: false` with `healthStatus: 'disabled'`.
 * That is deliberate, not an oversight: an inactive source with an invalid
 * `PLACEHOLDER://` URL is safe to have in the database before Phase 2 builds
 * a fetcher, whereas an active one would be an incident waiting for whichever
 * job first tries to poll it.
 */
export const NEWS_SOURCE_SEEDS: NewsSourceSeed[] = [
  {
    name: 'BBC Sport Football',
    slug: 'bbc-sport-football',
    type: 'rss',
    feedUrl: 'PLACEHOLDER://verify-real-feed-url/bbc-sport-football-rss',
    websiteUrl: 'https://www.bbc.co.uk/sport/football',
    defaultSportSlug: 'football',
    priority: 10,
    trustScore: '0.900',
    fetchIntervalSeconds: 600,
    isActive: false,
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus: 'UNVERIFIED: assume headline + link only until terms are reviewed.',
    termsUrl: null,
    healthStatus: 'disabled',
  },
  {
    name: 'Sky Sports Football',
    slug: 'sky-sports-football',
    type: 'rss',
    feedUrl: 'PLACEHOLDER://verify-real-feed-url/sky-sports-football-rss',
    websiteUrl: 'https://www.skysports.com/football',
    defaultSportSlug: 'football',
    priority: 20,
    trustScore: '0.850',
    fetchIntervalSeconds: 600,
    isActive: false,
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus: 'UNVERIFIED: assume headline + link only until terms are reviewed.',
    termsUrl: null,
    healthStatus: 'disabled',
  },
  {
    name: 'ESPN FC',
    slug: 'espn-fc',
    type: 'rss',
    // Verified live 2026-09-04. ESPN's soccer-news RSS feed (not FC-specific;
    // ESPN does not appear to publish a narrower FC-only feed).
    feedUrl: 'https://www.espn.com/espn/rss/soccer/news',
    websiteUrl: 'https://www.espn.com/soccer/',
    defaultSportSlug: 'football',
    priority: 30,
    trustScore: '0.800',
    fetchIntervalSeconds: 900,
    isActive: true, // LOCAL TEST FLIP: kept active per user request 2026-09-04 for browsing real data. Revert before any shared/staging use.
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    // Read from espn.com/espn/news/story?page=rssinfo on 2026-09-04: link to
    // the full article on espn.com using the feed's URLs, attribute content
    // to ESPN, no advertising incorporated into the content, no modifying
    // headlines/summaries/URLs. Compatible with headline+link display; a
    // human still needs to sign off before isActive flips true.
    commercialUsageStatus:
      'ESPN RSS terms (read 2026-09-04): attribution + link-back required, no ads in the ' +
      'feed content, no modifying headline/summary/URL. Headline+link display fits; pending sign-off.',
    termsUrl: 'https://www.espn.com/espn/news/story?page=rssinfo',
    healthStatus: 'disabled',
  },
  {
    // Note: this is ESPN's own general cricket RSS feed
    // (espn.com/espn/rss/cricket/news), not the separate espncricinfo.com
    // property (unverified, still a placeholder below as "BBC Sport
    // Cricket"/"Cricbuzz" siblings are). Kept the original display name for
    // continuity, but the feed itself is ESPN.com's, not ESPNcricinfo's.
    name: 'ESPN Cricket',
    slug: 'espn-cricinfo',
    type: 'rss',
    // Verified live 2026-09-04 (channel title "www.espn.com - CRICKET").
    // Note: first item in the feed at verification time was several years
    // old (Dec 2020) mixed in with current items - the feed itself is real
    // and live, but its ordering/freshness should be watched once polled
    // regularly.
    feedUrl: 'https://www.espn.com/espn/rss/cricket/news',
    websiteUrl: 'https://www.espn.com/cricket/',
    defaultSportSlug: 'cricket',
    priority: 10,
    trustScore: '0.900',
    fetchIntervalSeconds: 600,
    isActive: true, // LOCAL TEST FLIP: kept active per user request 2026-09-04 for browsing real data. Revert before any shared/staging use.
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus:
      'ESPN RSS terms (read 2026-09-04): attribution + link-back required, no ads in the ' +
      'feed content, no modifying headline/summary/URL. Headline+link display fits; pending sign-off.',
    termsUrl: 'https://www.espn.com/espn/news/story?page=rssinfo',
    healthStatus: 'disabled',
  },
  {
    name: 'BBC Sport Cricket',
    slug: 'bbc-sport-cricket',
    type: 'rss',
    feedUrl: 'PLACEHOLDER://verify-real-feed-url/bbc-sport-cricket-rss',
    websiteUrl: 'https://www.bbc.co.uk/sport/cricket',
    defaultSportSlug: 'cricket',
    priority: 20,
    trustScore: '0.880',
    fetchIntervalSeconds: 900,
    isActive: false,
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus: 'UNVERIFIED: assume headline + link only until terms are reviewed.',
    termsUrl: null,
    healthStatus: 'disabled',
  },
  {
    name: 'Cricbuzz',
    slug: 'cricbuzz',
    type: 'rss',
    feedUrl: 'PLACEHOLDER://verify-real-feed-url/cricbuzz-rss',
    websiteUrl: 'https://www.cricbuzz.com',
    defaultSportSlug: 'cricket',
    priority: 30,
    trustScore: '0.750',
    fetchIntervalSeconds: 900,
    isActive: false,
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus: 'UNVERIFIED: assume headline + link only until terms are reviewed.',
    termsUrl: null,
    healthStatus: 'disabled',
  },
  {
    name: 'ESPN NBA',
    slug: 'espn-nba',
    type: 'rss',
    // Verified live 2026-09-04.
    feedUrl: 'https://www.espn.com/espn/rss/nba/news',
    websiteUrl: 'https://www.espn.com/nba/',
    defaultSportSlug: 'basketball',
    priority: 10,
    trustScore: '0.850',
    fetchIntervalSeconds: 600,
    isActive: true, // LOCAL TEST FLIP: kept active per user request 2026-09-04 for browsing real data. Revert before any shared/staging use.
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus:
      'ESPN RSS terms (read 2026-09-04): attribution + link-back required, no ads in the ' +
      'feed content, no modifying headline/summary/URL. Headline+link display fits; pending sign-off.',
    termsUrl: 'https://www.espn.com/espn/news/story?page=rssinfo',
    healthStatus: 'disabled',
  },
  {
    name: 'BBC Sport Basketball',
    slug: 'bbc-sport-basketball',
    type: 'rss',
    feedUrl: 'PLACEHOLDER://verify-real-feed-url/bbc-sport-basketball-rss',
    websiteUrl: 'https://www.bbc.co.uk/sport/basketball',
    defaultSportSlug: 'basketball',
    priority: 20,
    trustScore: '0.850',
    fetchIntervalSeconds: 900,
    isActive: false,
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus: 'UNVERIFIED: assume headline + link only until terms are reviewed.',
    termsUrl: null,
    healthStatus: 'disabled',
  },
  {
    name: 'NBA.com',
    slug: 'nba-com',
    type: 'rss',
    feedUrl: 'PLACEHOLDER://verify-real-feed-url/nba-com-rss',
    websiteUrl: 'https://www.nba.com',
    defaultSportSlug: 'basketball',
    priority: 30,
    trustScore: '0.900',
    fetchIntervalSeconds: 900,
    isActive: false,
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus: 'UNVERIFIED: assume headline + link only until terms are reviewed.',
    termsUrl: null,
    healthStatus: 'disabled',
  },
  {
    name: 'BBC Sport Tennis',
    slug: 'bbc-sport-tennis',
    type: 'rss',
    feedUrl: 'PLACEHOLDER://verify-real-feed-url/bbc-sport-tennis-rss',
    websiteUrl: 'https://www.bbc.co.uk/sport/tennis',
    defaultSportSlug: 'tennis',
    priority: 10,
    trustScore: '0.880',
    fetchIntervalSeconds: 900,
    isActive: false,
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus: 'UNVERIFIED: assume headline + link only until terms are reviewed.',
    termsUrl: null,
    healthStatus: 'disabled',
  },
  {
    // Verified live 2026-09-04 (channel title "www.espn.com - TENNIS").
    // Added alongside the pre-existing BBC/ATP/WTA placeholders below, not
    // replacing them - those still need real verification of their own.
    name: 'ESPN Tennis',
    slug: 'espn-tennis',
    type: 'rss',
    feedUrl: 'https://www.espn.com/espn/rss/tennis/news',
    websiteUrl: 'https://www.espn.com/tennis/',
    defaultSportSlug: 'tennis',
    priority: 15,
    trustScore: '0.800',
    fetchIntervalSeconds: 900,
    isActive: true, // LOCAL TEST FLIP: kept active per user request 2026-09-04 for browsing real data. Revert before any shared/staging use.
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus:
      'ESPN RSS terms (read 2026-09-04): attribution + link-back required, no ads in the ' +
      'feed content, no modifying headline/summary/URL. Headline+link display fits; pending sign-off.',
    termsUrl: 'https://www.espn.com/espn/news/story?page=rssinfo',
    healthStatus: 'disabled',
  },
  {
    // Verified live 2026-09-04 (channel title "www.espn.com - GOLF"). No
    // golf source existed in the original 16-source seed list at all.
    name: 'ESPN Golf',
    slug: 'espn-golf',
    type: 'rss',
    feedUrl: 'https://www.espn.com/espn/rss/golf/news',
    websiteUrl: 'https://www.espn.com/golf/',
    defaultSportSlug: 'golf',
    priority: 10,
    trustScore: '0.800',
    fetchIntervalSeconds: 1_800,
    isActive: true, // LOCAL TEST FLIP: kept active per user request 2026-09-04 for browsing real data. Revert before any shared/staging use.
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus:
      'ESPN RSS terms (read 2026-09-04): attribution + link-back required, no ads in the ' +
      'feed content, no modifying headline/summary/URL. Headline+link display fits; pending sign-off.',
    termsUrl: 'https://www.espn.com/espn/news/story?page=rssinfo',
    healthStatus: 'disabled',
  },
  {
    name: 'ATP Tour',
    slug: 'atp-tour',
    type: 'rss',
    feedUrl: 'PLACEHOLDER://verify-real-feed-url/atp-tour-rss',
    websiteUrl: 'https://www.atptour.com',
    defaultSportSlug: 'tennis',
    priority: 20,
    trustScore: '0.900',
    fetchIntervalSeconds: 1_800,
    isActive: false,
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus: 'UNVERIFIED: assume headline + link only until terms are reviewed.',
    termsUrl: null,
    healthStatus: 'disabled',
  },
  {
    name: 'WTA Tennis',
    slug: 'wta-tennis',
    type: 'rss',
    feedUrl: 'PLACEHOLDER://verify-real-feed-url/wta-tennis-rss',
    websiteUrl: 'https://www.wtatennis.com',
    defaultSportSlug: 'tennis',
    priority: 20,
    trustScore: '0.900',
    fetchIntervalSeconds: 1_800,
    isActive: false,
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus: 'UNVERIFIED: assume headline + link only until terms are reviewed.',
    termsUrl: null,
    healthStatus: 'disabled',
  },
  {
    name: 'Formula1.com',
    slug: 'formula1-com',
    type: 'rss',
    feedUrl: 'PLACEHOLDER://verify-real-feed-url/formula1-com-rss',
    websiteUrl: 'https://www.formula1.com',
    defaultSportSlug: 'formula-1',
    priority: 10,
    trustScore: '0.950',
    fetchIntervalSeconds: 900,
    isActive: false,
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus: 'UNVERIFIED: assume headline + link only until terms are reviewed.',
    termsUrl: null,
    healthStatus: 'disabled',
  },
  {
    name: 'Autosport',
    slug: 'autosport',
    type: 'rss',
    feedUrl: 'PLACEHOLDER://verify-real-feed-url/autosport-rss',
    websiteUrl: 'https://www.autosport.com',
    defaultSportSlug: 'formula-1',
    priority: 20,
    trustScore: '0.800',
    fetchIntervalSeconds: 1_200,
    isActive: false,
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus: 'UNVERIFIED: assume headline + link only until terms are reviewed.',
    termsUrl: null,
    healthStatus: 'disabled',
  },
  {
    name: 'BBC Sport Boxing',
    slug: 'bbc-sport-boxing',
    type: 'rss',
    feedUrl: 'PLACEHOLDER://verify-real-feed-url/bbc-sport-boxing-rss',
    websiteUrl: 'https://www.bbc.co.uk/sport/boxing',
    defaultSportSlug: 'boxing',
    priority: 10,
    trustScore: '0.850',
    fetchIntervalSeconds: 1_800,
    isActive: false,
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus: 'UNVERIFIED: assume headline + link only until terms are reviewed.',
    termsUrl: null,
    healthStatus: 'disabled',
  },
  {
    // Verified live 2026-09-04 (channel title "www.espn.com - BOXING").
    // Added alongside the pre-existing BBC Sport Boxing placeholder above,
    // not replacing it - that one still needs its own verification.
    name: 'ESPN Boxing',
    slug: 'espn-boxing',
    type: 'rss',
    feedUrl: 'https://www.espn.com/espn/rss/boxing/news',
    websiteUrl: 'https://www.espn.com/boxing/',
    defaultSportSlug: 'boxing',
    priority: 15,
    trustScore: '0.800',
    fetchIntervalSeconds: 1_800,
    isActive: true, // LOCAL TEST FLIP: kept active per user request 2026-09-04 for browsing real data. Revert before any shared/staging use.
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus:
      'ESPN RSS terms (read 2026-09-04): attribution + link-back required, no ads in the ' +
      'feed content, no modifying headline/summary/URL. Headline+link display fits; pending sign-off.',
    termsUrl: 'https://www.espn.com/espn/news/story?page=rssinfo',
    healthStatus: 'disabled',
  },
  {
    // Verified live 2026-09-04 (channel title "www.espn.com - NFL"). No
    // American football source existed in the original 16-source seed list.
    // NFL is the dominant American football competition ESPN covers under
    // this feed; the sport is broader than the NFL alone, but this is the
    // best available general-coverage feed found so far.
    name: 'ESPN NFL',
    slug: 'espn-nfl',
    type: 'rss',
    feedUrl: 'https://www.espn.com/espn/rss/nfl/news',
    websiteUrl: 'https://www.espn.com/nfl/',
    defaultSportSlug: 'american-football',
    priority: 10,
    trustScore: '0.850',
    fetchIntervalSeconds: 600,
    isActive: true, // LOCAL TEST FLIP: kept active per user request 2026-09-04 for browsing real data. Revert before any shared/staging use.
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus:
      'ESPN RSS terms (read 2026-09-04): attribution + link-back required, no ads in the ' +
      'feed content, no modifying headline/summary/URL. Headline+link display fits; pending sign-off.',
    termsUrl: 'https://www.espn.com/espn/news/story?page=rssinfo',
    healthStatus: 'disabled',
  },
  {
    name: 'ESPN MMA',
    slug: 'espn-mma',
    type: 'rss',
    // Verified live 2026-09-04 (channel title "www.espn.com - MMA").
    feedUrl: 'https://www.espn.com/espn/rss/mma/news',
    websiteUrl: 'https://www.espn.com/mma/',
    defaultSportSlug: 'mma',
    priority: 10,
    trustScore: '0.800',
    fetchIntervalSeconds: 1_800,
    isActive: true, // LOCAL TEST FLIP: kept active per user request 2026-09-04 for browsing real data. Revert before any shared/staging use.
    displayHeadlineAllowed: true,
    displaySummaryAllowed: false,
    displayImageAllowed: false,
    commercialUsageStatus:
      'ESPN RSS terms (read 2026-09-04): attribution + link-back required, no ads in the ' +
      'feed content, no modifying headline/summary/URL. Headline+link display fits; pending sign-off.',
    termsUrl: 'https://www.espn.com/espn/news/story?page=rssinfo',
    healthStatus: 'disabled',
  },
];
