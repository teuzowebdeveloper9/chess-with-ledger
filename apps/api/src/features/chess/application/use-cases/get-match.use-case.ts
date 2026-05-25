import { Inject, Injectable } from '@nestjs/common';
import type { MatchView } from '@chess-ledger/shared';

import { MatchNotFoundError } from '../errors/application.error';
import { toMatchView } from '../mappers/match-view.mapper';
import { MATCH_REPOSITORY, type MatchRepository } from '../ports/match-repository.port';

@Injectable()
export class GetMatchUseCase {
  constructor(@Inject(MATCH_REPOSITORY) private readonly matches: MatchRepository) {}

  async execute(matchId: string): Promise<MatchView> {
    const match = await this.matches.findById(matchId);
    if (!match) {
      throw new MatchNotFoundError(matchId);
    }

    return toMatchView(match);
  }
}
