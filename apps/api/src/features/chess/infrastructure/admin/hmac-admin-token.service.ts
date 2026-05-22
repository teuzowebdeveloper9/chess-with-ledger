import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';

import { AppConfigService } from '../../../../infrastructure/config/app-config.service';
import type { AdminTokenPayload, AdminTokenPort } from '../../application/ports/admin-token.port';

@Injectable()
export class HmacAdminTokenService implements AdminTokenPort {
  private readonly secret: string;

  constructor(config: AppConfigService) {
    this.secret = config.adminSessionSecret;
  }

  issue(): AdminTokenPayload & { readonly token: string } {
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString();
    const payload: AdminTokenPayload = {
      subject: 'admin-ledger',
      expiresAt
    };
    const encodedPayload = this.encode(JSON.stringify(payload));
    const signature = this.sign(encodedPayload);

    return {
      ...payload,
      token: `${encodedPayload}.${signature}`
    };
  }

  verify(token: string): AdminTokenPayload | null {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) {
      return null;
    }

    const expectedSignature = this.sign(encodedPayload);
    if (!this.safeEqual(signature, expectedSignature)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as AdminTokenPayload;
    if (payload.subject !== 'admin-ledger' || Date.parse(payload.expiresAt) <= Date.now()) {
      return null;
    }

    return payload;
  }

  private sign(value: string): string {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }

  private encode(value: string): string {
    return Buffer.from(value, 'utf8').toString('base64url');
  }

  private safeEqual(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);
    return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
  }
}
