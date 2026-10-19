export class CreateProductDto {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  promotionalPrice?: number;
  sku?: string;
  stock?: number;
  trackInventory?: boolean;
  status?: string;
  weight?: number;
  dimensions?: Record<string, any>;
  availability?: string;
  leadTime?: string;
  conditions?: string;
  seoTitle?: string;
  seoDescription?: string;
  customFields?: Record<string, any>;
  shopId: string;
  categoryId?: string;
}

export class UpdateProductDto {
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  price?: number;
  promotionalPrice?: number;
  sku?: string;
  stock?: number;
  trackInventory?: boolean;
  status?: string;
  weight?: number;
  dimensions?: Record<string, any>;
  availability?: string;
  leadTime?: string;
  conditions?: string;
  seoTitle?: string;
  seoDescription?: string;
  customFields?: Record<string, any>;
}
