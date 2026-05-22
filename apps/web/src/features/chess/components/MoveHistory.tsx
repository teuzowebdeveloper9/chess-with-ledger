import type { MoveRecord } from '@chess-ledger/shared';

interface MoveHistoryProps {
  readonly history: readonly MoveRecord[];
}

export function MoveHistory({ history }: MoveHistoryProps) {
  return (
    <section
      className="rounded-lg border border-stone-900/10 bg-white/90 p-4 shadow-[0_18px_48px_rgba(23,25,24,0.12)]"
      aria-label="Historico de movimentos"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="mb-1 block text-xs font-bold tracking-[0.08em] text-[#184a34] uppercase">Historico</span>
          <h2 className="text-lg leading-tight font-bold tracking-normal text-stone-950">Movimentos</h2>
        </div>
      </div>
      <ol className="mt-3 grid max-h-[430px] gap-1.5 overflow-auto p-0">
        {history.map((move, index) => (
          <li
            key={`${move.from}-${move.to}-${index}`}
            className="grid grid-cols-[30px_1fr] items-center gap-2.5 rounded-lg border border-stone-900/10 bg-white p-2 sm:grid-cols-[34px_1fr_auto]"
          >
            <span className="font-extrabold text-[#b88a2f]">{index + 1}</span>
            <span>{move.san}</span>
            <small className="col-start-2 text-stone-500 sm:col-auto">
              {move.from.toUpperCase()} para {move.to.toUpperCase()}
            </small>
          </li>
        ))}
      </ol>
      {history.length === 0 ? <p className="text-stone-500">A primeira jogada ainda nao foi registrada.</p> : null}
    </section>
  );
}
