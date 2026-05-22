import type { LedgerEventView } from '@chess-ledger/shared';

export type LedgerEventDraft = Omit<LedgerEventView, 'id' | 'matchId' | 'sequence'>;

export interface LedgerRepository {
  readonly append: (matchId: string, events: readonly LedgerEventDraft[]) => Promise<readonly LedgerEventView[]>;
  readonly list: (matchId?: string) => Promise<readonly LedgerEventView[]>;
}

export const LEDGER_REPOSITORY = Symbol('LEDGER_REPOSITORY');
