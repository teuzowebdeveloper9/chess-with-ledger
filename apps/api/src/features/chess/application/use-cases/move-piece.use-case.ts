import { Inject, Injectable } from '@nestjs/common';
import type { MatchView, MovePieceRequest } from '@chess-ledger/shared';

import { isFinalStatus, type MatchAggregate } from '../../domain/match.aggregate';
import {
  InvalidOnlinePlayerError,
  MatchAlreadyFinishedError,
  MatchNotFoundError,
  OnlineMatchNotStartedError
} from '../errors/application.error';
import { toMatchView } from '../mappers/match-view.mapper';
import { CHESS_RULES_ENGINE, type ChessRulesEngine } from '../ports/chess-rules-engine.port';
import { LEDGER_REPOSITORY, type LedgerRepository } from '../ports/ledger-repository.port';
import {
  MATCH_REALTIME_PUBLISHER,
  type MatchRealtimePublisher
} from '../ports/match-realtime-publisher.port';
import { MATCH_REPOSITORY, type MatchRepository } from '../ports/match-repository.port';

@Injectable()
export class MovePieceUseCase {
  constructor(
    @Inject(CHESS_RULES_ENGINE) private readonly chessRules: ChessRulesEngine,
    @Inject(MATCH_REPOSITORY) private readonly matches: MatchRepository,
    @Inject(LEDGER_REPOSITORY) private readonly ledger: LedgerRepository,
    @Inject(MATCH_REALTIME_PUBLISHER) private readonly realtime: MatchRealtimePublisher
  ) {}

  async execute(matchId: string, request: MovePieceRequest): Promise<MatchView> {
    const match = await this.matches.findById(matchId);
    if (!match) {
      throw new MatchNotFoundError(matchId);
    }

    if (isFinalStatus(match.status)) {
      throw new MatchAlreadyFinishedError(matchId);
    }

    this.assertCanMoveOnlineMatch(match, request);

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

    const matchView = toMatchView(updatedMatch);
    if (updatedMatch.mode === 'online') {
      this.realtime.publishMatchUpdated(matchView);
    }

    return matchView;
  }

  private assertCanMoveOnlineMatch(match: MatchAggregate, request: MovePieceRequest): void {
    if (match.mode !== 'online') {
      return;
    }

    if (!match.online) {
      throw new InvalidOnlinePlayerError({ matchId: match.id, reason: 'Online match state is missing.' });
    }

    if (!match.online.hasStarted) {
      throw new OnlineMatchNotStartedError(match.id);
    }

    const expectedToken =
      match.boardState.turn === 'white' ? match.online.whitePlayerToken : match.online.blackPlayerToken;

    if (!request.playerToken || request.playerToken !== expectedToken) {
      throw new InvalidOnlinePlayerError({
        matchId: match.id,
        expectedColor: match.boardState.turn
      });
    }
  }
}
