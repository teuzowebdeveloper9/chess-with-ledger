import { Inject, Injectable } from '@nestjs/common';

import { MATCH_REPOSITORY, type MatchRepository } from '../ports/match-repository.port';

@Injectable()
export class GetScoreboardUseCase {
  constructor(@Inject(MATCH_REPOSITORY) private readonly matches: MatchRepository) {}

  execute() {
    return this.matches.getScoreboard();
  }
}
