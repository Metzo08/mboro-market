import {
  IsString,
  IsOptional,
  IsUUID,
  IsEmail,
  Length,
} from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @Length(2, 120)
  name: string;

  @IsOptional()
  @IsString()
  @Length(2, 180)
  legalName?: string;

  @IsString()
  @Length(2, 140)
  slug: string;

  @IsOptional()
  @IsString()
  @Length(8, 128)
  contactPhone?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  address?: string;

  @IsUUID()
  ownerId: string;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 180)
  legalName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 140)
  slug?: string;

  @IsOptional()
  @IsString()
  @Length(8, 128)
  contactPhone?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  address?: string;
}
