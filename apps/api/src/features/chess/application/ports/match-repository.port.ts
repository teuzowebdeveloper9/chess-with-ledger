import type { MatchSummary } from '@chess-ledger/shared';

import type { MatchAggregate, ScoreboardEntry } from '../../domain/match.aggregate';

export interface CreateMatchInput {
  readonly mode: MatchAggregate['mode'];
  readonly whitePlayerName: string;
  readonly blackPlayerName: string;
  readonly boardState: MatchAggregate['boardState'];
  readonly startedAt: string;
  readonly online?: MatchAggregate['online'];
}

export interface MatchRepository {
  readonly create: (input: CreateMatchInput) => Promise<MatchAggregate>;
  readonly findById: (id: string) => Promise<MatchAggregate | null>;
  readonly findByOnlineRoomCode: (roomCode: string) => Promise<MatchAggregate | null>;
  readonly save: (match: MatchAggregate) => Promise<MatchAggregate>;
  readonly listRecent: () => Promise<readonly MatchSummary[]>;
  readonly getScoreboard: () => Promise<readonly ScoreboardEntry[]>;
}

export const MATCH_REPOSITORY = Symbol('MATCH_REPOSITORY');
