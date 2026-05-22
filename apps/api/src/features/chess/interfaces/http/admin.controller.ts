import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { CreateAdminSessionUseCase } from '../../application/use-cases/create-admin-session.use-case';
import { ListLedgerUseCase } from '../../application/use-cases/list-ledger.use-case';
import { AdminSessionDto } from './dtos/admin-session.dto';
import { AdminLedgerGuard } from './guards/admin-ledger.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly createAdminSession: CreateAdminSessionUseCase,
    private readonly listLedger: ListLedgerUseCase
  ) {}

  @Post('session')
  createSession(@Body() dto: AdminSessionDto) {
    return this.createAdminSession.execute(dto.password);
  }

  @Get('ledger')
  @UseGuards(AdminLedgerGuard)
  ledger(@Query('matchId') matchId?: string) {
    return this.listLedger.execute(matchId);
  }
}
