import { Inject, Injectable } from '@nestjs/common';
import type { MovePieceRequest } from '@chess-ledger/shared';

import { isFinalStatus } from '../../domain/match.aggregate';
import { MatchAlreadyFinishedError, MatchNotFoundError } from '../errors/application.error';
import { CHESS_RULES_ENGINE, type ChessRulesEngine } from '../ports/chess-rules-engine.port';
import { LEDGER_REPOSITORY, type LedgerRepository } from '../ports/ledger-repository.port';
import { MATCH_REPOSITORY, type MatchRepository } from '../ports/match-repository.port';

@Injectable()
export class MovePieceUseCase {
  constructor(
    @Inject(CHESS_RULES_ENGINE) private readonly chessRules: ChessRulesEngine,
    @Inject(MATCH_REPOSITORY) private readonly matches: MatchRepository,
    @Inject(LEDGER_REPOSITORY) private readonly ledger: LedgerRepository
  ) {}

  async execute(matchId: string, request: MovePieceRequest) {
    const match = await this.matches.findById(matchId);
    if (!match) {
      throw new MatchNotFoundError(matchId);
    }

    if (isFinalStatus(match.status)) {
      throw new MatchAlreadyFinishedError(matchId);
    }

    const movedAt = new Date().toISOString();
    const applied = this.chessRules.applyMove(match.boardState, request, movedAt);
    const updatedMatch = await this.matches.save({
      ...match,
      status: applied.boardState.status,
      movesCount: applied.boardState.history.length,
      boardState: applied.boardState,
      ...(applied.boardState.winner ? { winner: applied.boardState.winner } : {}),
      ...(applied.boardState.status !== 'active'
        ? {
            endedAt: movedAt,
            durationSeconds: Math.max(0, Math.floor((Date.parse(movedAt) - Date.parse(match.startedAt)) / 1000))
          }
        : {})
    });

    await this.ledger.append(matchId, applied.ledgerEvents);

    return updatedMatch;
  }
}
