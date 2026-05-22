import { Module } from '@nestjs/common';

import { ChessModule } from './features/chess/chess.module';
import { InfrastructureConfigModule } from './infrastructure/config/config.module';

@Module({
  imports: [InfrastructureConfigModule, ChessModule]
})
export class AppModule {}
