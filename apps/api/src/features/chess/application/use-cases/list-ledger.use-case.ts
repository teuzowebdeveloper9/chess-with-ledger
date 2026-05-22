import { Inject, Injectable } from '@nestjs/common';

import { LEDGER_REPOSITORY, type LedgerRepository } from '../ports/ledger-repository.port';

@Injectable()
export class ListLedgerUseCase {
  constructor(@Inject(LEDGER_REPOSITORY) private readonly ledger: LedgerRepository) {}

  execute(matchId?: string) {
    return this.ledger.list(matchId);
  }
}
