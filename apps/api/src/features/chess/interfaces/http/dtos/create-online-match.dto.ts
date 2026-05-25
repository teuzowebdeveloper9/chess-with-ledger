import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { CreateOnlineMatchRequest } from '@chess-ledger/shared';

export class CreateOnlineMatchDto implements CreateOnlineMatchRequest {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  whitePlayerName?: string;
}
