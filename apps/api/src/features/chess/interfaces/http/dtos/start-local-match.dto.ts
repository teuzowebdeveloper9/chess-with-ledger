import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { StartLocalMatchRequest } from '@chess-ledger/shared';

export class StartLocalMatchDto implements StartLocalMatchRequest {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  whitePlayerName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  blackPlayerName?: string;
}
