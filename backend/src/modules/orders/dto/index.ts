/**
 * Le client ne fournit JAMAIS de montant (prix, livraison, remise, taxe).
 * Tout est recalculé côté serveur (§10.2 / ORD-003).
 */
export class CreateOrderDto {
  shopId: string;
  items: Array<{
    productId?: string;
    variantId?: string;
    quantity: number;
    options?: Record<string, any>;
  }>;
  fulfillment: 'delivery' | 'pickup';
  deliveryZoneId?: string;
  deliveryAddress?: {
    locality?: string;
    district?: string;
    landmark?: string;
    phone?: string;
    instructions?: string;
  };
  paymentMethod?: 'cash' | 'wave' | 'orange_money' | 'card';
  customerNote?: string;
  /** Clé d'idempotence générée côté client, unique en base. */
  idempotencyKey?: string;
}

export class QuoteOrderDto {
  shopId: string;
  items: CreateOrderDto['items'];
  fulfillment?: 'delivery' | 'pickup';
  deliveryZoneId?: string;
}

export class UpdateOrderStatusDto {
  status: string;
  reason?: string;
  metadata?: Record<string, any>;
}
