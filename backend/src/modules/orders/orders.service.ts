import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, QuoteOrderDto, UpdateOrderStatusDto } from './dto';

/** Transitions autorisées et horodatées (§8.8 / ORD-010). */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SHIPPED', 'DELIVERED', 'COMPLETED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['COMPLETED', 'REFUNDED'],
  COMPLETED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Devis serveur : source unique de vérité pour les montants affichés au client.
   * Aucun prix, stock ou frais n'est accepté depuis le navigateur.
   */
  async quote(dto: QuoteOrderDto) {
    const shop = await this.prisma.shop.findUnique({ where: { id: dto.shopId } });
    if (!shop || shop.status !== 'ACTIVE') {
      throw new NotFoundException('Boutique introuvable ou non active');
    }
    if (!dto.items?.length) {
      throw new BadRequestException('Le panier est vide');
    }

    let subtotal = 0;
    const lines: any[] = [];

    for (const item of dto.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 99) {
        throw new BadRequestException('Quantité invalide');
      }
      if (!item.productId) {
        throw new BadRequestException('Chaque ligne doit référencer un produit');
      }

      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, shopId: dto.shopId, status: 'active' },
        include: { variants: true },
      });
      if (!product) {
        throw new NotFoundException(`Produit indisponible dans cette boutique`);
      }

      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : undefined;
      if (item.variantId && !variant) {
        throw new BadRequestException('Variante inconnue pour ce produit');
      }

      const unitPrice = Number(variant?.price ?? product.promotionalPrice ?? product.price);
      const available = variant ? variant.stock : product.trackInventory ? product.stock : null;
      if (available !== null && available < item.quantity) {
        throw new BadRequestException(`Stock insuffisant pour ${product.title}`);
      }

      subtotal += unitPrice * item.quantity;
      lines.push({
        productId: product.id,
        variantId: variant?.id,
        name: variant ? `${product.title} — ${variant.name}` : product.title,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
        options: item.options ?? {},
      });
    }

    let deliveryFee: number | null = 0;
    let deliveryFeeStatus = 'confirmed';

    if ((dto.fulfillment ?? 'pickup') === 'delivery') {
      if (!dto.deliveryZoneId) {
        // Zone non déterminée : on affiche « à confirmer », jamais un montant fictif.
        deliveryFee = null;
        deliveryFeeStatus = 'to_confirm';
      } else {
        const zone = await this.prisma.deliveryZone.findFirst({
          where: { id: dto.deliveryZoneId, shopId: dto.shopId, isActive: true },
        });
        if (!zone) {
          throw new BadRequestException('Zone de livraison inconnue pour cette boutique');
        }
        if (zone.minOrder && subtotal < Number(zone.minOrder)) {
          throw new BadRequestException(
            `Commande minimum de ${Number(zone.minOrder)} FCFA pour cette zone`,
          );
        }
        deliveryFee = Number(zone.deliveryFee);
        if (zone.freeDeliveryThreshold && subtotal >= Number(zone.freeDeliveryThreshold)) {
          deliveryFee = 0;
        }
      }
    }

    return {
      shop: { id: shop.id, name: shop.name, slug: shop.slug, type: shop.type },
      lines,
      subtotal,
      deliveryFee,
      deliveryFeeStatus,
      total: subtotal + (deliveryFee ?? 0),
      currency: 'XOF',
      fulfillment: dto.fulfillment ?? 'pickup',
    };
  }

  async create(dto: CreateOrderDto, user: { id: string; role: string }) {
    // Idempotence : une même clé ne crée jamais deux commandes.
    if (dto.idempotencyKey) {
      const existing = await this.prisma.order.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: { items: true, statusHistory: true },
      });
      if (existing) {
        if (existing.userId !== user.id) {
          throw new ForbiddenException('Clé de commande déjà utilisée');
        }
        return existing;
      }
    }

    const quote = await this.quote(dto);
    const method =
      dto.fulfillment === 'pickup'
        ? 'PICKUP'
        : dto.paymentMethod === 'cash' || !dto.paymentMethod
          ? 'CASH_ON_DELIVERY'
          : 'ONLINE';
    const paymentStatus = method === 'ONLINE' ? 'CREATED' : 'PENDING';

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Contrôle de stock atomique : la dernière unité ne peut pas être vendue deux fois.
        for (const line of quote.lines) {
          if (line.variantId) {
            const res = await tx.productVariant.updateMany({
              where: { id: line.variantId, stock: { gte: line.quantity } },
              data: { stock: { decrement: line.quantity } },
            });
            if (res.count === 0) {
              throw new BadRequestException(`Stock insuffisant pour ${line.name}`);
            }
          } else {
            const product = await tx.product.findUnique({ where: { id: line.productId } });
            if (product?.trackInventory) {
              const res = await tx.product.updateMany({
                where: { id: line.productId, stock: { gte: line.quantity } },
                data: { stock: { decrement: line.quantity } },
              });
              if (res.count === 0) {
                throw new BadRequestException(`Stock insuffisant pour ${line.name}`);
              }
            }
          }
        }

        return tx.order.create({
          data: {
            orderNumber: `CMD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            userId: user.id,
            shopId: dto.shopId,
            status: 'PENDING',
            paymentStatus: paymentStatus as any,
            paymentMethod: method as any,
            subtotal: quote.subtotal,
            deliveryFee: quote.deliveryFee ?? 0,
            deliveryFeeStatus: quote.deliveryFeeStatus,
            discount: 0,
            tax: 0,
            total: quote.total,
            currency: 'XOF',
            customerNote: dto.customerNote,
            deliveryAddress: (dto.deliveryAddress ?? {}) as any,
            pickupPoint: dto.fulfillment === 'pickup' ? 'Retrait en boutique' : undefined,
            idempotencyKey: dto.idempotencyKey,
            items: {
              create: quote.lines.map((line) => ({
                productId: line.productId,
                variantId: line.variantId,
                name: line.name,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                totalPrice: line.totalPrice,
                options: line.options,
              })),
            },
            statusHistory: {
              create: {
                status: 'PENDING',
                actorId: user.id,
                actorType: 'customer',
                reason: 'Commande créée',
              },
            },
          },
          include: { items: true, statusHistory: true },
        });
      });
    } catch (error: any) {
      // Course entre deux requêtes simultanées avec la même clé.
      if (error?.code === 'P2002' && dto.idempotencyKey) {
        const existing = await this.prisma.order.findUnique({
          where: { idempotencyKey: dto.idempotencyKey },
          include: { items: true, statusHistory: true },
        });
        if (existing) return existing;
      }
      throw error;
    }
  }

  async findAll(user: { id: string; role: string }, shopId?: string) {
    if (['admin', 'super_admin'].includes(user.role)) {
      return this.prisma.order.findMany({
        where: shopId ? { shopId } : undefined,
        include: { items: true, statusHistory: true, shop: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.role === 'merchant') {
      if (shopId) {
        await this.assertShopAccess(shopId, user);
        return this.prisma.order.findMany({
          where: { shopId },
          include: { items: true, statusHistory: true, shop: { select: { name: true, slug: true } } },
          orderBy: { createdAt: 'desc' },
        });
      }
      const shops = await this.prisma.shop.findMany({
        where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] },
        select: { id: true },
      });
      return this.prisma.order.findMany({
        where: { shopId: { in: shops.map((s) => s.id) } },
        include: { items: true, statusHistory: true, shop: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Client : uniquement ses propres commandes, jamais celles d'un autre.
    return this.prisma.order.findMany({
      where: { userId: user.id, ...(shopId ? { shopId } : {}) },
      include: { items: true, statusHistory: true, shop: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: { id: string; role: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payments: true,
        shop: { select: { id: true, name: true, slug: true, phone: true, whatsapp: true } },
      },
    });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    if (['admin', 'super_admin'].includes(user.role)) return order;
    if (order.userId === user.id) return order;
    await this.assertShopAccess(order.shopId, user);
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, user: { id: string; role: string }) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }
    await this.assertShopAccess(order.shopId, user);

    const next = dto.status?.toUpperCase();
    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!next || !allowed.includes(next)) {
      throw new BadRequestException(
        `Transition ${order.status} → ${dto.status} non autorisée`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: next as any,
          ...(next === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
        },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: next as any,
          actorId: user.id,
          actorType: user.role.toLowerCase(),
          reason: dto.reason,
          metadata: dto.metadata,
        },
      });
      return updated;
    });
  }

  private async assertShopAccess(shopId: string, user: { id: string; role: string }) {
    if (['admin', 'super_admin'].includes(user.role)) return;
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { ownerId: true, members: { where: { userId: user.id }, select: { id: true } } },
    });
    if (!shop) throw new NotFoundException('Boutique introuvable');
    if (shop.ownerId !== user.id && shop.members.length === 0) {
      throw new ForbiddenException('Accès refusé à cette boutique');
    }
  }
}
