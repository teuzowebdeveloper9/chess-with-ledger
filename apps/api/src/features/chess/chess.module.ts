import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { InfrastructureConfigModule } from '../../infrastructure/config/config.module';
import { ADMIN_TOKEN_PORT } from './application/ports/admin-token.port';
import { CHESS_RULES_ENGINE } from './application/ports/chess-rules-engine.port';
import { LEDGER_REPOSITORY } from './application/ports/ledger-repository.port';
import { MATCH_REALTIME_PUBLISHER } from './application/ports/match-realtime-publisher.port';
import { MATCH_REPOSITORY } from './application/ports/match-repository.port';
import { CreateAdminSessionUseCase } from './application/use-cases/create-admin-session.use-case';
import { CreateOnlineMatchUseCase } from './application/use-cases/create-online-match.use-case';
import { GetMatchUseCase } from './application/use-cases/get-match.use-case';
import { GetScoreboardUseCase } from './application/use-cases/get-scoreboard.use-case';
import { JoinOnlineMatchUseCase } from './application/use-cases/join-online-match.use-case';
import { ListLedgerUseCase } from './application/use-cases/list-ledger.use-case';
import { ListMatchesUseCase } from './application/use-cases/list-matches.use-case';
import { MovePieceUseCase } from './application/use-cases/move-piece.use-case';
import { StartLocalMatchUseCase } from './application/use-cases/start-local-match.use-case';
import { HmacAdminTokenService } from './infrastructure/admin/hmac-admin-token.service';
import { DynamoDbLedgerRepository } from './infrastructure/dynamodb/dynamodb-ledger.repository';
import { PostgresMatchRepository } from './infrastructure/postgres/postgres-match.repository';
import { ChessJsRulesEngine } from './infrastructure/rules/chess-js-rules.engine';
import { AdminController } from './interfaces/http/admin.controller';
import { ChessController } from './interfaces/http/chess.controller';
import { ApplicationErrorFilter } from './interfaces/http/filters/application-error.filter';
import { AdminLedgerGuard } from './interfaces/http/guards/admin-ledger.guard';
import { OnlineMatchGateway } from './interfaces/ws/online-match.gateway';

@Module({
  imports: [InfrastructureConfigModule],
  controllers: [ChessController, AdminController],
  providers: [
    StartLocalMatchUseCase,
    CreateOnlineMatchUseCase,
    JoinOnlineMatchUseCase,
    GetMatchUseCase,
    MovePieceUseCase,
    ListLedgerUseCase,
    ListMatchesUseCase,
    GetScoreboardUseCase,
    CreateAdminSessionUseCase,
    AdminLedgerGuard,
    OnlineMatchGateway,
    {
      provide: CHESS_RULES_ENGINE,
      useClass: ChessJsRulesEngine
    },
    {
      provide: MATCH_REPOSITORY,
      useClass: PostgresMatchRepository
    },
    {
      provide: LEDGER_REPOSITORY,
      useClass: DynamoDbLedgerRepository
    },
    {
      provide: ADMIN_TOKEN_PORT,
      useClass: HmacAdminTokenService
    },
    {
      provide: MATCH_REALTIME_PUBLISHER,
      useExisting: OnlineMatchGateway
    },
    {
      provide: APP_FILTER,
      useClass: ApplicationErrorFilter
    }
  ]
})
export class ChessModule {}
