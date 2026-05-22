import { ExternalLink, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface MatchControlsProps {
  readonly onStartMatch: (whitePlayerName?: string, blackPlayerName?: string) => void;
}

export function MatchControls({ onStartMatch }: MatchControlsProps) {
  const [whitePlayerName, setWhitePlayerName] = useState('Jogador branco');
  const [blackPlayerName, setBlackPlayerName] = useState('Jogador preto');

  return (
    <section
      className="grid gap-3 rounded-lg border border-stone-900/10 bg-white/90 p-4 shadow-[0_18px_48px_rgba(23,25,24,0.12)]"
      aria-label="Controles da partida"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="mb-1 block text-xs font-bold tracking-[0.08em] text-[#184a34] uppercase">Controle</span>
          <h2 className="text-lg leading-tight font-bold tracking-normal text-stone-950">Nova partida</h2>
        </div>
      </div>
      <label className="grid gap-1.5 text-sm font-bold text-stone-500">
        <span>Brancas</span>
        <input
          className="min-h-10 w-full rounded-lg border border-stone-900/10 bg-white px-3 text-stone-950"
          value={whitePlayerName}
          onChange={(event) => setWhitePlayerName(event.target.value)}
        />
      </label>
      <label className="grid gap-1.5 text-sm font-bold text-stone-500">
        <span>Pretas</span>
        <input
          className="min-h-10 w-full rounded-lg border border-stone-900/10 bg-white px-3 text-stone-950"
          value={blackPlayerName}
          onChange={(event) => setBlackPlayerName(event.target.value)}
        />
      </label>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#2f6f4e] px-3.5 font-bold text-white transition hover:-translate-y-0.5 sm:flex-none"
          onClick={() => onStartMatch(whitePlayerName, blackPlayerName)}
        >
          <RotateCcw size={18} />
          Iniciar
        </button>
        <a
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-stone-900/10 bg-white px-3 font-bold text-stone-950 transition hover:-translate-y-0.5 sm:flex-none"
          href="/admin/ledger"
        >
          <ExternalLink size={18} />
          Ledger
        </a>
      </div>
    </section>
  );
}
