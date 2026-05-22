import type { LedgerEventType, LedgerEventView } from '@chess-ledger/shared';

export const LEDGER_EVENT_TYPES = [
  'MATCH_STARTED',
  'MOVE_RECORDED',
  'PIECE_CAPTURED',
  'CHECK_DECLARED',
  'CASTLING_PERFORMED',
  'PAWN_PROMOTED',
  'MATCH_FINISHED',
  'SNAPSHOT_RECORDED'
] as const satisfies readonly LedgerEventType[];

export const ledgerEventTypeLabels: Record<LedgerEventType, string> = {
  MATCH_STARTED: 'Partida iniciada',
  MOVE_RECORDED: 'Movimento',
  PIECE_CAPTURED: 'Captura',
  CHECK_DECLARED: 'Xeque',
  CASTLING_PERFORMED: 'Roque',
  PAWN_PROMOTED: 'Promocao',
  MATCH_FINISHED: 'Fim da partida',
  SNAPSHOT_RECORDED: 'Snapshot'
};

export const ledgerActorLabels: Record<LedgerEventView['actor'], string> = {
  system: 'Sistema',
  white: 'Brancas',
  black: 'Pretas'
};

export type LedgerQuickFilter = 'all' | 'moves' | 'captures' | 'critical' | 'snapshots';
export type LedgerActorFilter = LedgerEventView['actor'] | 'all';
export type LedgerEventTypeFilter = LedgerEventType | 'all';
export type LedgerSortDirection = 'asc' | 'desc';

export interface LedgerFilterState {
  readonly query: string;
  readonly matchId: string;
  readonly eventType: LedgerEventTypeFilter;
  readonly actor: LedgerActorFilter;
  readonly quickFilter: LedgerQuickFilter;
  readonly sortDirection: LedgerSortDirection;
}

export const defaultLedgerFilters: LedgerFilterState = {
  query: '',
  matchId: '',
  eventType: 'all',
  actor: 'all',
  quickFilter: 'all',
  sortDirection: 'desc'
};

const eventTypesByQuickFilter: Record<Exclude<LedgerQuickFilter, 'all'>, readonly LedgerEventType[]> = {
  moves: ['MOVE_RECORDED', 'CASTLING_PERFORMED', 'PAWN_PROMOTED'],
  captures: ['PIECE_CAPTURED'],
  critical: ['CHECK_DECLARED', 'MATCH_FINISHED'],
  snapshots: ['SNAPSHOT_RECORDED']
};

export function filterLedgerEvents(
  events: readonly LedgerEventView[],
  filters: LedgerFilterState
): readonly LedgerEventView[] {
  const query = normalizeFilterValue(filters.query);
  const matchId = normalizeFilterValue(filters.matchId);

  return [...events]
    .filter((event) => {
      if (filters.quickFilter !== 'all' && !eventTypesByQuickFilter[filters.quickFilter].includes(event.type)) {
        return false;
      }

      if (filters.eventType !== 'all' && event.type !== filters.eventType) {
        return false;
      }

      if (filters.actor !== 'all' && event.actor !== filters.actor) {
        return false;
      }

      if (matchId && !normalizeFilterValue(event.matchId).includes(matchId)) {
        return false;
      }

      if (query && !buildSearchableLedgerText(event).includes(query)) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      const direction = filters.sortDirection === 'desc' ? -1 : 1;
      const timeDiff = new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime();
      const sequenceDiff = left.sequence - right.sequence;

      return (timeDiff || sequenceDiff) * direction;
    });
}

export function countLedgerEventsByQuickFilter(
  events: readonly LedgerEventView[],
  filter: LedgerQuickFilter
): number {
  if (filter === 'all') {
    return events.length;
  }

  return events.filter((event) => eventTypesByQuickFilter[filter].includes(event.type)).length;
}

function buildSearchableLedgerText(event: LedgerEventView): string {
  const move = event.payload.move;
  const capturedPiece = event.payload.capturedPiece;
  const snapshot = event.boardSnapshot;

  return [
    event.type,
    ledgerEventTypeLabels[event.type],
    event.actor,
    ledgerActorLabels[event.actor],
    event.message,
    event.matchId,
    String(event.sequence),
    move?.piece,
    move?.color,
    move?.from,
    move?.to,
    move?.san,
    move?.captured,
    move?.promotion,
    capturedPiece?.type,
    capturedPiece?.color,
    capturedPiece?.capturedAt,
    capturedPiece?.moveSan,
    snapshot?.fen,
    snapshot?.status,
    snapshot?.turn,
    snapshot?.winner,
    event.payload.note
  ]
    .filter(isSearchableValue)
    .map((value) => normalizeFilterValue(String(value)))
    .join(' ');
}

function normalizeFilterValue(value: string): string {
  return value.trim().toLowerCase();
}

function isSearchableValue(value: unknown): value is string | number {
  return typeof value === 'string' || typeof value === 'number';
}
