import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  IsBoolean,
  IsObject,
  Length,
} from 'class-validator';

export class CreateSettingDto {
  @IsOptional()
  @IsIn(['global', 'organization', 'shop'])
  scope?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsString()
  @Length(1, 200)
  key: string;

  @IsObject()
  value: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isValidated?: boolean;
}