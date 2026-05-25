import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CreateOnlineMatchUseCase } from '../../application/use-cases/create-online-match.use-case';
import { GetMatchUseCase } from '../../application/use-cases/get-match.use-case';
import { GetScoreboardUseCase } from '../../application/use-cases/get-scoreboard.use-case';
import { JoinOnlineMatchUseCase } from '../../application/use-cases/join-online-match.use-case';
import { ListMatchesUseCase } from '../../application/use-cases/list-matches.use-case';
import { MovePieceUseCase } from '../../application/use-cases/move-piece.use-case';
import { StartLocalMatchUseCase } from '../../application/use-cases/start-local-match.use-case';
import { CreateOnlineMatchDto } from './dtos/create-online-match.dto';
import { JoinOnlineMatchDto, JoinOnlineMatchParamsDto } from './dtos/join-online-match.dto';
import { MovePieceDto } from './dtos/move-piece.dto';
import { StartLocalMatchDto } from './dtos/start-local-match.dto';

@Controller('matches')
export class ChessController {
  constructor(
    private readonly startLocalMatch: StartLocalMatchUseCase,
    private readonly createOnlineMatch: CreateOnlineMatchUseCase,
    private readonly joinOnlineMatch: JoinOnlineMatchUseCase,
    private readonly getMatch: GetMatchUseCase,
    private readonly movePiece: MovePieceUseCase,
    private readonly listMatches: ListMatchesUseCase,
    private readonly getScoreboard: GetScoreboardUseCase
  ) {}

  @Post()
  start(@Body() dto: StartLocalMatchDto) {
    return this.startLocalMatch.execute(dto);
  }

  @Post('online')
  createOnline(@Body() dto: CreateOnlineMatchDto) {
    return this.createOnlineMatch.execute(dto);
  }

  @Post('online/:roomCode/join')
  joinOnline(@Param() params: JoinOnlineMatchParamsDto, @Body() dto: JoinOnlineMatchDto) {
    return this.joinOnlineMatch.execute({
      roomCode: params.roomCode,
      ...dto
    });
  }

  @Get()
  list() {
    return this.listMatches.execute();
  }

  @Get('scoreboard')
  scoreboard() {
    return this.getScoreboard.execute();
  }

  @Get(':matchId')
  find(@Param('matchId') matchId: string) {
    return this.getMatch.execute(matchId);
  }

  @Post(':matchId/moves')
  move(@Param('matchId') matchId: string, @Body() dto: MovePieceDto) {
    return this.movePiece.execute(matchId, dto);
  }
}
