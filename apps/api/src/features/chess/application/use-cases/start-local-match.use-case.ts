import { Inject, Injectable } from '@nestjs/common';
import type { MatchView } from '@chess-ledger/shared';

import { CHESS_RULES_ENGINE, type ChessRulesEngine } from '../ports/chess-rules-engine.port';
import { LEDGER_REPOSITORY, type LedgerRepository } from '../ports/ledger-repository.port';
import { MATCH_REPOSITORY, type MatchRepository } from '../ports/match-repository.port';

interface StartLocalMatchInput {
  readonly whitePlayerName?: string;
  readonly blackPlayerName?: string;
}

@Injectable()
export class StartLocalMatchUseCase {
  constructor(
    @Inject(CHESS_RULES_ENGINE) private readonly chessRules: ChessRulesEngine,
    @Inject(MATCH_REPOSITORY) private readonly matches: MatchRepository,
    @Inject(LEDGER_REPOSITORY) private readonly ledger: LedgerRepository
  ) {}

  async execute(input: StartLocalMatchInput): Promise<MatchView> {
    const startedAt = new Date().toISOString();
    const boardState = this.chessRules.createInitialState();
    const match = await this.matches.create({
      whitePlayerName: input.whitePlayerName?.trim() || 'Jogador branco',
      blackPlayerName: input.blackPlayerName?.trim() || 'Jogador preto',
      boardState,
      startedAt
    });

    await this.ledger.append(match.id, [
      {
        type: 'MATCH_STARTED',
        occurredAt: startedAt,
        actor: 'system',
        message: `Partida iniciada entre ${match.whitePlayerName} e ${match.blackPlayerName}.`,
        payload: {
          whitePlayerName: match.whitePlayerName,
          blackPlayerName: match.blackPlayerName
        },
        boardSnapshot: boardState
      }
    ]);

    return match;
  }
}
