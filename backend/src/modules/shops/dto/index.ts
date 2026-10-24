import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  Length,
  IsEmail,
  IsObject,
} from 'class-validator';

export class CreateShopDto {
  @IsString()
  @Length(2, 120)
  name: string;

  @IsString()
  @Length(2, 140)
  slug: string;

  @IsOptional()
  @IsEnum(['RETAIL', 'RESTAURANT', 'SERVICE', 'ARTISAN', 'retail', 'restaurant', 'service', 'artisan'] as any)
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  publicAddress?: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  ownerId: string;
}

export class UpdateShopDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  publicAddress?: string;

  @IsOptional()
  @IsObject()
  openingHours?: Record<string, any>;

  @IsOptional()
  seoTitle?: string;

  @IsOptional()
  seoDescription?: string;

  @IsOptional()
  @IsObject()
  paymentSettings?: {
    waveApiKey?: string;
    waveSecretKey?: string;
    waveBusinessId?: string;
    paydunyaApiKey?: string;
    paydunyaApiToken?: string;
    acceptedPaymentMethods?: ('wave' | 'paydunya' | 'cod' | 'pickup')[];
  };
}
