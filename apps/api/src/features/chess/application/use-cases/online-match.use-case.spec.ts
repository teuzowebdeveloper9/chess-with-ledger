import type { LedgerEventView } from '@chess-ledger/shared';

import type { MatchAggregate } from '../../domain/match.aggregate';
import { ChessJsRulesEngine } from '../../infrastructure/rules/chess-js-rules.engine';
import type { LedgerRepository } from '../ports/ledger-repository.port';
import type { MatchRealtimePublisher } from '../ports/match-realtime-publisher.port';
import type { MatchRepository } from '../ports/match-repository.port';
import { CreateOnlineMatchUseCase } from './create-online-match.use-case';
import { JoinOnlineMatchUseCase } from './join-online-match.use-case';

describe('online match use cases', () => {
  it('creates an online room waiting for a second player and appends a ledger event', async () => {
    const engine = new ChessJsRulesEngine();
    let appendedEvents: readonly Omit<LedgerEventView, 'id' | 'matchId' | 'sequence'>[] = [];
    const matches: MatchRepository = {
      create: jest.fn(async (input) => ({
        id: 'match-online-1',
        mode: input.mode,
        whitePlayerName: input.whitePlayerName,
        blackPlayerName: input.blackPlayerName,
        status: input.boardState.status,
        startedAt: input.startedAt,
        movesCount: input.boardState.history.length,
        boardState: input.boardState,
        ...(input.online ? { online: input.online } : {})
      })),
      findById: jest.fn(),
      findByOnlineRoomCode: jest.fn(async () => null),
      save: jest.fn(),
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

    const useCase = new CreateOnlineMatchUseCase(engine, matches, ledger);

    const session = await useCase.execute({ whitePlayerName: 'Ada' });

    expect(session.roomCode).toHaveLength(20);
    expect(session.roomCode.length).toBeLessThanOrEqual(25);
    expect(session.playerColor).toBe('white');
    expect(session.match.mode).toBe('online');
    expect(session.match.online?.hasStarted).toBe(false);
    expect(appendedEvents.map((event) => event.type)).toContain('ONLINE_ROOM_CREATED');
  });

  it('joins the second online player, starts the match, appends ledger events, and publishes realtime state', async () => {
    const engine = new ChessJsRulesEngine();
    const boardState = engine.createInitialState();
    const match: MatchAggregate = {
      id: 'match-online-2',
      mode: 'online',
      whitePlayerName: 'Ada',
      blackPlayerName: 'Aguardando oponente',
      status: 'active',
      startedAt: '2026-05-22T12:00:00.000Z',
      movesCount: 0,
      boardState,
      online: {
        roomCode: 'ABCDEFGHJKLMNPQRSTUV',
        hasStarted: false,
        whitePlayer: {
          id: 'WHITEPLAYERROOMID123456',
          color: 'white',
          name: 'Ada',
          joinedAt: '2026-05-22T12:00:00.000Z'
        },
        whitePlayerToken: 'WHITETOKEN123456789012'
      }
    };
    let savedMatch: MatchAggregate | null = null;
    let appendedEvents: readonly Omit<LedgerEventView, 'id' | 'matchId' | 'sequence'>[] = [];
    const matches: MatchRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOnlineRoomCode: jest.fn(async () => match),
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

    const useCase = new JoinOnlineMatchUseCase(matches, ledger, realtime);

    const session = await useCase.execute({ roomCode: match.online.roomCode, blackPlayerName: 'Grace' });

    expect(session.playerColor).toBe('black');
    expect(session.match.online?.hasStarted).toBe(true);
    expect(session.match.blackPlayerName).toBe('Grace');
    expect(savedMatch?.online?.blackPlayer?.name).toBe('Grace');
    expect(appendedEvents.map((event) => event.type)).toEqual(['ONLINE_PLAYER_JOINED', 'ONLINE_MATCH_STARTED']);
    expect(realtime.publishMatchUpdated).toHaveBeenCalledWith(session.match);
  });
});
