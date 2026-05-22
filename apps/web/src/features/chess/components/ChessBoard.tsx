import { BOARD_FILES, BOARD_RANKS, type BoardSquare, type BoardState } from '@chess-ledger/shared';

import { ChessPieceIcon } from './ChessPieceIcon';

interface ChessBoardProps {
  readonly boardState: BoardState;
  readonly selectedSquare: BoardSquare | null;
  readonly legalTargets: readonly BoardSquare[];
  readonly onSquareClick: (square: BoardSquare) => void;
}

export function ChessBoard({ boardState, selectedSquare, legalTargets, onSquareClick }: ChessBoardProps) {
  const piecesBySquare = new Map(boardState.pieces.map((piece) => [piece.square, piece]));
  const legalTargetSet = new Set(legalTargets);
  const ranks = [...BOARD_RANKS].reverse();

  return (
    <section
      className="w-full min-w-0 max-w-[820px] rounded-lg border border-stone-900/20 bg-[#24382a] p-2 shadow-[0_18px_48px_rgba(23,25,24,0.12)] sm:p-3 lg:w-[min(100%,78vh)]"
      aria-label="Tabuleiro de xadrez"
    >
      <div className="grid aspect-square w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-md">
        {ranks.map((rank) =>
          BOARD_FILES.map((file) => {
            const square = `${file}${rank}` as BoardSquare;
            const piece = piecesBySquare.get(square);
            const isSelected = selectedSquare === square;
            const isLegalTarget = legalTargetSet.has(square);
            const toneClass =
              (BOARD_FILES.indexOf(file) + BOARD_RANKS.indexOf(rank)) % 2 === 0
                ? 'bg-[#4f7b58]'
                : 'bg-[#dbe6ce]';

            return (
              <button
                key={square}
                type="button"
                className={[
                  'relative grid min-h-0 min-w-0 place-items-center border-0 transition focus:outline-none',
                  toneClass,
                  isSelected ? 'ring-4 ring-inset ring-[#c9a23a]' : '',
                  isLegalTarget
                    ? 'after:absolute after:h-[28%] after:aspect-square after:rounded-full after:bg-stone-950/25 after:content-[""]'
                    : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSquareClick(square)}
                aria-label={`${square}${piece ? ` ${piece.color} ${piece.type}` : ''}`}
              >
                <span className="absolute right-1.5 bottom-1 z-10 text-[11px] leading-none font-extrabold text-stone-950/65 uppercase">
                  {rank === '1' ? file : ''}
                </span>
                <span className="absolute top-1 left-1.5 z-10 text-[11px] leading-none font-extrabold text-stone-950/65 uppercase">
                  {file === 'a' ? rank : ''}
                </span>
                {piece ? <ChessPieceIcon piece={piece} className="pointer-events-none absolute h-[72%] w-[72%]" /> : null}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
