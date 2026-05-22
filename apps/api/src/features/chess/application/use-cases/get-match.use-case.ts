import { Inject, Injectable } from '@nestjs/common';

import type { MatchAggregate } from '../../domain/match.aggregate';
import { MatchNotFoundError } from '../errors/application.error';
import { MATCH_REPOSITORY, type MatchRepository } from '../ports/match-repository.port';

@Injectable()
export class GetMatchUseCase {
  constructor(@Inject(MATCH_REPOSITORY) private readonly matches: MatchRepository) {}

  async execute(matchId: string): Promise<MatchAggregate> {
    const match = await this.matches.findById(matchId);
    if (!match) {
      throw new MatchNotFoundError(matchId);
    }

    return match;
  }
}
