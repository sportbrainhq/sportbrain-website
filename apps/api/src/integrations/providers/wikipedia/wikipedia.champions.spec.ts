import { describe, expect, it } from 'vitest';
import { parseChampionColumn, parseTournamentFinal } from './wikipedia.parser';

/**
 * The two champion-list shapes that are not the NBA's.
 *
 * Basketball's competitions tabulate their winners three different ways, and
 * these cover the two the NBA parser cannot read. Every fixture is the real
 * structure of its article, reduced to a couple of rows.
 */
describe('parseChampionColumn', () => {
  // The NCAA, the WNBA and the EuroLeague all name the winner in its own
  // column, so no result needs reading.
  const ncaa = `
<table class="wikitable">
  <tr>
    <th>Year</th><th>Champion</th><th>Winning head coach</th><th>Score</th><th>Runner-up</th>
  </tr>
  <tr>
    <td>2025</td>
    <td><a href="./Florida_Gators_men's_basketball">Florida</a></td>
    <td>Todd Golden</td><td>65–63</td><td>Houston</td>
  </tr>
  <tr>
    <td>2026</td>
    <td><a href="./Michigan_Wolverines_men's_basketball">Michigan</a></td>
    <td>Dusty May</td><td>78–71</td><td>Duke</td>
  </tr>
</table>`;

  it('reads the winner from its own column', () => {
    const rows = parseChampionColumn(ncaa, 'champion', 100);
    expect(rows.map((row) => `${row.value} ${row.name}`)).toEqual([
      '2026 Michigan',
      '2025 Florida',
    ]);
  });

  it('reverses the article order so the newest leads', () => {
    expect(parseChampionColumn(ncaa, 'champion', 100)[0]?.value).toBe('2026');
  });

  it('captures the team link', () => {
    expect(parseChampionColumn(ncaa, 'champion', 100)[0]?.link).toBe(
      "Michigan Wolverines men's basketball",
    );
  });

  it('takes the header name it is given', () => {
    // The three articles disagree: "Champion" for the NCAA and the EuroLeague,
    // "Champions" for the WNBA.
    const wnba = `
<table class="wikitable">
  <tr><th>Year</th><th>Champions</th><th>Result</th><th>Runners-up</th></tr>
  <tr>
    <td>2025</td><td><a href="./Las_Vegas_Aces">Las Vegas Aces</a></td>
    <td>3–1</td><td>Phoenix Mercury</td>
  </tr>
</table>`;
    expect(parseChampionColumn(wnba, 'champions', 100)[0]?.name).toBe('Las Vegas Aces');
    // Matched as a prefix, so the singular finds the plural. That is deliberate:
    // the two articles differ only in the "s" and both mean the same column.
    expect(parseChampionColumn(wnba, 'champion', 100)[0]?.name).toBe('Las Vegas Aces');
    // A header the table does not carry finds nothing rather than guessing at a
    // column. ("runners" would match "Runners-up", which is why the absent name
    // used here is one no champions table has.)
    expect(parseChampionColumn(wnba, 'most valuable player', 100)).toEqual([]);
  });

  it('prefers the link that resembles the winner, not the flag beside it', () => {
    // EuroLeague rows open with a nationality icon, so taking the first link
    // published Olympiacos as Greece and Fenerbahçe as Turkey.
    const euroleague = `
<table class="wikitable">
  <tr><th>Season</th><th>Champion</th><th>Runner-up</th></tr>
  <tr>
    <td>2025–26</td>
    <td><a href="./Greece">Greece</a> <a href="./Olympiacos_B.C.">Olympiacos</a></td>
    <td>Real Madrid</td>
  </tr>
</table>`;
    const [row] = parseChampionColumn(euroleague, 'champion', 100);
    expect(row?.name).toBe('Olympiacos');
    expect(row?.link).toBe('Olympiacos B.C.');
  });

  it('dates a season span by its end year', () => {
    const euroleague = `
<table class="wikitable">
  <tr><th>Season</th><th>Champion</th></tr>
  <tr><td>2025–26</td><td><a href="./Olympiacos_B.C.">Olympiacos</a></td></tr>
</table>`;
    expect(parseChampionColumn(euroleague, 'champion', 100)[0]?.value).toBe('2026');
  });

  it('skips a season with no champion', () => {
    // Both the NCAA and the EuroLeague fill the winner column with prose when a
    // tournament did not happen, so 2020 published "Tournament not held due to
    // the COVID-19 pandemic" as though it were a team.
    const cancelled = `
<table class="wikitable">
  <tr><th>Year</th><th>Champion</th></tr>
  <tr><td>2020</td><td>Tournament not held due to the COVID-19 pandemic</td></tr>
  <tr><td>2021</td><td><a href="./Baylor_Bears_men's_basketball">Baylor</a></td></tr>
</table>`;
    expect(parseChampionColumn(cancelled, 'champion', 100).map((row) => row.name)).toEqual([
      'Baylor',
    ]);
  });
});

describe('parseTournamentFinal', () => {
  // FIBA and the Olympics hold the whole result in one cell: champion, score
  // and venue run together, so nothing can be read positionally.
  const fiba = `
<table class="wikitable">
  <tr>
    <th>Edition</th><th>Year</th><th>Hosts</th><th>Final</th>
    <th>Third place game</th><th>Number of teams</th>
  </tr>
  <tr>
    <td>19</td><td>2023</td><td><a href="./Philippines">Philippines</a></td>
    <td>
      <a href="./Germany_men's_national_basketball_team">Germany</a>
      83–77
      <a href="./Mall_of_Asia_Arena">Mall of Asia Arena</a>,
      <a href="./Serbia_men's_national_basketball_team">Serbia</a>
    </td>
    <td>Canada</td><td>32</td>
  </tr>
  <tr>
    <td>20</td><td>2027</td><td><a href="./Qatar">Qatar</a></td>
    <td>Future event<a href="./Lusail_Sports_Arena">Lusail Sports Arena</a></td>
    <td>Future event</td><td>32</td>
  </tr>
</table>`;

  it('takes the champion from the first national-team link in the final cell', () => {
    // The runner-up appears after the score, and the venue links are places.
    const rows = parseTournamentFinal(fiba, 100);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: 'Germany', value: '2023' });
  });

  it('drops the qualifier from the displayed name but keeps it in the link', () => {
    // "Germany men's national basketball team" reads as "Germany" in a roll of
    // honour: the qualifier is the same on every row. The link needs it to
    // resolve against the team catalogue.
    const [row] = parseTournamentFinal(fiba, 100);
    expect(row?.link).toBe("Germany men's national basketball team");
  });

  it('skips a scheduled edition with no result', () => {
    // Both articles list future tournaments, and a row with no winner is not a
    // row. The 2027 edition above is excluded by the assertion of length 1.
    expect(parseTournamentFinal(fiba, 100).map((row) => row.value)).not.toContain('2027');
  });

  it('reads the Olympics spelling of the column', () => {
    // "Final" on FIBA, "Gold medal game" at the Olympics. Listed oldest first,
    // as the article does, and reversed on the way out.
    const olympics = `
<table class="wikitable">
  <tr><th>Year</th><th>Hosts</th><th>Gold medal game</th><th>Bronze medal game</th></tr>
  <tr>
    <td>2016</td><td>Brazil</td>
    <td>
      <a href="./United_States_men's_national_basketball_team">United States</a>
      96–66
      <a href="./Serbia_men's_national_basketball_team">Serbia</a>
    </td>
    <td>Spain</td>
  </tr>
  <tr>
    <td>2020</td><td>Japan</td>
    <td>
      <a href="./United_States_men's_national_basketball_team">United States</a>
      87–82
      <a href="./France_men's_national_basketball_team">France</a>
    </td>
    <td>Australia</td>
  </tr>
  <tr>
    <td>2024</td><td>France</td>
    <td>
      <a href="./United_States_men's_national_basketball_team">United States</a>
      98–87
      <a href="./France_men's_national_basketball_team">France</a>
    </td>
    <td>Serbia</td>
  </tr>
</table>`;
    const rows = parseTournamentFinal(olympics, 100);
    expect(rows.map((row) => row.value)).toEqual(['2024', '2020', '2016']);
    expect(rows[0]?.name).toBe('United States');
  });
});
