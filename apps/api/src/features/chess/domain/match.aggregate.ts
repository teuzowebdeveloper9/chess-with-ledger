import type { BoardState, MatchStatus, PieceColor } from '@chess-ledger/shared';

export interface MatchAggregate {
  readonly id: string;
  readonly whitePlayerName: string;
  readonly blackPlayerName: string;
  readonly status: MatchStatus;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly durationSeconds?: number;
  readonly winner?: PieceColor;
  readonly movesCount: number;
  readonly boardState: BoardState;
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
