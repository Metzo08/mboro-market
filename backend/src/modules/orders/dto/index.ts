import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsNumber,
  IsObject,
  IsIn,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsObject()
  options?: Record<string, any>;
}

export class CreateOrderDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  shopId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  discount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  tax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  customerNote?: string;

  @IsOptional()
  @IsObject()
  deliveryAddress?: Record<string, any>;

  @IsOptional()
  @IsString()
  pickupPoint?: string;

  // Clé d'idempotence (ORD-006) — obligatoire côté client
  @IsOptional()
  @IsString()
  @Length(8, 100)
  idempotencyKey?: string;

  @IsOptional()
  @IsIn(['ONLINE', 'CASH_ON_DELIVERY', 'PICKUP', 'DEPOSIT', 'INVOICE', 'CONTACT_DIRECT'])
  paymentMethod?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'])
  status: string;

  @IsString()
  actorId: string;

  @IsString()
  actorType: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
