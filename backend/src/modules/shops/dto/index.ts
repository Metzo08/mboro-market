export class CreateShopDto {
  name: string;
  slug: string;
  type?: 'retail' | 'restaurant' | 'service' | 'artisan';
  description?: string;
  shortDescription?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  publicAddress?: string;
  organizationId: string;
  ownerId: string;
}

export class UpdateShopDto {
  name?: string;
  type?: string;
  description?: string;
  shortDescription?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  publicAddress?: string;
}
