import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  IsBoolean,
} from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  shopId: string;

  @IsOptional()
  @IsString()
  planName?: string;

  @IsOptional()
  @IsBoolean()
  withActivation?: boolean;
}

export class UpdateSubscriptionStatusDto {
  @IsString()
  @IsIn([
    'PENDING_ACTIVATION', 'TRIAL', 'ACTIVE', 'PAST_DUE',
    'GRACE_PERIOD', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'REFUNDED',
  ])
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}