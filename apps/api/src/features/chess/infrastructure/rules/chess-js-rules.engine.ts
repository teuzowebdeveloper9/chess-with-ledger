import { Injectable } from '@nestjs/common';
import { Chess, type Move, type PieceSymbol } from 'chess.js';
import type {
  BoardState,
  BoardSquare,
  CapturedPiece,
  ChessPiece,
  LegalMove,
  MovePieceRequest,
  MoveRecord,
  PieceColor,
  PieceType,
  PromotionPieceType
} from '@chess-ledger/shared';
import { isBoardSquare, oppositeColor } from '@chess-ledger/shared';

import { InvalidChessMoveError } from '../../application/errors/application.error';
import type { AppliedMove, ChessRulesEngine } from '../../application/ports/chess-rules-engine.port';

type ChessJsColor = 'w' | 'b';

const pieceTypeBySymbol: Record<PieceSymbol, PieceType> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king'
};

const promotionSymbolByType: Record<PromotionPieceType, 'q' | 'r' | 'b' | 'n'> = {
  queen: 'q',
  rook: 'r',
  bishop: 'b',
  knight: 'n'
};

@Injectable()
export class ChessJsRulesEngine implements ChessRulesEngine {
  createInitialState(): BoardState {
    const chess = new Chess();
    return this.toBoardState(chess, [], []);
  }

  applyMove(currentState: BoardState, request: MovePieceRequest, movedAt: string): AppliedMove {
    const chess = new Chess(currentState.fen);
    const previousPiece = chess.get(request.from);

    if (!previousPiece) {
      throw new InvalidChessMoveError({ from: request.from, reason: 'No piece exists at the source square.' });
    }

    const move = this.move(chess, request);
    const moveRecord = this.toMoveRecord(move, movedAt);
    const capturedPiece = this.toCapturedPiece(move);
    const capturedPieces = capturedPiece
      ? [...currentState.capturedPieces, capturedPiece]
      : [...currentState.capturedPieces];
    const history = [...currentState.history, moveRecord];
    const boardState = this.toBoardState(chess, history, capturedPieces);
    const ledgerEvents = this.toLedgerEvents(boardState, moveRecord, capturedPiece, movedAt);

    return { boardState, ledgerEvents };
  }

  private move(chess: Chess, request: MovePieceRequest): Move {
    try {
      const move = chess.move({
        from: request.from,
        to: request.to,
        ...(request.promotion ? { promotion: promotionSymbolByType[request.promotion] } : {})
      });

      if (!move) {
        throw new InvalidChessMoveError(request);
      }

      return move;
    } catch (error) {
      if (error instanceof InvalidChessMoveError) {
        throw error;
      }

      throw new InvalidChessMoveError({ request, error: error instanceof Error ? error.message : String(error) });
    }
  }

  private toBoardState(
    chess: Chess,
    history: readonly MoveRecord[],
    capturedPieces: readonly CapturedPiece[]
  ): BoardState {
    const status = chess.isCheckmate()
      ? 'checkmate'
      : chess.isStalemate()
        ? 'stalemate'
        : chess.isDraw()
          ? 'draw'
          : 'active';
    const turn = this.toPieceColor(chess.turn());
    const winner = status === 'checkmate' ? oppositeColor(turn) : undefined;

    return {
      fen: chess.fen(),
      pieces: this.toPieces(chess),
      turn,
      status,
      fullMoveNumber: this.fullMoveNumberFromFen(chess.fen()),
      isCheck: chess.isCheck(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isDraw: chess.isDraw(),
      ...(winner ? { winner } : {}),
      capturedPieces,
      legalMoves: status === 'active' ? this.toLegalMoves(chess) : [],
      history
    };
  }

  private toPieces(chess: Chess): readonly ChessPiece[] {
    const pieces: ChessPiece[] = [];

    for (const row of chess.board()) {
      for (const piece of row) {
        if (!piece) {
          continue;
        }

        const square = this.toBoardSquare(piece.square);
        const color = this.toPieceColor(piece.color);
        const type = pieceTypeBySymbol[piece.type];
        pieces.push({
          id: `${color}-${type}-${square}`,
          color,
          type,
          square
        });
      }
    }

    return pieces;
  }

  private toLegalMoves(chess: Chess): readonly LegalMove[] {
    return chess.moves({ verbose: true }).map((move) => ({
      from: this.toBoardSquare(move.from),
      to: this.toBoardSquare(move.to),
      ...(move.promotion ? { promotion: pieceTypeBySymbol[move.promotion] as PromotionPieceType } : {}),
      san: move.san
    }));
  }

  private toMoveRecord(move: Move, movedAt: string): MoveRecord {
    return {
      color: this.toPieceColor(move.color),
      piece: pieceTypeBySymbol[move.piece],
      from: this.toBoardSquare(move.from),
      to: this.toBoardSquare(move.to),
      san: move.san,
      ...(move.captured ? { captured: pieceTypeBySymbol[move.captured] } : {}),
      ...(move.promotion ? { promotion: pieceTypeBySymbol[move.promotion] as PromotionPieceType } : {}),
      isCheck: move.san.includes('+') || move.san.includes('#'),
      isCheckmate: move.san.includes('#'),
      isCastling: move.flags.includes('k') || move.flags.includes('q'),
      movedAt
    };
  }

  private toCapturedPiece(move: Move): CapturedPiece | undefined {
    if (!move.captured) {
      return undefined;
    }

    const capturingColor = this.toPieceColor(move.color);
    return {
      color: oppositeColor(capturingColor),
      type: pieceTypeBySymbol[move.captured],
      capturedAt: this.toBoardSquare(move.to),
      capturedBy: capturingColor,
      moveSan: move.san
    };
  }

  private toLedgerEvents(
    boardState: BoardState,
    move: MoveRecord,
    capturedPiece: CapturedPiece | undefined,
    occurredAt: string
  ): AppliedMove['ledgerEvents'] {
    const events: AppliedMove['ledgerEvents'][number][] = [
      {
        type: 'MOVE_RECORDED',
        occurredAt,
        actor: move.color,
        message: `${this.colorLabel(move.color)} moveu ${this.pieceLabel(move.piece)} de ${move.from.toUpperCase()} para ${move.to.toUpperCase()} (${move.san}).`,
        payload: { move },
        boardSnapshot: boardState
      }
    ];

    if (capturedPiece) {
      events.push({
        type: 'PIECE_CAPTURED',
        occurredAt,
        actor: move.color,
        message: `${this.colorLabel(move.color)} capturou ${this.pieceLabel(capturedPiece.type)} em ${capturedPiece.capturedAt.toUpperCase()}.`,
        payload: { move, capturedPiece },
        boardSnapshot: boardState
      });
    }

    if (move.isCastling) {
      events.push({
        type: 'CASTLING_PERFORMED',
        occurredAt,
        actor: move.color,
        message: `${this.colorLabel(move.color)} realizou roque.`,
        payload: { move },
        boardSnapshot: boardState
      });
    }

    if (move.promotion) {
      events.push({
        type: 'PAWN_PROMOTED',
        occurredAt,
        actor: move.color,
        message: `${this.colorLabel(move.color)} promoveu peao para ${this.pieceLabel(move.promotion)}.`,
        payload: { move },
        boardSnapshot: boardState
      });
    }

    if (boardState.isCheck && !boardState.isCheckmate) {
      events.push({
        type: 'CHECK_DECLARED',
        occurredAt,
        actor: move.color,
        message: `${this.colorLabel(move.color)} colocou o rei adversario em check.`,
        payload: { move },
        boardSnapshot: boardState
      });
    }

    if (boardState.status !== 'active') {
      events.push({
        type: 'MATCH_FINISHED',
        occurredAt,
        actor: 'system',
        message: this.finishMessage(boardState),
        payload: { move, status: boardState.status, winner: boardState.winner },
        boardSnapshot: boardState
      });
    }

    events.push({
      type: 'SNAPSHOT_RECORDED',
      occurredAt,
      actor: 'system',
      message: `Snapshot do tabuleiro salvo apos ${move.san}.`,
      payload: { move, fen: boardState.fen },
      boardSnapshot: boardState
    });

    return events;
  }

  private finishMessage(boardState: BoardState): string {
    if (boardState.status === 'checkmate' && boardState.winner) {
      return `Partida finalizada por checkmate. Vencedor: ${this.colorLabel(boardState.winner)}.`;
    }

    if (boardState.status === 'stalemate') {
      return 'Partida finalizada por afogamento.';
    }

    return 'Partida finalizada em empate.';
  }

  private toPieceColor(color: ChessJsColor): PieceColor {
    return color === 'w' ? 'white' : 'black';
  }

  private toBoardSquare(square: string): BoardSquare {
    if (!isBoardSquare(square)) {
      throw new Error(`Invalid board square returned by chess engine: ${square}`);
    }

    return square;
  }

  private fullMoveNumberFromFen(fen: string): number {
    const fullMoveNumber = Number(fen.split(' ')[5]);
    return Number.isInteger(fullMoveNumber) ? fullMoveNumber : 1;
  }

  private colorLabel(color: PieceColor): string {
    return color === 'white' ? 'Branco' : 'Preto';
  }

  private pieceLabel(piece: PieceType): string {
    const labels: Record<PieceType, string> = {
      pawn: 'peao',
      knight: 'cavalo',
      bishop: 'bispo',
      rook: 'torre',
      queen: 'rainha',
      king: 'rei'
    };

    return labels[piece];
  }
}
