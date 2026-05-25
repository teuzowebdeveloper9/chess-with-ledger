import type { BoardSquare } from '@chess-ledger/shared';
import { ArrowLeft } from 'lucide-react';

import { CapturedPieces } from './CapturedPieces';
import { ChessBoard } from './ChessBoard';
import { GameStatusBar } from './GameStatusBar';
import { MatchControls } from './MatchControls';
import { MoveHistory } from './MoveHistory';
import { PromotionDialog } from './PromotionDialog';
import { useChessMatch } from '../hooks/useChessMatch';

interface ChessGamePageProps {
  readonly onBack?: () => void;
}

export function ChessGamePage({ onBack }: ChessGamePageProps) {
  const {
    match,
    selectedSquare,
    selectedLegalMoves,
    pendingPromotion,
    isLoading,
    error,
    onSquareClick,
    startMatch,
    choosePromotion,
    cancelPromotion
  } = useChessMatch();

  const legalTargets = selectedLegalMoves.map((move) => move.to as BoardSquare);

  if (isLoading && !match) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f6f1] p-6 text-stone-900">
        <div className="grid gap-4 text-center">
          <p>Preparando partida local...</p>
          {onBack ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-900/10 bg-white px-3 font-bold text-stone-950"
              onClick={onBack}
            >
              <ArrowLeft size={18} />
              Menu
            </button>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1500px] bg-[#f5f6f1] bg-[linear-gradient(180deg,rgba(47,111,78,0.08),transparent_260px)] p-3 text-stone-950 sm:p-6">
      {onBack ? (
        <button
          type="button"
          className="mb-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-900/10 bg-white px-3 font-bold text-stone-950 shadow-[0_8px_24px_rgba(23,25,24,0.08)] transition hover:-translate-y-0.5"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Menu
        </button>
      ) : null}
      {match ? <GameStatusBar match={match} /> : null}
      {error ? (
        <div className="mb-3 rounded-lg border border-red-700/25 bg-red-700/10 px-4 py-3 font-bold text-red-800">
          {error}
        </div>
      ) : null}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(360px,1fr)_minmax(320px,420px)]">
        <div className="grid min-w-0 place-items-center">
          {match ? (
            <ChessBoard
              boardState={match.boardState}
              selectedSquare={selectedSquare}
              legalTargets={legalTargets}
              onSquareClick={onSquareClick}
            />
          ) : null}
        </div>
        <aside className="grid gap-3.5">
          <MatchControls onStartMatch={startMatch} />
          {match ? <CapturedPieces boardState={match.boardState} /> : null}
          {match ? <MoveHistory history={match.boardState.history} /> : null}
        </aside>
      </div>
      {pendingPromotion ? <PromotionDialog onChoose={choosePromotion} onCancel={cancelPromotion} /> : null}
    </main>
  );
}
