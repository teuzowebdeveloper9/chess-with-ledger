import { IsString, MinLength } from 'class-validator';
import type { AdminSessionRequest } from '@chess-ledger/shared';

export class AdminSessionDto implements AdminSessionRequest {
  @IsString()
  @MinLength(1)
  password!: string;
}
