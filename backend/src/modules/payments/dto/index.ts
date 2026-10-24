import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  IsPhoneNumber,
  IsNumber,
  Min,
  IsObject,
  Length,
} from 'class-validator';
import { Type as TransformType } from 'class-transformer';

export class InitializePaymentDto {
  @IsUUID()
  orderId: string;

  @IsOptional()
  @IsIn(['wave', 'paydunya', 'sandbox'])
  provider?: string;

  @IsOptional()
  @IsIn(['wave', 'paydunya', 'cod', 'pickup'])
  paymentMethod?: string;

  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsPhoneNumber('SN')
  phone?: string;
}

export class RefundDto {
  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;

  @IsOptional()
  @TransformType(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  amount?: number;
}