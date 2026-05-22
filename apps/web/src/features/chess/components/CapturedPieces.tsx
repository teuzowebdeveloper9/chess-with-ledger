import type { BoardState, PieceColor } from '@chess-ledger/shared';

import { PieceTypeIcon } from './ChessPieceIcon';

interface CapturedPiecesProps {
  readonly boardState: BoardState;
}

export function CapturedPieces({ boardState }: CapturedPiecesProps) {
  return (
    <section
      className="grid gap-3 rounded-lg border border-stone-900/10 bg-white/90 p-4 shadow-[0_18px_48px_rgba(23,25,24,0.12)]"
      aria-label="Pecas capturadas"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="mb-1 block text-xs font-bold tracking-[0.08em] text-[#184a34] uppercase">Capturas</span>
          <h2 className="text-lg leading-tight font-bold tracking-normal text-stone-950">Pecas fora do jogo</h2>
        </div>
      </div>
      <CapturedRow color="white" boardState={boardState} />
      <CapturedRow color="black" boardState={boardState} />
    </section>
  );
}

function CapturedRow({ color, boardState }: { readonly color: PieceColor; readonly boardState: BoardState }) {
  const captured = boardState.capturedPieces.filter((piece) => piece.color === color);

  return (
    <div className="grid grid-cols-[80px_1fr] items-center gap-2.5 text-sm font-bold text-stone-500">
      <span>{color === 'white' ? 'Brancas' : 'Pretas'}</span>
      <div className="flex min-h-7 flex-wrap gap-1">
        {captured.map((piece, index) => (
          <PieceTypeIcon key={`${piece.type}-${piece.capturedAt}-${index}`} type={piece.type} color={piece.color} />
        ))}
      </div>
    </div>
  );
}
