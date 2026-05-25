import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import type { JoinOnlineMatchRequest } from '@chess-ledger/shared';

export class JoinOnlineMatchDto implements Omit<JoinOnlineMatchRequest, 'roomCode'> {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  blackPlayerName?: string;
}

export class JoinOnlineMatchParamsDto implements Pick<JoinOnlineMatchRequest, 'roomCode'> {
  @IsString()
  @Matches(/^[A-Z2-9]{6,25}$/i)
  roomCode!: string;
}
