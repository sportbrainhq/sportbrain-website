import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import {
  ProviderError,
  type ProviderCapabilities,
  type ProviderCompetition,
  type ProviderPage,
  type ProviderPerson,
  type ProviderTeam,
  type ProviderVenue,
  type SportsDataProvider,
} from '../provider.types';
import {
  competitionsQuery,
  honoursQuery,
  membershipsQuery,
  teamHonoursQuery,
  peopleQuery,
  teamsByClassQuery,
  teamsByCompetitionQuery,
  venuesQuery,
} from './wikidata.queries';
import {
  clubPeopleQuery,
  clubPlayerTotalsQuery,
  clubProfileQuery,
  competitionAwardsQuery,
  competitionEditionsQuery,
  playerProfileQuery,
} from './wikidata.enrichment';
import { SPORT_SOURCES } from './wikidata.sources';

/** One ingested fact, ready to be written to `entity_fact`. */
export interface ProviderFact {
  key: string;
  label: string;
  value: string;
  category: string;
  order: number;
}

/**
 * Wikidata adapter.
 *
 * Ingested first because it is CC0: no attribution, no share-alike, no
 * restriction on commercial use, storage or redistribution. It is the only
 * source researched whose licence imposes nothing at all, and it covers every
 * sport at once, so the entity layer can be populated across the whole site
 * before any subscription is paid for.
 *
 * What it cannot do is equally important. Wikidata holds entities, honours and
 * biography; it holds no per-match statistics. Statistics pages stay sparse
 * until a paid feed arrives, and no amount of querying changes that.
 */
@Injectable()
export class WikidataProvider implements SportsDataProvider {
  readonly key = 'wikidata';

  readonly capabilities: ProviderCapabilities = {
    people: true,
    teams: true,
    competitions: true,
    venues: true,
    // Wikidata carries occasional individual match items, far too sparsely to
    // build a fixture list from. Declared false so the scheduler never wastes a
    // run asking.
    fixtures: false,
    statistics: false,
    live: false,
  };

  private static readonly ENDPOINT = 'https://query.wikidata.org/sparql';

  /**
   * Wikidata asks for a descriptive User-Agent identifying the operator, and
   * enforces it: requests without one are refused. This is a courtesy to a free
   * public service that the entire entity layer depends on.
   */
  private static readonly USER_AGENT =
    'SportBrainHQ/0.1 (https://sportbrainhq.com; tech@sportbrainhq.com)';

  /**
   * Rows per request.
   *
   * The Query Service enforces a 60-second timeout, and these queries join
   * across several optional properties, so a large page is a query that fails
   * rather than a query that returns more. 200 completes comfortably.
   */
  private static readonly PAGE_SIZE = 200;

  /**
   * Smaller page size for the person query.
   *
   * That query carries nine OPTIONAL joins plus a sitelinks ordering, and at
   * 200 rows it starts returning HTTP 504 from about the third page: the
   * Query Service's 60-second budget is spent sorting a large intermediate
   * result. 100 completes reliably. The cost is twice as many requests for the
   * same number of people, which is a fair trade against a run that dies
   * halfway and has to be resumed.
   */
  private static readonly PERSON_PAGE_SIZE = 100;

  /** Wikidata publishes no hard rate limit; this is self-imposed restraint on a free service. */
  private static readonly MIN_REQUEST_INTERVAL_MS = 1_000;

  private lastRequestAt = 0;

  async fetchTeams(sportSlug: string, cursor?: string): Promise<ProviderPage<ProviderTeam>> {
    const source = this.sourceFor(sportSlug);
    const offset = this.parseCursor(cursor);

    // Clubs and national sides come from different queries: national teams are
    // not league members, so a competition-scoped query cannot reach them.
    const query =
      source.teamClassQid && source.competitionQids.length > 0
        ? teamsByCompetitionQuery(
            source.competitionQids,
            source.teamClassQid,
            WikidataProvider.PAGE_SIZE,
            offset,
          )
        : teamsByClassQuery(
            source.nationalTeamClassQid ?? source.teamClassQid ?? '',
            WikidataProvider.PAGE_SIZE,
            offset,
            source.requireTeamInception ?? false,
          );

    const rows = await this.runQuery(query);

    const items = this.deduplicateByQid(rows).map<ProviderTeam>((row) => ({
      externalId: this.qid(row.item),
      name: row.itemLabel ?? '',
      fields: {
        name: row.itemLabel ?? '',
        shortName: row.shortName,
        country: row.countryLabel,
        foundedYear: this.year(row.inception),
        logoUrl: row.logo,
        kind: source.defaultTeamKind,
      },
    }));

    return this.page(items, offset, rows.length);
  }

  async fetchPeople(sportSlug: string, cursor?: string): Promise<ProviderPage<ProviderPerson>> {
    const source = this.sourceFor(sportSlug);
    const offset = this.parseCursor(cursor);

    const rows = await this.runQuery(
      peopleQuery(
        source.sportQid,
        this.personCompetitions(source),
        WikidataProvider.PERSON_PAGE_SIZE,
        offset,
        source.requireParticipation ?? false,
        source.personOccupationQid,
      ),
    );

    const items = this.deduplicateByQid(rows).map<ProviderPerson>((row) => {
      // Cross-references are the reason this provider goes first: they let a
      // later commercial feed be matched deterministically rather than by name.
      const crossReferences: Record<string, string> = {};
      if (row.transfermarktId) crossReferences.transfermarkt = row.transfermarktId;
      if (row.fifaId) crossReferences.fifa = row.fifaId;
      if (row.espncricinfoId) crossReferences.espncricinfo = row.espncricinfoId;
      if (row.nbaId) crossReferences.nba = row.nbaId;
      if (row.atpId) crossReferences.atp = row.atpId;

      return {
        externalId: this.qid(row.item),
        name: row.itemLabel ?? '',
        crossReferences,
        fields: {
          fullName: row.itemLabel ?? '',
          dateOfBirth: this.date(row.birthDate),
          dateOfDeath: this.date(row.deathDate),
          nationality: row.nationality,
          imageUrl: row.imageUrl,
          // Sport-specific facts land in `person.attributes` rather than
          // becoming columns: position means something different in every
          // sport, and height is absent from most of them.
          attributes: {
            ...(row.position ? { position: row.position } : {}),
            ...(row.currentClub ? { currentClub: row.currentClub } : {}),
            ...(row.heightCm ? { heightCm: Number(row.heightCm) } : {}),
          },
        },
      };
    });

    return this.page(items, offset, rows.length, WikidataProvider.PERSON_PAGE_SIZE);
  }

  async fetchCompetitions(
    sportSlug: string,
    cursor?: string,
  ): Promise<ProviderPage<ProviderCompetition>> {
    const source = this.sourceFor(sportSlug);
    const offset = this.parseCursor(cursor);

    if (!source.competitionClassQid) {
      return { items: [], cursor: null, requestsUsed: 0 };
    }

    const rows = await this.runQuery(
      competitionsQuery(
        source.sportQid,
        source.competitionClassQid,
        WikidataProvider.PAGE_SIZE,
        offset,
      ),
    );

    const items = this.deduplicateByQid(rows).map<ProviderCompetition>((row) => ({
      externalId: this.qid(row.item),
      name: row.itemLabel ?? '',
      fields: {
        name: row.itemLabel ?? '',
        country: row.countryLabel,
        foundedYear: this.year(row.inception),
        logoUrl: row.logo,
      },
    }));

    return this.page(items, offset, rows.length);
  }

  async fetchVenues(sportSlug: string, cursor?: string): Promise<ProviderPage<ProviderVenue>> {
    const source = this.sourceFor(sportSlug);
    const offset = this.parseCursor(cursor);

    if (!source.venueClassQid) {
      return { items: [], cursor: null, requestsUsed: 0 };
    }

    const rows = await this.runQuery(
      venuesQuery(
        source.sportQid,
        source.venueClassQid,
        WikidataProvider.PAGE_SIZE,
        offset,
        source.venueSkipSportFilter ?? false,
      ),
    );

    const items = this.deduplicateByQid(rows).map<ProviderVenue>((row) => ({
      externalId: this.qid(row.item),
      name: row.itemLabel ?? '',
      fields: {
        name: row.itemLabel ?? '',
        city: row.cityLabel,
        country: row.countryLabel,
        capacity: row.capacity ? Number.parseInt(row.capacity, 10) : undefined,
        openedYear: this.year(row.opened),
      },
    }));

    return this.page(items, offset, rows.length);
  }

  /**
   * Honours for a batch of people.
   *
   * Batched rather than per-person because one request covering fifty people is
   * fifty times kinder to a free public endpoint than fifty requests. The batch
   * size is bounded by URL length rather than by any published limit.
   */
  async fetchHonours(
    personQids: readonly string[],
  ): Promise<Map<string, { title: string; year?: number }[]>> {
    if (personQids.length === 0) return new Map();

    const rows = await this.runQuery(honoursQuery(personQids));
    const byPerson = new Map<string, { title: string; year?: number }[]>();

    for (const row of rows) {
      const qid = this.qid(row.item);
      const title = row.awardLabel;
      if (!qid || !title) continue;

      const existing = byPerson.get(qid) ?? [];
      existing.push({ title, year: this.year(row.when) });
      byPerson.set(qid, existing);
    }

    return byPerson;
  }

  /**
   * Titles and awards for a batch of teams.
   *
   * `kind` distinguishes a competition won from an award received, so a club
   * page can separate its trophy cabinet from its ceremonial honours.
   */
  async fetchTeamHonours(
    teamQids: readonly string[],
  ): Promise<Map<string, { title: string; year?: number; kind: string }[]>> {
    if (teamQids.length === 0) return new Map();

    const rows = await this.runQuery(teamHonoursQuery(teamQids));
    const byTeam = new Map<string, { title: string; year?: number; kind: string }[]>();

    for (const row of rows) {
      const qid = this.qid(row.item);
      const title = row.awardLabel;
      if (!qid || !title) continue;

      const existing = byTeam.get(qid) ?? [];
      existing.push({ title, year: this.year(row.when), kind: row.kind ?? 'title' });
      byTeam.set(qid, existing);
    }

    return byTeam;
  }

  /** Club spells for a batch of people, with their start and end dates. */
  async fetchMemberships(
    personQids: readonly string[],
  ): Promise<
    Map<string, { teamExternalId: string; teamName: string; start?: string; end?: string }[]>
  > {
    if (personQids.length === 0) return new Map();

    const rows = await this.runQuery(membershipsQuery(personQids));
    const byPerson = new Map<
      string,
      { teamExternalId: string; teamName: string; start?: string; end?: string }[]
    >();

    for (const row of rows) {
      const qid = this.qid(row.item);
      const teamQid = this.qid(row.team);
      if (!qid || !teamQid || !row.teamLabel) continue;

      const existing = byPerson.get(qid) ?? [];
      existing.push({
        teamExternalId: teamQid,
        teamName: row.teamLabel,
        start: this.date(row.start),
        end: this.date(row.end),
      });
      byPerson.set(qid, existing);
    }

    return byPerson;
  }

  /**
   * Descriptive facts about a club.
   *
   * Returns only what is present. Coverage between clubs varies far more than
   * intuition suggests, so an empty result is a normal outcome rather than a
   * failure.
   */
  async fetchClubProfile(teamQid: string): Promise<ProviderFact[]> {
    const [row] = await this.runQuery(clubProfileQuery(teamQid));
    if (!row) return [];

    const facts: ProviderFact[] = [];
    const add = (
      key: string,
      label: string,
      value: string | undefined,
      category: string,
      order: number,
    ) => {
      if (value) facts.push({ key, label, value, category, order });
    };

    // Nicknames arrive concatenated to avoid row multiplication, and are split
    // back out so each renders as its own fact.
    if (row.nicknames) {
      row.nicknames
        .split(' | ')
        .filter(Boolean)
        .slice(0, 6)
        .forEach((nickname, index) => {
          facts.push({
            key: `nickname_${index}`,
            label: 'Nickname',
            value: nickname,
            category: 'identity',
            order: 10 + index,
          });
        });
    }

    add('motto', 'Motto', row.motto, 'identity', 20);
    add('anthem', 'Anthem', row.anthemLabel, 'identity', 30);
    add('colours', 'Colours', row.colours, 'identity', 40);
    add('mascot', 'Mascot', row.mascotLabel, 'identity', 50);
    add('home_venue', 'Home venue', row.venueLabel, 'venue', 10);
    add(
      'venue_capacity',
      'Capacity',
      row.venueCapacity ? Number(row.venueCapacity).toLocaleString('en-GB') : undefined,
      'venue',
      20,
    );
    add('owner', 'Owner', row.ownerLabel, 'commercial', 10);
    add(
      'members',
      'Members',
      row.members ? Number(row.members).toLocaleString('en-GB') : undefined,
      'commercial',
      20,
    );
    add('website', 'Website', row.websiteUrl, 'commercial', 30);

    return facts;
  }

  /**
   * The current head coach, chairman and captain.
   *
   * Fetched as three separate requests. A single unioned query timed out on
   * almost every club; see the note on `clubPeopleQuery`.
   */
  async fetchClubPeople(teamQid: string): Promise<ProviderFact[]> {
    const roles = [
      { property: 'P286' as const, key: 'head_coach', label: 'Head coach', order: 10 },
      { property: 'P488' as const, key: 'chairman', label: 'Chairman', order: 20 },
      { property: 'P634' as const, key: 'captain', label: 'Captain', order: 30 },
    ];

    const facts: ProviderFact[] = [];

    for (const role of roles) {
      try {
        const [row] = await this.runQuery(clubPeopleQuery(teamQid, role.property));
        if (row?.personLabel) {
          facts.push({
            key: role.key,
            label: role.label,
            value: row.personLabel,
            category: 'people',
            order: role.order,
          });
        }
      } catch {
        // One missing role must not cost the other two. Clubs frequently record
        // a coach and no chairman, and that is not a failure.
      }
    }

    return facts;
  }

  /**
   * Goals and appearances per player, summed across their spells at a club.
   *
   * See the note on `clubPlayerTotalsQuery`: this is partial and contains known
   * errors, and its output is labelled accordingly wherever it is displayed.
   */
  async fetchClubPlayerTotals(
    teamQid: string,
  ): Promise<{ name: string; goals: number; appearances: number }[]> {
    const rows = await this.runQuery(clubPlayerTotalsQuery(teamQid));

    return rows
      .filter((row) => row.playerLabel)
      .map((row) => ({
        name: row.playerLabel!,
        goals: Number(row.totalGoals ?? 0),
        appearances: Number(row.totalApps ?? 0),
      }));
  }

  /** A competition's editions, with winners and hosts. */
  async fetchCompetitionEditions(
    competitionQid: string,
  ): Promise<{ label: string; year?: number; winner?: string; hosts?: string }[]> {
    const rows = await this.runQuery(competitionEditionsQuery(competitionQid));

    return rows
      .filter((row) => row.editionLabel)
      .map((row) => ({
        label: row.editionLabel!,
        // Tournaments carry a point in time; league seasons carry a start date.
        year: this.year(row.when) ?? this.year(row.start),
        winner: row.winnerLabel,
        hosts: row.hosts || undefined,
      }));
  }

  /** Per-edition individual awards: top scorer, best player, best goalkeeper. */
  async fetchCompetitionAwards(
    competitionQid: string,
  ): Promise<{ person: string; criterion?: string; year?: number; value?: number }[]> {
    const rows = await this.runQuery(competitionAwardsQuery(competitionQid));

    return rows
      .filter((row) => row.personLabel)
      .map((row) => ({
        person: row.personLabel!,
        criterion: row.criterionLabel,
        year: this.year(row.when),
        value: row.value ? Number(row.value) : undefined,
      }));
  }

  /** Draft and physical detail for a player. */
  async fetchPlayerProfile(personQid: string): Promise<ProviderFact[]> {
    const [row] = await this.runQuery(playerProfileQuery(personQid));
    if (!row) return [];

    const facts: ProviderFact[] = [];
    const add = (key: string, label: string, value: string | undefined, order: number) => {
      if (value) facts.push({ key, label, value, category: 'profile', order });
    };

    add('drafted_by', 'Drafted by', row.draftTeamLabel, 10);
    add('draft_pick', 'Draft pick', row.draftPick ? `#${row.draftPick}` : undefined, 20);
    add('draft_year', 'Draft year', row.draftYear?.slice(0, 4), 30);
    add('height', 'Height', row.height ? `${Math.round(Number(row.height))} cm` : undefined, 40);
    add('weight', 'Weight', row.mass ? `${Math.round(Number(row.mass))} kg` : undefined, 50);
    add('position', 'Position', row.positionLabel, 60);

    return facts;
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  /**
   * The SPARQL JSON result envelope.
   *
   * Parsed with Zod because a provider response is untrusted input: a shape
   * change should surface as one logged validation failure, not as `undefined`
   * propagating into a database write.
   */
  private static readonly responseSchema = z.object({
    results: z.object({
      bindings: z.array(z.record(z.object({ value: z.string() }).passthrough())),
    }),
  });

  private async runQuery(query: string): Promise<Record<string, string | undefined>[]> {
    await this.throttle();

    let response: Response;
    try {
      response = await fetch(`${WikidataProvider.ENDPOINT}?query=${encodeURIComponent(query)}`, {
        headers: {
          Accept: 'application/sparql-results+json',
          'User-Agent': WikidataProvider.USER_AGENT,
        },
        signal: AbortSignal.timeout(70_000),
      });
    } catch (error) {
      // Network-level failures are worth retrying; a malformed query is not.
      throw new ProviderError(this.key, 'request failed', true, error);
    }

    if (!response.ok) {
      // 429 and 5xx are transient. A 400 means the query itself is wrong, and
      // retrying it wastes a request on a free service without ever succeeding.
      const retryable = response.status === 429 || response.status >= 500;
      throw new ProviderError(
        this.key,
        `HTTP ${response.status} ${response.statusText}`,
        retryable,
      );
    }

    const parsed = WikidataProvider.responseSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new ProviderError(
        this.key,
        `unexpected response shape: ${parsed.error.message}`,
        false,
      );
    }

    // Flatten `{ field: { value } }` into `{ field: value }`, which is the only
    // reshaping this adapter does before its own mapping step.
    return parsed.data.results.bindings.map((binding) =>
      Object.fromEntries(Object.entries(binding).map(([key, cell]) => [key, cell.value])),
    );
  }

  /**
   * Collapses rows that describe the same entity.
   *
   * SPARQL multiplies rows when an entity has several values for any projected
   * property. Verified against the live endpoint: a footballer with two English
   * labels returned twice. Without this, ingestion creates duplicate people.
   */
  private deduplicateByQid(
    rows: Record<string, string | undefined>[],
  ): Record<string, string | undefined>[] {
    const seen = new Map<string, Record<string, string | undefined>>();
    for (const row of rows) {
      const id = row.item;
      if (id && !seen.has(id)) seen.set(id, row);
    }
    return [...seen.values()];
  }

  /** Builds the page envelope, deciding whether more remains from the raw row count. */
  private page<T>(
    items: T[],
    offset: number,
    rawRowCount: number,
    pageSize: number = WikidataProvider.PAGE_SIZE,
  ): ProviderPage<T> {
    const exhausted = rawRowCount < pageSize;
    return {
      items,
      cursor: exhausted ? null : String(offset + pageSize),
      requestsUsed: 1,
    };
  }

  /** Person scoping, which may deliberately differ from team scoping on cost grounds. */
  private personCompetitions(source: {
    competitionQids: readonly string[];
    personCompetitionQids?: readonly string[];
  }): readonly string[] | null {
    const qids = source.personCompetitionQids ?? source.competitionQids;
    return qids.length > 0 ? qids : null;
  }

  private sourceFor(sportSlug: string) {
    const source = SPORT_SOURCES[sportSlug];
    if (!source) {
      throw new ProviderError(this.key, `no Wikidata mapping for sport "${sportSlug}"`, false);
    }
    return source;
  }

  private parseCursor(cursor?: string): number {
    if (!cursor) return 0;
    const offset = Number.parseInt(cursor, 10);
    if (Number.isNaN(offset) || offset < 0) {
      throw new ProviderError(this.key, `invalid cursor "${cursor}"`, false);
    }
    return offset;
  }

  /** `http://www.wikidata.org/entity/Q8682` becomes `Q8682`. */
  private qid(uri: string | undefined): string {
    return uri?.split('/').pop() ?? '';
  }

  /** Wikidata dates are ISO 8601 with a time component we do not want. */
  private date(value: string | undefined): string | undefined {
    return value?.slice(0, 10);
  }

  private year(value: string | undefined): number | undefined {
    if (!value) return undefined;
    const year = Number.parseInt(value.slice(0, 4), 10);
    return Number.isNaN(year) ? undefined : year;
  }

  /**
   * Spaces requests out.
   *
   * The Query Service is free, public, and donated infrastructure. Hammering it
   * is both discourteous and the fastest way to be blocked, taking the entity
   * layer with it.
   */
  private async throttle(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestAt;
    const wait = WikidataProvider.MIN_REQUEST_INTERVAL_MS - elapsed;
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    this.lastRequestAt = Date.now();
  }
}
