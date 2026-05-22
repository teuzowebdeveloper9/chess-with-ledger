import { Timer, Trophy } from 'lucide-react';
import type { MatchView } from '@chess-ledger/shared';

interface GameStatusBarProps {
  readonly match: MatchView;
}

export function GameStatusBar({ match }: GameStatusBarProps) {
  const turnLabel = match.boardState.turn === 'white' ? match.whitePlayerName : match.blackPlayerName;
  const statusLabel = match.status === 'active' ? `Vez de ${turnLabel}` : 'Partida finalizada';

  return (
    <section
      className="mb-5 flex flex-col gap-5 rounded-lg border border-stone-900/10 bg-white/80 px-5 py-4 shadow-[0_18px_48px_rgba(23,25,24,0.12)] sm:flex-row sm:items-center sm:justify-between"
      aria-label="Estado da partida"
    >
      <div>
        <span className="mb-1 block text-xs font-bold tracking-[0.08em] text-[#184a34] uppercase">Partida local</span>
        <h1 className="text-[28px] leading-tight font-bold tracking-normal text-stone-950">Chess Ledger</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-900/10 bg-white px-3 text-stone-600">
          <Timer size={18} />
          <span>{statusLabel}</span>
        </div>
        <div className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-900/10 bg-white px-3 text-stone-600">
          <Trophy size={18} />
          <span>{match.winner ? `${match.winner} venceu` : `${match.movesCount} movimentos`}</span>
        </div>
      </div>
    </section>
  );
}
