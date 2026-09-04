/**
 * Authored sections for flagship entities.
 *
 * These are the parts of an entity page that no data source sells: what a club
 * means, which eras defined it, why a tournament matters. Written rather than
 * derived, and deliberately few. A handful done properly is worth more than a
 * hundred stubs, and the point is to establish the shape so an editor can fill
 * the rest.
 *
 * Keyed by slug, which is stable and public. Anything not listed here simply
 * renders without these sections rather than showing empty headings.
 */

export interface EntitySectionSeed {
  kind: string;
  heading: string;
  body: string;
  order: number;
}

export const TEAM_SECTIONS: Record<string, EntitySectionSeed[]> = {
  'fc-barcelona': [
    {
      kind: 'history',
      heading: 'History',
      order: 10,
      body: `Founded in 1899 by a group of Swiss, English and Catalan footballers led by Joan Gamper, Barcelona grew from a expatriate sports club into an institution that carries a region's identity.

The club's motto, **"Més que un club"** — more than a club — dates from a 1968 speech and refers to its role during the Franco years, when Catalan language and symbols were suppressed and the stadium was one of the few places a crowd could express them openly.

That history explains why the club is member-owned rather than held by an investor. Its president is elected by the socis, and that structure has shaped decisions no privately held club would make.`,
    },
    {
      kind: 'eras',
      heading: 'Defining eras',
      order: 20,
      body: `**The Dream Team (1988–1996).** Johan Cruyff returned as manager and rebuilt the club around positional play and possession. Barcelona won four consecutive league titles and, in 1992, the European Cup the club had never previously held.

**Guardiola's side (2008–2012).** Pep Guardiola, a product of Cruyff's academy, took the same principles further. The 2008-09 team won six trophies in a calendar year, a feat no club had managed. Messi, Xavi and Iniesta were all La Masia graduates.

**The Messi years (2004–2021).** Seventeen seasons, 474 goals for the club, and a period in which Barcelona's fortunes and one player's were difficult to separate. His departure in 2021, forced by the club's finances, closed the era abruptly.`,
    },
    {
      kind: 'culture',
      heading: 'Culture and identity',
      order: 30,
      body: `**La Masia**, the club's academy, is central to how Barcelona sees itself. The 2010 Ballon d'Or shortlist contained three of its graduates, and the belief that a club should produce its own players rather than buy them is treated as a principle rather than a preference.

**El Clásico**, against Real Madrid, is the fixture the season is measured by. The rivalry carries a political dimension that has outlasted the circumstances that created it.

The club played without a shirt sponsor until 2006, and then chose to pay UNICEF rather than be paid, an inversion that says something about how it prefers to be seen.`,
    },
  ],

  'real-madrid-club-de-futbol': [
    {
      kind: 'history',
      heading: 'History',
      order: 10,
      body: `Founded in 1902, Real Madrid received its royal designation from Alfonso XIII in 1920, which is where the crown on the crest and the "Real" in the name come from.

The club's identity is built on European competition. It won the first five European Cups between 1956 and 1960, a run that established both the tournament's prestige and Madrid's association with it, and it has won the competition more times than any other club.`,
    },
    {
      kind: 'eras',
      heading: 'Defining eras',
      order: 20,
      body: `**The first dynasty (1955–1960).** Alfredo Di Stéfano's Madrid won five consecutive European Cups. The 1960 final, a 7–3 win over Eintracht Frankfurt at Hampden Park, is still cited as the match that sold European football to a continent.

**La Quinta del Buitre (1980s).** A generation of five academy graduates won five consecutive Spanish titles, a rare period in which the club's success came from within rather than from signings.

**The Galácticos (2000–2006).** Florentino Pérez signed a world-record player almost every summer: Figo, Zidane, Ronaldo, Beckham. The policy produced Zidane's 2002 volley in the European Cup final and, eventually, a reckoning about squad balance.

**The modern run (2014–present).** Six European titles in a decade, built less on individual signings than on a squad that repeatedly found a way through knockout ties it was not expected to survive.`,
    },
  ],

  'liverpool-f-c': [
    {
      kind: 'history',
      heading: 'History',
      order: 10,
      body: `Liverpool was formed in 1892 after a dispute over rent at Anfield led the existing tenants, Everton, to leave. The club that stayed took the ground and the new name.

Its greatest period began under Bill Shankly, who arrived in 1959 with the club in the second division and left it a European force, and continued under the Boot Room succession of managers promoted from within.`,
    },
    {
      kind: 'culture',
      heading: 'Culture and identity',
      order: 20,
      body: `**"You'll Never Walk Alone"**, adopted from a Rodgers and Hammerstein musical by way of a local band's 1963 recording, is sung before every home match and has been borrowed by clubs across Europe.

**The Kop**, the stand behind one goal, gave its name to terraces at grounds around the country and remains the club's loudest quarter.

**Hillsborough.** Ninety-seven supporters died at an FA Cup semi-final in 1989, and the campaign by families to overturn the false account of that day shaped the club's relationship with its own city for decades. Any account of Liverpool that omits it is incomplete.`,
    },
  ],
};

export const COMPETITION_SECTIONS: Record<string, EntitySectionSeed[]> = {
  'premier-league': [
    {
      kind: 'history',
      heading: 'About the competition',
      order: 10,
      body: `The Premier League was formed in 1992 when the First Division clubs broke away from the Football League to negotiate television rights independently. The football was continuous with what came before; the money was not.

That commercial split is why English league records divide at 1992. A club's "league titles" may count both eras or only the newer one, and the two figures differ.

Twenty clubs play each other home and away, thirty-eight matches, three points for a win. The bottom three are relegated. There are no play-offs at the top: the team with most points wins.`,
    },
  ],
  'ultimate-fighting-championship': [
    {
      kind: 'history',
      heading: 'About the competition',
      order: 10,
      body: `The UFC held its first event on November 12, 1993, in Denver, Colorado, staged by Art Davie, Rorion Gracie and John Milius as an eight-man, single-elimination tournament pitting different martial arts against each other with almost no rules and no weight classes. Royce Gracie, the smallest man in the field, won three of the first four tournaments by submission, and the result made Brazilian jiu-jitsu, until then obscure outside Brazil, a discipline every serious fighter had to learn.

The unregulated early events drew political opposition, most visibly from Senator John McCain, who called it "human cockfighting" and campaigned to have it banned from cable television and state athletic commissions. Weight classes arrived at UFC 12 in 1997, and rounds, judging, mandatory gloves and a lengthening list of banned techniques followed over the next several years, converging on what is now called the Unified Rules of Mixed Martial Arts.

Frank and Lorenzo Fertitta bought the promotion in 2001 through their company Zuffa for a price reported at the time as around two million dollars, rescuing it from near-collapse. The 2005 reality series **The Ultimate Fighter** is widely credited with turning the promotion around commercially. Zuffa sold the UFC to Endeavor (then WME-IMG) in 2016 for a reported 4.2 billion dollars, and Endeavor bought out its remaining partners in 2021. The UFC has been part of TKO Group Holdings, formed by Endeavor's 2023 merger of the promotion with WWE, since that deal closed.

The promotion sanctions eleven weight divisions, eight for men and three for women, each with its own champion.`,
    },
  ],
  'cricket-world-cup': [
    {
      kind: 'history',
      heading: 'About the competition',
      order: 10,
      body: `The ICC ODI Cricket World Cup is cricket's global championship in the fifty-over format, held every four years since 1975. It is organised by the International Cricket Council and is the format's defining tournament: a One Day International career is measured against it the way a Test career is measured against the Ashes.

The first three editions were played in England, over sixty overs a side and in white clothing with a red ball. The tournament has since moved around the game's major nations, settled at fifty overs, and adopted coloured clothing and a white ball.

**Australia have won it six times**, more than twice any other nation. India and the West Indies have won twice each; the West Indies took the first two, and India's 1983 victory is generally credited with shifting the sport's commercial centre to the subcontinent.

The format has varied more than the trophy suggests. Recent editions have used a single round-robin group followed by semi-finals, which guarantees every side nine matches and makes an early upset survivable; earlier ones used group stages feeding a Super Six or Super Eight round. It should not be confused with the **T20 World Cup**, a separate ICC event in the twenty-over format, or with the **World Test Championship**, which is decided over a two-year cycle.`,
    },
  ],
};
