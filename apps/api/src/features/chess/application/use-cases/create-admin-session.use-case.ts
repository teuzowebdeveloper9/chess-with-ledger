import { Inject, Injectable } from '@nestjs/common';

import { AppConfigService } from '../../../../infrastructure/config/app-config.service';
import { InvalidAdminPasswordError } from '../errors/application.error';
import { ADMIN_TOKEN_PORT, type AdminTokenPort } from '../ports/admin-token.port';

@Injectable()
export class CreateAdminSessionUseCase {
  constructor(
    private readonly config: AppConfigService,
    @Inject(ADMIN_TOKEN_PORT) private readonly tokens: AdminTokenPort
  ) {}

  execute(password: string) {
    if (password !== this.config.adminLedgerPassword) {
      throw new InvalidAdminPasswordError();
    }

    return this.tokens.issue();
  }
}
