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
  /** Optionnel : vérifié côté serveur, jamais l'ownerId (dérivé du JWT). */
  organizationId?: string;
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
  openingHours?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  deliveryZones?: unknown[];
  seoTitle?: string;
  seoDescription?: string;
}
