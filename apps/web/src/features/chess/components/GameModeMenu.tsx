import { MonitorUp, RadioTower, Shield, Swords } from 'lucide-react';

interface GameModeMenuProps {
  readonly onLocal: () => void;
  readonly onOnline: () => void;
}

export function GameModeMenu({ onLocal, onOnline }: GameModeMenuProps) {
  return (
    <main className="min-h-screen bg-[#f5f6f1] bg-[linear-gradient(135deg,rgba(47,111,78,0.12),transparent_38%),linear-gradient(315deg,rgba(37,99,235,0.12),transparent_34%)] p-4 text-stone-950 sm:p-8">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1180px] content-center gap-6 sm:min-h-[calc(100vh-4rem)]">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#184a34]/15 bg-white/80 px-3 py-1 text-xs font-bold text-[#184a34] uppercase">
              <Shield size={14} />
              Chess Ledger
            </span>
            <h1 className="max-w-[720px] text-5xl leading-[0.95] font-black tracking-normal sm:text-6xl lg:text-7xl">
              Escolha sua mesa
            </h1>
          </div>
          <a
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-stone-900/10 bg-white px-4 font-bold text-stone-950 shadow-[0_8px_24px_rgba(23,25,24,0.08)] transition hover:-translate-y-0.5"
            href="/admin/ledger"
          >
            <RadioTower size={18} />
            Ledger
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            className="group grid min-h-[260px] content-between rounded-lg border border-stone-900/10 bg-white/90 p-5 text-left shadow-[0_18px_48px_rgba(23,25,24,0.12)] transition hover:-translate-y-1 hover:border-[#2f6f4e]/35"
            onClick={onLocal}
          >
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#24382a] text-white transition group-hover:scale-105">
              <Swords size={24} />
            </span>
            <span>
              <span className="mb-2 block text-xs font-bold tracking-[0.08em] text-[#184a34] uppercase">
                Mesmo dispositivo
              </span>
              <span className="block text-3xl leading-tight font-black tracking-normal">Partida local</span>
            </span>
          </button>

          <button
            type="button"
            className="group grid min-h-[260px] content-between rounded-lg border border-stone-900/10 bg-[#172554] p-5 text-left text-white shadow-[0_18px_48px_rgba(23,25,24,0.16)] transition hover:-translate-y-1 hover:border-blue-200/50"
            onClick={onOnline}
          >
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-[#172554] transition group-hover:scale-105">
              <MonitorUp size={24} />
            </span>
            <span>
              <span className="mb-2 block text-xs font-bold tracking-[0.08em] text-blue-100 uppercase">
                Sala privada
              </span>
              <span className="block text-3xl leading-tight font-black tracking-normal">Partida online</span>
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}
