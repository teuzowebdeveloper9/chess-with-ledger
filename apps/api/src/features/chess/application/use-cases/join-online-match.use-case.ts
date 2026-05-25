import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { JoinOnlineMatchRequest, OnlineMatchSession } from '@chess-ledger/shared';

import { OnlineRoomAlreadyStartedError, OnlineRoomNotFoundError } from '../errors/application.error';
import { toMatchView } from '../mappers/match-view.mapper';
import { LEDGER_REPOSITORY, type LedgerRepository } from '../ports/ledger-repository.port';
import {
  MATCH_REALTIME_PUBLISHER,
  type MatchRealtimePublisher
} from '../ports/match-realtime-publisher.port';
import { MATCH_REPOSITORY, type MatchRepository } from '../ports/match-repository.port';

const PLAYER_TOKEN_LENGTH = 24;
const ONLINE_ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class JoinOnlineMatchUseCase {
  constructor(
    @Inject(MATCH_REPOSITORY) private readonly matches: MatchRepository,
    @Inject(LEDGER_REPOSITORY) private readonly ledger: LedgerRepository,
    @Inject(MATCH_REALTIME_PUBLISHER) private readonly realtime: MatchRealtimePublisher
  ) {}

  async execute(input: JoinOnlineMatchRequest): Promise<OnlineMatchSession> {
    const roomCode = input.roomCode.trim().toUpperCase();
    const match = await this.matches.findByOnlineRoomCode(roomCode);
    if (!match || !match.online) {
      throw new OnlineRoomNotFoundError(roomCode);
    }

    if (match.online.hasStarted || match.online.blackPlayer) {
      throw new OnlineRoomAlreadyStartedError(roomCode);
    }

    const joinedAt = new Date().toISOString();
    const blackPlayerName = input.blackPlayerName?.trim() || 'Jogador online 2';
    const blackPlayerToken = createRandomCode(PLAYER_TOKEN_LENGTH);
    const blackPlayer = {
      id: createRandomCode(PLAYER_TOKEN_LENGTH),
      color: 'black' as const,
      name: blackPlayerName,
      joinedAt
    };
    const updatedMatch = await this.matches.save({
      ...match,
      blackPlayerName,
      online: {
        ...match.online,
        hasStarted: true,
        blackPlayer,
        blackPlayerToken
      }
    });

    await this.ledger.append(updatedMatch.id, [
      {
        type: 'ONLINE_PLAYER_JOINED',
        occurredAt: joinedAt,
        actor: 'black',
        message: `${blackPlayerName} entrou na sala online ${roomCode}.`,
        payload: {
          roomCode,
          hasStarted: false,
          blackPlayer
        },
        boardSnapshot: updatedMatch.boardState
      },
      {
        type: 'ONLINE_MATCH_STARTED',
        occurredAt: joinedAt,
        actor: 'system',
        message: `Partida online ${roomCode} iniciou com dois jogadores.`,
        payload: {
          roomCode,
          hasStarted: true,
          whitePlayer: match.online.whitePlayer,
          blackPlayer
        },
        boardSnapshot: updatedMatch.boardState
      }
    ]);

    const matchView = toMatchView(updatedMatch);
    this.realtime.publishMatchUpdated(matchView);

    return {
      match: matchView,
      roomCode,
      playerColor: 'black',
      playerToken: blackPlayerToken
    };
  }
}

function createRandomCode(length: number): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => ONLINE_ROOM_ALPHABET.charAt(byte % ONLINE_ROOM_ALPHABET.length)).join('');
}
