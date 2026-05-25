import type { MatchView } from '@chess-ledger/shared';

export interface MatchRealtimePublisher {
  readonly publishMatchUpdated: (match: MatchView) => void;
}

export const MATCH_REALTIME_PUBLISHER = Symbol('MATCH_REALTIME_PUBLISHER');
