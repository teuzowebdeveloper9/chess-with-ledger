import type { LedgerEventView } from '@chess-ledger/shared';

import type { MatchAggregate } from '../../domain/match.aggregate';
import { ChessJsRulesEngine } from '../../infrastructure/rules/chess-js-rules.engine';
import type { LedgerRepository } from '../ports/ledger-repository.port';
import type { MatchRealtimePublisher } from '../ports/match-realtime-publisher.port';
import type { MatchRepository } from '../ports/match-repository.port';
import { MovePieceUseCase } from './move-piece.use-case';

describe('MovePieceUseCase', () => {
  it('moves a piece, saves the match, and appends immutable ledger events', async () => {
    const engine = new ChessJsRulesEngine();
    const match: MatchAggregate = {
      id: 'match-1',
      mode: 'local',
      whitePlayerName: 'Ada',
      blackPlayerName: 'Grace',
      status: 'active',
      startedAt: '2026-05-21T12:00:00.000Z',
      movesCount: 0,
      boardState: engine.createInitialState()
    };
    let savedMatch: MatchAggregate | null = null;
    let appendedEvents: readonly Omit<LedgerEventView, 'id' | 'matchId' | 'sequence'>[] = [];

    const matches: MatchRepository = {
      create: jest.fn(),
      findById: jest.fn(async () => match),
      findByOnlineRoomCode: jest.fn(),
      save: jest.fn(async (updated) => {
        savedMatch = updated;
        return updated;
      }),
      listRecent: jest.fn(),
      getScoreboard: jest.fn()
    };
    const ledger: LedgerRepository = {
      append: jest.fn(async (_matchId, events) => {
        appendedEvents = events;
        return [];
      }),
      list: jest.fn()
    };
    const realtime: MatchRealtimePublisher = {
      publishMatchUpdated: jest.fn()
    };

    const useCase = new MovePieceUseCase(engine, matches, ledger, realtime);

    const result = await useCase.execute(match.id, { from: 'e2', to: 'e4' });

    expect(result.movesCount).toBe(1);
    expect(savedMatch?.boardState.history[0]?.san).toBe('e4');
    expect(appendedEvents.some((event) => event.type === 'MOVE_RECORDED')).toBe(true);
    expect(appendedEvents.some((event) => event.type === 'SNAPSHOT_RECORDED')).toBe(true);
  });
});
