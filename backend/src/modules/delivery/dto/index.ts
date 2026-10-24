import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  IsNumber,
  Min,
  IsInt,
  IsObject,
  IsBoolean,
  IsEnum,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DeliveryDays { LUNDI='lundi', MARDI='mardi', MERCREDI='mercredi', JEUDI='jeudi', VENDREDI='vendredi', SAMEDI='samedi', DIMANCHE='dimanche' }

export class DeliveryZoneDto {
  @IsUUID()
  shopId: string;

  @IsString()
  @Length(2, 120)
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  territories?: string[];

  @IsOptional()
  @IsObject()
  priceRules?: Record<string, any>;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  minOrder?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  estimatedMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  estimatedMax?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(DeliveryDays, { each: true })
  @Type(() => String)
  days?: string[];

  @IsOptional()
  @IsObject()
  hours?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class DeliveryTaskDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  shopId: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  steps?: string[];

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  proof?: string;
}