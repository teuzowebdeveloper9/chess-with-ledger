import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import type { BoardSquare, MovePieceRequest, PromotionPieceType } from '@chess-ledger/shared';

export class MovePieceDto implements MovePieceRequest {
  @Matches(/^[a-h][1-8]$/)
  from!: BoardSquare;

  @Matches(/^[a-h][1-8]$/)
  to!: BoardSquare;

  @IsOptional()
  @IsIn(['queen', 'rook', 'bishop', 'knight'])
  promotion?: PromotionPieceType;

  @IsOptional()
  @IsString()
  @MinLength(12)
  @MaxLength(40)
  playerToken?: string;
}
