import {
  IsString,
  IsOptional,
  IsUUID,
  IsPhoneNumber,
  IsNumber,
  Min,
  IsObject,
} from 'class-validator';
import { Type as TransformType } from 'class-transformer';

export class InitializeWavePaymentDto {
  @IsUUID()
  orderId: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsPhoneNumber('SN')
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}