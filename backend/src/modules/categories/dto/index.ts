import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Length,
  IsObject,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(2, 120)
  name: string;

  @IsString()
  @Length(2, 140)
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCategoryFieldDto {
  @IsString()
  @Length(2, 80)
  name: string;

  @IsObject()
  label: Record<string, string>;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsObject()
  helpText?: Record<string, string>;

  @IsOptional()
  @IsObject()
  validation?: Record<string, any>;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsObject()
  defaultValue?: Record<string, any>;
}
