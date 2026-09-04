import type { NewsTopic } from '@sportbrain/contracts';

/**
 * Deterministic topic keyword rules, one maintainable table per the same
 * rationale as `sport-keyword-rules.ts`.
 *
 * `topic` values are restricted to `NewsTopic` (the fixed 17-value taxonomy
 * from `packages/contracts/src/news.ts`) by the type itself, so this table
 * cannot introduce an arbitrary label the AI/keyword layer invents.
 */
export interface TopicKeywordRule {
  topic: NewsTopic;
  phrase: string;
}

export const TOPIC_KEYWORD_RULES: TopicKeywordRule[] = [
  // transfer
  { topic: 'transfer', phrase: 'signs for' },
  { topic: 'transfer', phrase: 'signs a' },
  { topic: 'transfer', phrase: 'completes move' },
  { topic: 'transfer', phrase: 'completes his move' },
  { topic: 'transfer', phrase: 'transfer' },
  { topic: 'transfer', phrase: 'loan move' },
  { topic: 'transfer', phrase: 'on loan' },
  { topic: 'transfer', phrase: 'undisclosed fee' },
  { topic: 'transfer', phrase: 'medical ahead of' },

  // injury
  { topic: 'injury', phrase: 'ruled out' },
  { topic: 'injury', phrase: 'injury' },
  { topic: 'injury', phrase: 'injured' },
  { topic: 'injury', phrase: 'surgery' },
  { topic: 'injury', phrase: 'torn acl' },
  { topic: 'injury', phrase: 'hamstring' },
  { topic: 'injury', phrase: 'sidelined' },
  { topic: 'injury', phrase: 'fitness test' },

  // match-preview
  { topic: 'match-preview', phrase: 'preview' },
  { topic: 'match-preview', phrase: 'how to watch' },
  { topic: 'match-preview', phrase: 'kick-off time' },
  { topic: 'match-preview', phrase: 'kickoff time' },
  { topic: 'match-preview', phrase: 'team news ahead of' },
  { topic: 'match-preview', phrase: 'what time does' },
  { topic: 'match-preview', phrase: 'ahead of tonight' },

  // match-report / result
  { topic: 'match-report', phrase: 'match report' },
  { topic: 'match-report', phrase: 'as it happened' },
  { topic: 'match-report', phrase: 'full-time report' },
  { topic: 'result', phrase: 'wins' },
  { topic: 'result', phrase: 'beat' },
  { topic: 'result', phrase: 'defeats' },
  { topic: 'result', phrase: 'defeated' },
  { topic: 'result', phrase: 'final score' },
  { topic: 'result', phrase: 'draw with' },
  { topic: 'result', phrase: 'held to a draw' },

  // selection
  { topic: 'selection', phrase: 'starting lineup' },
  { topic: 'selection', phrase: 'starting line-up' },
  { topic: 'selection', phrase: 'named in the squad' },
  { topic: 'selection', phrase: 'called up' },
  { topic: 'selection', phrase: 'squad announcement' },
  { topic: 'selection', phrase: 'left out of the squad' },
  { topic: 'selection', phrase: 'starting xi' },

  // contract
  { topic: 'contract', phrase: 'contract extension' },
  { topic: 'contract', phrase: 'signs new deal' },
  { topic: 'contract', phrase: 'signs a new contract' },
  { topic: 'contract', phrase: 'contract talks' },
  { topic: 'contract', phrase: 'extends contract' },

  // rumour
  { topic: 'rumour', phrase: 'linked with a move' },
  { topic: 'rumour', phrase: 'reportedly interested' },
  { topic: 'rumour', phrase: 'transfer rumour' },
  { topic: 'rumour', phrase: 'transfer rumor' },
  { topic: 'rumour', phrase: 'according to sources' },
  { topic: 'rumour', phrase: 'could be set to join' },

  // interview
  { topic: 'interview', phrase: 'speaking to' },
  { topic: 'interview', phrase: 'told reporters' },
  { topic: 'interview', phrase: 'in an exclusive interview' },
  { topic: 'interview', phrase: 'said in an interview' },
  { topic: 'interview', phrase: 'press conference' },

  // analysis
  { topic: 'analysis', phrase: 'tactical analysis' },
  { topic: 'analysis', phrase: 'what went wrong' },
  { topic: 'analysis', phrase: 'explained' },
  { topic: 'analysis', phrase: 'breaking down' },
  { topic: 'analysis', phrase: 'in numbers' },

  // record / milestone
  { topic: 'record', phrase: 'sets a new record' },
  { topic: 'record', phrase: 'breaks the record' },
  { topic: 'record', phrase: 'record-breaking' },
  { topic: 'record', phrase: 'all-time record' },
  { topic: 'milestone', phrase: 'career milestone' },
  { topic: 'milestone', phrase: 'reaches 100' },
  { topic: 'milestone', phrase: 'th appearance' },
  { topic: 'milestone', phrase: 'landmark' },

  // disciplinary
  { topic: 'disciplinary', phrase: 'sent off' },
  { topic: 'disciplinary', phrase: 'red card' },
  { topic: 'disciplinary', phrase: 'banned for' },
  { topic: 'disciplinary', phrase: 'suspended for' },
  { topic: 'disciplinary', phrase: 'fined by' },
  { topic: 'disciplinary', phrase: 'disciplinary hearing' },

  // retirement
  { topic: 'retirement', phrase: 'announces retirement' },
  { topic: 'retirement', phrase: 'retires from' },
  { topic: 'retirement', phrase: 'hangs up' },
  { topic: 'retirement', phrase: 'final match before retiring' },
  { topic: 'retirement', phrase: 'calls time on his career' },
  { topic: 'retirement', phrase: 'calls time on her career' },

  // business
  { topic: 'business', phrase: 'sponsorship deal' },
  { topic: 'business', phrase: 'takeover' },
  { topic: 'business', phrase: 'club sale' },
  { topic: 'business', phrase: 'broadcast rights' },
  { topic: 'business', phrase: 'commercial partnership' },
  { topic: 'business', phrase: 'ipo' },

  // governance
  { topic: 'governance', phrase: 'governing body' },
  { topic: 'governance', phrase: 'rule change' },
  { topic: 'governance', phrase: 'new regulations' },
  { topic: 'governance', phrase: 'disciplinary committee' },
  { topic: 'governance', phrase: 'board of directors' },
  { topic: 'governance', phrase: 'federation announces' },

  // breaking
  { topic: 'breaking', phrase: 'breaking:' },
  { topic: 'breaking', phrase: 'breaking news' },
  { topic: 'breaking', phrase: 'just in:' },
];
