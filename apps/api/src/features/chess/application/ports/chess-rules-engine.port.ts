import type { BoardState, LedgerEventView, MovePieceRequest } from '@chess-ledger/shared';

export interface AppliedMove {
  readonly boardState: BoardState;
  readonly ledgerEvents: readonly Omit<LedgerEventView, 'id' | 'matchId' | 'sequence'>[];
}

export interface ChessRulesEngine {
  readonly createInitialState: () => BoardState;
  readonly applyMove: (currentState: BoardState, request: MovePieceRequest, movedAt: string) => AppliedMove;
}

export const CHESS_RULES_ENGINE = Symbol('CHESS_RULES_ENGINE');
