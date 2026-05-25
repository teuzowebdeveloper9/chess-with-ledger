import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import type { BoardState, MatchMode, MatchStatus, MatchSummary, PieceColor } from '@chess-ledger/shared';

import { AppConfigService } from '../../../../infrastructure/config/app-config.service';
import type { MatchAggregate, ScoreboardEntry } from '../../domain/match.aggregate';
import type { CreateMatchInput, MatchRepository } from '../../application/ports/match-repository.port';

interface MatchRow {
  readonly id: string;
  readonly mode: MatchMode;
  readonly white_player_name: string;
  readonly black_player_name: string;
  readonly status: MatchStatus;
  readonly winner: PieceColor | null;
  readonly started_at: Date;
  readonly ended_at: Date | null;
  readonly duration_seconds: number | null;
  readonly moves_count: number;
  readonly board_state: BoardState | string;
  readonly online_state: MatchAggregate['online'] | string | null;
}

interface ScoreboardRow {
  readonly name: string;
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;
  readonly matches: number;
}

@Injectable()
export class PostgresMatchRepository implements MatchRepository, OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(config: AppConfigService) {
    this.pool = new Pool({ connectionString: config.databaseUrl });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureSchema();
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async create(input: CreateMatchInput): Promise<MatchAggregate> {
    const id = randomUUID();
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      await this.ensurePlayer(client, input.whitePlayerName);
      await this.ensurePlayer(client, input.blackPlayerName);

      const result = await client.query<MatchRow>(
        `insert into chess_matches (
          id,
          mode,
          white_player_name,
          black_player_name,
          status,
          started_at,
          moves_count,
          board_state,
          online_state
        ) values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb)
        returning *`,
        [
          id,
          input.mode,
          input.whitePlayerName,
          input.blackPlayerName,
          input.boardState.status,
          new Date(input.startedAt),
          input.boardState.history.length,
          JSON.stringify(input.boardState),
          input.online ? JSON.stringify(input.online) : null
        ]
      );

      await client.query('COMMIT');
      return this.mapMatchRow(this.requireSingleRow(result.rows));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<MatchAggregate | null> {
    const result = await this.pool.query<MatchRow>('select * from chess_matches where id = $1', [id]);
    const row = result.rows[0];
    return row ? this.mapMatchRow(row) : null;
  }

  async findByOnlineRoomCode(roomCode: string): Promise<MatchAggregate | null> {
    const result = await this.pool.query<MatchRow>(
      `select *
      from chess_matches
      where mode = 'online'
        and online_state ->> 'roomCode' = $1
      limit 1`,
      [roomCode]
    );
    const row = result.rows[0];
    return row ? this.mapMatchRow(row) : null;
  }

  async save(match: MatchAggregate): Promise<MatchAggregate> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      await this.ensurePlayer(client, match.whitePlayerName);
      await this.ensurePlayer(client, match.blackPlayerName);
      const previousResult = await client.query<MatchRow>('select * from chess_matches where id = $1 for update', [
        match.id
      ]);
      const previous = this.requireSingleRow(previousResult.rows);
      const updateResult = await client.query<MatchRow>(
        `update chess_matches
        set mode = $2,
            white_player_name = $3,
            black_player_name = $4,
            status = $5,
            winner = $6,
            ended_at = $7,
            duration_seconds = $8,
            moves_count = $9,
            board_state = $10::jsonb,
            online_state = $11::jsonb,
            updated_at = now()
        where id = $1
        returning *`,
        [
          match.id,
          match.mode,
          match.whitePlayerName,
          match.blackPlayerName,
          match.status,
          match.winner ?? null,
          match.endedAt ? new Date(match.endedAt) : null,
          match.durationSeconds ?? null,
          match.movesCount,
          JSON.stringify(match.boardState),
          match.online ? JSON.stringify(match.online) : null
        ]
      );

      if (previous.status === 'active' && match.status !== 'active') {
        await this.applyFinalScore(client, match);
      }

      await client.query('COMMIT');
      return this.mapMatchRow(this.requireSingleRow(updateResult.rows));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listRecent(): Promise<readonly MatchSummary[]> {
    const result = await this.pool.query<MatchRow>(
      'select * from chess_matches order by started_at desc limit 50'
    );
    return result.rows.map((row) => this.mapMatchSummary(row));
  }

  async getScoreboard(): Promise<readonly ScoreboardEntry[]> {
    const result = await this.pool.query<ScoreboardRow>(
      `select name, wins, losses, draws, matches
      from chess_players
      order by wins desc, draws desc, losses asc, name asc`
    );

    return result.rows.map((row) => ({
      playerName: row.name,
      wins: Number(row.wins),
      losses: Number(row.losses),
      draws: Number(row.draws),
      matches: Number(row.matches)
    }));
  }

  private async ensureSchema(): Promise<void> {
    await this.pool.query(`
      create table if not exists chess_players (
        name text primary key,
        wins integer not null default 0,
        losses integer not null default 0,
        draws integer not null default 0,
        matches integer not null default 0,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create table if not exists chess_matches (
        id uuid primary key,
        mode text not null default 'local',
        white_player_name text not null references chess_players(name),
        black_player_name text not null references chess_players(name),
        status text not null,
        winner text null,
        started_at timestamptz not null,
        ended_at timestamptz null,
        duration_seconds integer null,
        moves_count integer not null default 0,
        board_state jsonb not null,
        online_state jsonb null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      alter table chess_matches add column if not exists mode text not null default 'local';
      alter table chess_matches add column if not exists online_state jsonb null;
      create index if not exists chess_matches_started_at_idx on chess_matches(started_at desc);
      create index if not exists chess_matches_status_idx on chess_matches(status);
      create index if not exists chess_matches_online_room_code_idx
        on chess_matches ((online_state ->> 'roomCode'))
        where mode = 'online';
    `);
  }

  private async ensurePlayer(client: PoolClient, playerName: string): Promise<void> {
    await client.query(
      `insert into chess_players (name)
      values ($1)
      on conflict (name) do nothing`,
      [playerName]
    );
  }

  private async applyFinalScore(client: PoolClient, match: MatchAggregate): Promise<void> {
    if (match.winner === 'white') {
      await this.incrementPlayerStats(client, match.whitePlayerName, { wins: 1, matches: 1 });
      await this.incrementPlayerStats(client, match.blackPlayerName, { losses: 1, matches: 1 });
      return;
    }

    if (match.winner === 'black') {
      await this.incrementPlayerStats(client, match.blackPlayerName, { wins: 1, matches: 1 });
      await this.incrementPlayerStats(client, match.whitePlayerName, { losses: 1, matches: 1 });
      return;
    }

    await this.incrementPlayerStats(client, match.whitePlayerName, { draws: 1, matches: 1 });
    await this.incrementPlayerStats(client, match.blackPlayerName, { draws: 1, matches: 1 });
  }

  private async incrementPlayerStats(
    client: PoolClient,
    playerName: string,
    values: Partial<Pick<ScoreboardEntry, 'wins' | 'losses' | 'draws' | 'matches'>>
  ): Promise<void> {
    await client.query(
      `update chess_players
      set wins = wins + $2,
          losses = losses + $3,
          draws = draws + $4,
          matches = matches + $5,
          updated_at = now()
      where name = $1`,
      [playerName, values.wins ?? 0, values.losses ?? 0, values.draws ?? 0, values.matches ?? 0]
    );
  }

  private mapMatchRow(row: MatchRow): MatchAggregate {
    const summary = this.mapMatchSummary(row);
    const online = this.parseOnlineState(row.online_state);

    return {
      id: summary.id,
      mode: summary.mode,
      whitePlayerName: summary.whitePlayerName,
      blackPlayerName: summary.blackPlayerName,
      status: summary.status,
      ...(summary.winner ? { winner: summary.winner } : {}),
      startedAt: summary.startedAt,
      ...(summary.endedAt ? { endedAt: summary.endedAt } : {}),
      ...(summary.durationSeconds !== undefined ? { durationSeconds: summary.durationSeconds } : {}),
      movesCount: summary.movesCount,
      boardState: typeof row.board_state === 'string' ? (JSON.parse(row.board_state) as BoardState) : row.board_state,
      ...(online ? { online } : {})
    };
  }

  private mapMatchSummary(row: MatchRow): MatchSummary {
    const online = row.online_state ? this.parseOnlineState(row.online_state) : undefined;

    return {
      id: row.id,
      mode: row.mode,
      whitePlayerName: row.white_player_name,
      blackPlayerName: row.black_player_name,
      status: row.status,
      ...(row.winner ? { winner: row.winner } : {}),
      startedAt: row.started_at.toISOString(),
      ...(row.ended_at ? { endedAt: row.ended_at.toISOString() } : {}),
      ...(row.duration_seconds !== null ? { durationSeconds: Number(row.duration_seconds) } : {}),
      movesCount: Number(row.moves_count),
      ...(online
        ? {
            online: {
              roomCode: online.roomCode,
              hasStarted: online.hasStarted
            }
          }
        : {})
    };
  }

  private parseOnlineState(value: MatchRow['online_state']): MatchAggregate['online'] {
    if (!value) {
      return undefined;
    }

    return typeof value === 'string' ? (JSON.parse(value) as MatchAggregate['online']) : value;
  }

  private requireSingleRow<T>(rows: readonly T[]): T {
    const row = rows[0];
    if (!row) {
      throw new Error('Expected database query to return one row.');
    }

    return row;
  }
}
