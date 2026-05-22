export const BOARD_FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const BOARD_RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export type BoardFile = (typeof BOARD_FILES)[number];
export type BoardRank = (typeof BOARD_RANKS)[number];
export type BoardSquare = `${BoardFile}${BoardRank}`;

export type PieceColor = 'white' | 'black';
export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PromotionPieceType = 'queen' | 'rook' | 'bishop' | 'knight';
export type MatchStatus = 'active' | 'checkmate' | 'stalemate' | 'draw' | 'aborted';
export type LedgerEventType =
  | 'MATCH_STARTED'
  | 'MOVE_RECORDED'
  | 'PIECE_CAPTURED'
  | 'CHECK_DECLARED'
  | 'CASTLING_PERFORMED'
  | 'PAWN_PROMOTED'
  | 'MATCH_FINISHED'
  | 'SNAPSHOT_RECORDED';

export interface ChessPiece {
  readonly id: string;
  readonly color: PieceColor;
  readonly type: PieceType;
  readonly square: BoardSquare;
}

export interface CapturedPiece {
  readonly color: PieceColor;
  readonly type: PieceType;
  readonly capturedAt: BoardSquare;
  readonly capturedBy: PieceColor;
  readonly moveSan: string;
}

export interface LegalMove {
  readonly from: BoardSquare;
  readonly to: BoardSquare;
  readonly promotion?: PromotionPieceType;
  readonly san: string;
}

export interface MoveRecord {
  readonly color: PieceColor;
  readonly piece: PieceType;
  readonly from: BoardSquare;
  readonly to: BoardSquare;
  readonly san: string;
  readonly captured?: PieceType;
  readonly promotion?: PromotionPieceType;
  readonly isCheck: boolean;
  readonly isCheckmate: boolean;
  readonly isCastling: boolean;
  readonly movedAt: string;
}

export interface BoardState {
  readonly fen: string;
  readonly pieces: readonly ChessPiece[];
  readonly turn: PieceColor;
  readonly status: MatchStatus;
  readonly fullMoveNumber: number;
  readonly isCheck: boolean;
  readonly isCheckmate: boolean;
  readonly isStalemate: boolean;
  readonly isDraw: boolean;
  readonly winner?: PieceColor;
  readonly capturedPieces: readonly CapturedPiece[];
  readonly legalMoves: readonly LegalMove[];
  readonly history: readonly MoveRecord[];
}

export interface MovePieceRequest {
  readonly from: BoardSquare;
  readonly to: BoardSquare;
  readonly promotion?: PromotionPieceType;
}

export interface StartLocalMatchRequest {
  readonly whitePlayerName?: string;
  readonly blackPlayerName?: string;
}

export interface MatchView {
  readonly id: string;
  readonly whitePlayerName: string;
  readonly blackPlayerName: string;
  readonly status: MatchStatus;
  readonly winner?: PieceColor;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly durationSeconds?: number;
  readonly movesCount: number;
  readonly boardState: BoardState;
}

export interface MatchSummary {
  readonly id: string;
  readonly whitePlayerName: string;
  readonly blackPlayerName: string;
  readonly status: MatchStatus;
  readonly winner?: PieceColor;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly durationSeconds?: number;
  readonly movesCount: number;
}

export interface LedgerEventPayload {
  readonly move?: MoveRecord;
  readonly capturedPiece?: CapturedPiece;
  readonly note?: string;
  readonly [key: string]: unknown;
}

export interface LedgerEventView {
  readonly id: string;
  readonly matchId: string;
  readonly sequence: number;
  readonly type: LedgerEventType;
  readonly occurredAt: string;
  readonly actor: PieceColor | 'system';
  readonly message: string;
  readonly payload: LedgerEventPayload;
  readonly boardSnapshot?: BoardState;
}

export interface AdminSessionRequest {
  readonly password: string;
}

export interface AdminSessionResponse {
  readonly token: string;
  readonly expiresAt: string;
}

export interface ApiErrorResponse {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

export function isBoardSquare(value: string): value is BoardSquare {
  return /^[a-h][1-8]$/.test(value);
}

export function oppositeColor(color: PieceColor): PieceColor {
  return color === 'white' ? 'black' : 'white';
}
