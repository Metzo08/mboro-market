export class CreateOrderDto {
  userId: string;
  shopId: string;
  items: Array<{
    productId?: string;
    variantId?: string;
    quantity: number;
    options?: Record<string, any>;
  }>;
  discount?: number;
  tax?: number;
  deliveryFee?: number;
  currency?: string;
  customerNote?: string;
  deliveryAddress?: Record<string, any>;
  pickupPoint?: string;
}

export class UpdateOrderStatusDto {
  status: string;
  actorId: string;
  actorType: string;
  reason?: string;
  metadata?: Record<string, any>;
}
