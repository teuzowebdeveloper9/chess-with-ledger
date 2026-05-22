import type { BoardSquare } from '@chess-ledger/shared';

import { CapturedPieces } from './CapturedPieces';
import { ChessBoard } from './ChessBoard';
import { GameStatusBar } from './GameStatusBar';
import { MatchControls } from './MatchControls';
import { MoveHistory } from './MoveHistory';
import { PromotionDialog } from './PromotionDialog';
import { useChessMatch } from '../hooks/useChessMatch';

export function ChessGamePage() {
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
        Preparando partida local...
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1500px] bg-[#f5f6f1] bg-[linear-gradient(180deg,rgba(47,111,78,0.08),transparent_260px)] p-3 text-stone-950 sm:p-6">
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
