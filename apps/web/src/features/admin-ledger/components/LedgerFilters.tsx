import { Filter, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import type { LedgerEventView } from '@chess-ledger/shared';

import {
  countLedgerEventsByQuickFilter,
  LEDGER_EVENT_TYPES,
  ledgerActorLabels,
  ledgerEventTypeLabels,
  type LedgerActorFilter,
  type LedgerEventTypeFilter,
  type LedgerFilterState,
  type LedgerQuickFilter,
  type LedgerSortDirection
} from '../utils/ledgerFilters';

interface LedgerFiltersProps {
  readonly events: readonly LedgerEventView[];
  readonly filteredCount: number;
  readonly filters: LedgerFilterState;
  readonly onChange: (filters: LedgerFilterState) => void;
  readonly onReset: () => void;
}

const actorOptions = ['all', 'system', 'white', 'black'] as const satisfies readonly LedgerActorFilter[];
const sortOptions = ['desc', 'asc'] as const satisfies readonly LedgerSortDirection[];
const quickFilterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'moves', label: 'Jogadas' },
  { value: 'captures', label: 'Capturas' },
  { value: 'critical', label: 'Criticos' },
  { value: 'snapshots', label: 'Snapshots' }
] as const satisfies readonly { readonly value: LedgerQuickFilter; readonly label: string }[];

export function LedgerFilters({ events, filteredCount, filters, onChange, onReset }: LedgerFiltersProps) {
  const stats = useMemo(() => createLedgerStats(events, filteredCount), [events, filteredCount]);

  function updateFilter<Key extends keyof LedgerFilterState>(key: Key, value: LedgerFilterState[Key]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <section className="mb-4 rounded-lg border border-stone-900/10 bg-white/90 p-4 shadow-[0_8px_28px_rgba(23,25,24,0.08)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-bold text-[#184a34]">
            <SlidersHorizontal size={18} />
            Filtros do ledger
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <LedgerStat label="Visiveis" value={stats.visible} />
            <LedgerStat label="Total" value={stats.total} />
            <LedgerStat label="Partidas" value={stats.matches} />
            <LedgerStat label="Capturas" value={stats.captures} />
          </div>
        </div>

        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-900/10 bg-stone-50 px-3 text-sm font-bold text-stone-700 transition hover:border-[#184a34]/40 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onReset}
          disabled={!hasActiveFilters(filters)}
        >
          <RotateCcw size={16} />
          Limpar filtros
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickFilterOptions.map((option) => {
          const isActive = filters.quickFilter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={[
                'inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm font-bold transition',
                isActive
                  ? 'border-[#184a34] bg-[#184a34] text-white'
                  : 'border-stone-900/10 bg-white text-stone-700 hover:border-[#184a34]/40'
              ].join(' ')}
              onClick={() => updateFilter('quickFilter', option.value)}
            >
              <Filter size={14} />
              {option.label}
              <span
                className={[
                  'rounded-full px-2 py-0.5 text-xs',
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                ].join(' ')}
              >
                {countLedgerEventsByQuickFilter(events, option.value)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.5fr)_minmax(180px,0.85fr)_minmax(180px,0.85fr)_minmax(200px,1fr)_minmax(160px,0.7fr)]">
        <label className="grid gap-1.5 text-xs font-bold text-stone-600">
          Buscar
          <span className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              className="min-h-11 w-full rounded-lg border border-stone-900/10 bg-stone-50 py-2 pr-3 pl-9 text-sm font-medium text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-[#184a34] focus:bg-white focus:ring-3 focus:ring-[#184a34]/15"
              value={filters.query}
              onChange={(event) => updateFilter('query', event.currentTarget.value)}
              placeholder="SAN, peca, casa, FEN..."
            />
          </span>
        </label>

        <label className="grid gap-1.5 text-xs font-bold text-stone-600">
          Tipo
          <select
            className="min-h-11 rounded-lg border border-stone-900/10 bg-stone-50 px-3 text-sm font-medium text-stone-950 outline-none transition focus:border-[#184a34] focus:bg-white focus:ring-3 focus:ring-[#184a34]/15"
            value={filters.eventType}
            onChange={(event) => updateFilter('eventType', event.currentTarget.value as LedgerEventTypeFilter)}
          >
            <option value="all">Todos os tipos</option>
            {LEDGER_EVENT_TYPES.map((eventType) => (
              <option key={eventType} value={eventType}>
                {ledgerEventTypeLabels[eventType]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-bold text-stone-600">
          Ator
          <select
            className="min-h-11 rounded-lg border border-stone-900/10 bg-stone-50 px-3 text-sm font-medium text-stone-950 outline-none transition focus:border-[#184a34] focus:bg-white focus:ring-3 focus:ring-[#184a34]/15"
            value={filters.actor}
            onChange={(event) => updateFilter('actor', event.currentTarget.value as LedgerActorFilter)}
          >
            {actorOptions.map((actor) => (
              <option key={actor} value={actor}>
                {actor === 'all' ? 'Todos os atores' : ledgerActorLabels[actor]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-bold text-stone-600">
          Partida
          <input
            className="min-h-11 rounded-lg border border-stone-900/10 bg-stone-50 px-3 text-sm font-medium text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-[#184a34] focus:bg-white focus:ring-3 focus:ring-[#184a34]/15"
            value={filters.matchId}
            onChange={(event) => updateFilter('matchId', event.currentTarget.value)}
            placeholder="ID da partida"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-bold text-stone-600">
          Ordem
          <select
            className="min-h-11 rounded-lg border border-stone-900/10 bg-stone-50 px-3 text-sm font-medium text-stone-950 outline-none transition focus:border-[#184a34] focus:bg-white focus:ring-3 focus:ring-[#184a34]/15"
            value={filters.sortDirection}
            onChange={(event) => updateFilter('sortDirection', event.currentTarget.value as LedgerSortDirection)}
          >
            {sortOptions.map((sortDirection) => (
              <option key={sortDirection} value={sortDirection}>
                {sortDirection === 'desc' ? 'Mais recentes' : 'Mais antigos'}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function LedgerStat({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <span className="inline-flex min-h-9 items-center gap-2 rounded-md border border-stone-900/10 bg-stone-50 px-3 text-sm">
      <span className="font-bold text-stone-950">{value}</span>
      <span className="font-medium text-stone-500">{label}</span>
    </span>
  );
}

function createLedgerStats(events: readonly LedgerEventView[], visible: number) {
  return {
    visible,
    total: events.length,
    matches: new Set(events.map((event) => event.matchId)).size,
    captures: events.filter((event) => event.type === 'PIECE_CAPTURED').length
  };
}

function hasActiveFilters(filters: LedgerFilterState): boolean {
  return (
    filters.query !== '' ||
    filters.matchId !== '' ||
    filters.eventType !== 'all' ||
    filters.actor !== 'all' ||
    filters.quickFilter !== 'all' ||
    filters.sortDirection !== 'desc'
  );
}
