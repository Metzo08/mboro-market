export class CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder?: number;
  isPublic?: boolean;
  isActive?: boolean;
  shopId?: string;
  parentId?: string;
}

export class UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder?: number;
  isPublic?: boolean;
  isActive?: boolean;
}

export class CreateCategoryFieldDto {
  name: string;
  label: Record<string, string>;
  type?: string;
  isRequired?: boolean;
  helpText?: Record<string, string>;
  validation?: Record<string, any>;
  sortOrder?: number;
  isFilterable?: boolean;
  unit?: string;
  defaultValue?: Record<string, any>;
}
