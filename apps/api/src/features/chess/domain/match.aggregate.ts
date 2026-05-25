import type { BoardState, MatchMode, MatchStatus, OnlineMatchState, PieceColor } from '@chess-ledger/shared';

export interface OnlineMatchPrivateState extends OnlineMatchState {
  readonly whitePlayerToken: string;
  readonly blackPlayerToken?: string;
}

export interface MatchAggregate {
  readonly id: string;
  readonly mode: MatchMode;
  readonly whitePlayerName: string;
  readonly blackPlayerName: string;
  readonly status: MatchStatus;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly durationSeconds?: number;
  readonly winner?: PieceColor;
  readonly movesCount: number;
  readonly boardState: BoardState;
  readonly online?: OnlineMatchPrivateState;
}

export interface ScoreboardEntry {
  readonly playerName: string;
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;
  readonly matches: number;
}

export function isFinalStatus(status: MatchStatus): boolean {
  return status !== 'active';
}
