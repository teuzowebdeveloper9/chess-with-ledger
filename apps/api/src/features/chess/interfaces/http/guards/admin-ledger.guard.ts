import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { ADMIN_TOKEN_PORT, type AdminTokenPort } from '../../../application/ports/admin-token.port';

interface RequestLike {
  readonly headers: {
    readonly authorization?: string | readonly string[];
  };
}

@Injectable()
export class AdminLedgerGuard implements CanActivate {
  constructor(@Inject(ADMIN_TOKEN_PORT) private readonly tokens: AdminTokenPort) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestLike>();
    const authorization = request.headers.authorization;
    const header = Array.isArray(authorization) ? authorization[0] : authorization;
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

    if (!token || !this.tokens.verify(token)) {
      throw new UnauthorizedException('Admin ledger access denied.');
    }

    return true;
  }
}
