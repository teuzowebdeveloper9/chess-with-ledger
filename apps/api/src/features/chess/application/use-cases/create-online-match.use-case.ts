import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { CreateOnlineMatchRequest, OnlineMatchSession } from '@chess-ledger/shared';

import { toMatchView } from '../mappers/match-view.mapper';
import { CHESS_RULES_ENGINE, type ChessRulesEngine } from '../ports/chess-rules-engine.port';
import { LEDGER_REPOSITORY, type LedgerRepository } from '../ports/ledger-repository.port';
import { MATCH_REPOSITORY, type MatchRepository } from '../ports/match-repository.port';

const ROOM_CODE_LENGTH = 20;
const PLAYER_TOKEN_LENGTH = 24;
const ONLINE_ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const WAITING_PLAYER_NAME = 'Aguardando oponente';

@Injectable()
export class CreateOnlineMatchUseCase {
  constructor(
    @Inject(CHESS_RULES_ENGINE) private readonly chessRules: ChessRulesEngine,
    @Inject(MATCH_REPOSITORY) private readonly matches: MatchRepository,
    @Inject(LEDGER_REPOSITORY) private readonly ledger: LedgerRepository
  ) {}

  async execute(input: CreateOnlineMatchRequest): Promise<OnlineMatchSession> {
    const createdAt = new Date().toISOString();
    const whitePlayerName = input.whitePlayerName?.trim() || 'Jogador online 1';
    const roomCode = await this.createUniqueRoomCode();
    const whitePlayerToken = createRandomCode(PLAYER_TOKEN_LENGTH);
    const whitePlayer = {
      id: createRandomCode(PLAYER_TOKEN_LENGTH),
      color: 'white' as const,
      name: whitePlayerName,
      joinedAt: createdAt
    };
    const boardState = this.chessRules.createInitialState();
    const match = await this.matches.create({
      mode: 'online',
      whitePlayerName,
      blackPlayerName: WAITING_PLAYER_NAME,
      boardState,
      startedAt: createdAt,
      online: {
        roomCode,
        hasStarted: false,
        whitePlayer,
        whitePlayerToken
      }
    });

    await this.ledger.append(match.id, [
      {
        type: 'ONLINE_ROOM_CREATED',
        occurredAt: createdAt,
        actor: 'system',
        message: `Sala online ${roomCode} criada por ${whitePlayerName}.`,
        payload: {
          mode: 'online',
          roomCode,
          hasStarted: false,
          whitePlayer
        },
        boardSnapshot: boardState
      }
    ]);

    return {
      match: toMatchView(match),
      roomCode,
      playerColor: 'white',
      playerToken: whitePlayerToken
    };
  }

  private async createUniqueRoomCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const roomCode = createRandomCode(ROOM_CODE_LENGTH);
      const existing = await this.matches.findByOnlineRoomCode(roomCode);
      if (!existing) {
        return roomCode;
      }
    }

    throw new Error('Could not create a unique online room code.');
  }
}

function createRandomCode(length: number): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => ONLINE_ROOM_ALPHABET.charAt(byte % ONLINE_ROOM_ALPHABET.length)).join('');
}
