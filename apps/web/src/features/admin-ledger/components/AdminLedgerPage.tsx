import { ArrowLeft, LogOut, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useAdminLedger } from '../hooks/useAdminLedger';
import { defaultLedgerFilters, filterLedgerEvents } from '../utils/ledgerFilters';
import { AdminLogin } from './AdminLogin';
import { LedgerFilters } from './LedgerFilters';
import { LedgerTimeline } from './LedgerTimeline';

export function AdminLedgerPage() {
  const { events, isAuthenticated, isLoading, error, login, logout, refresh } = useAdminLedger();
  const [filters, setFilters] = useState(defaultLedgerFilters);
  const filteredEvents = useMemo(() => filterLedgerEvents(events, filters), [events, filters]);

  if (!isAuthenticated) {
    return <AdminLogin error={error} isLoading={isLoading} onLogin={login} />;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1180px] bg-[#f5f6f1] bg-[linear-gradient(180deg,rgba(47,111,78,0.08),transparent_260px)] p-3 text-stone-950 sm:p-6">
      <header className="mb-5 flex flex-col gap-5 rounded-lg border border-stone-900/10 bg-white/80 px-5 py-4 shadow-[0_18px_48px_rgba(23,25,24,0.12)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="mb-1 block text-xs font-bold text-[#184a34] uppercase">Livro verdade</span>
          <h1 className="text-[28px] leading-tight font-bold tracking-normal">Ledger administrativo</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-stone-900/10 bg-white px-3 font-bold text-stone-950 transition hover:-translate-y-0.5 sm:flex-none"
            href="/"
          >
            <ArrowLeft size={18} />
            Jogo
          </a>
          <button
            type="button"
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-stone-900/10 bg-white px-3 font-bold text-stone-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:flex-none"
            onClick={() => void refresh()}
            disabled={isLoading}
          >
            <RefreshCw size={18} />
            Atualizar
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-900/10 bg-white text-stone-950 transition hover:-translate-y-0.5"
            aria-label="Sair"
            title="Sair"
            onClick={logout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      {error ? (
        <div className="mb-3 rounded-lg border border-red-700/25 bg-red-700/10 px-4 py-3 font-bold text-red-800">
          {error}
        </div>
      ) : null}
      <LedgerFilters
        events={events}
        filteredCount={filteredEvents.length}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultLedgerFilters)}
      />
      <LedgerTimeline
        events={filteredEvents}
        emptyMessage={events.length === 0 ? 'Nenhum evento registrado no ledger.' : 'Nenhum evento encontrado para os filtros ativos.'}
      />
    </main>
  );
}
