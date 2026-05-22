import type { IconType } from 'react-icons';
import {
  GiChessBishop,
  GiChessKing,
  GiChessKnight,
  GiChessPawn,
  GiChessQueen,
  GiChessRook
} from 'react-icons/gi';
import type { ChessPiece, PieceColor, PieceType } from '@chess-ledger/shared';

const iconByPieceType: Record<PieceType, IconType> = {
  king: GiChessKing,
  queen: GiChessQueen,
  rook: GiChessRook,
  bishop: GiChessBishop,
  knight: GiChessKnight,
  pawn: GiChessPawn
};

interface ChessPieceIconProps {
  readonly piece: Pick<ChessPiece, 'type' | 'color'>;
  readonly className?: string;
}

export function ChessPieceIcon({ piece, className }: ChessPieceIconProps) {
  const Icon = iconByPieceType[piece.type];
  const colorClass =
    piece.color === 'white'
      ? 'text-stone-50 drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]'
      : 'text-zinc-950 drop-shadow-[0_3px_5px_rgba(255,255,255,0.25)]';

  return <Icon aria-hidden="true" className={`${colorClass} ${className ?? ''}`.trim()} />;
}

export function PieceTypeIcon({ type, color }: { readonly type: PieceType; readonly color: PieceColor }) {
  return <ChessPieceIcon piece={{ type, color }} className="h-6 w-6 shrink-0" />;
}
