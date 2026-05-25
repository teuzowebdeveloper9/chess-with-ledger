import type { MatchSummary, MatchView, OnlineMatchState } from '@chess-ledger/shared';

import type { MatchAggregate } from '../../domain/match.aggregate';

export function toMatchView(match: MatchAggregate): MatchView {
  return {
    id: match.id,
    mode: match.mode,
    whitePlayerName: match.whitePlayerName,
    blackPlayerName: match.blackPlayerName,
    status: match.status,
    ...(match.winner ? { winner: match.winner } : {}),
    startedAt: match.startedAt,
    ...(match.endedAt ? { endedAt: match.endedAt } : {}),
    ...(match.durationSeconds !== undefined ? { durationSeconds: match.durationSeconds } : {}),
    movesCount: match.movesCount,
    boardState: match.boardState,
    ...(match.online ? { online: toPublicOnlineState(match.online) } : {})
  };
}

export function toMatchSummary(match: MatchAggregate): MatchSummary {
  return {
    id: match.id,
    mode: match.mode,
    whitePlayerName: match.whitePlayerName,
    blackPlayerName: match.blackPlayerName,
    status: match.status,
    ...(match.winner ? { winner: match.winner } : {}),
    startedAt: match.startedAt,
    ...(match.endedAt ? { endedAt: match.endedAt } : {}),
    ...(match.durationSeconds !== undefined ? { durationSeconds: match.durationSeconds } : {}),
    movesCount: match.movesCount,
    ...(match.online
      ? {
          online: {
            roomCode: match.online.roomCode,
            hasStarted: match.online.hasStarted
          }
        }
      : {})
  };
}

function toPublicOnlineState(online: MatchAggregate['online']): OnlineMatchState {
  if (!online) {
    throw new Error('Expected online match state.');
  }

  return {
    roomCode: online.roomCode,
    hasStarted: online.hasStarted,
    whitePlayer: online.whitePlayer,
    ...(online.blackPlayer ? { blackPlayer: online.blackPlayer } : {})
  };
}
