import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';

// Transitions autorisées (ORD-010)
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SHIPPED', 'COMPLETED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['COMPLETED', 'REFUNDED'],
  COMPLETED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private async assertShopAccess(shopId: string, userId: string, role: string) {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return;
    const membership = await this.prisma.shopMember.findFirst({
      where: { shopId, userId },
    });
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { ownerId: true },
    });
    if (!membership && shop?.ownerId !== userId) {
      throw new ForbiddenException('Accès refusé à cette boutique');
    }
  }

  async create(dto: CreateOrderDto, actor?: { id: string; role: string }) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('La commande doit contenir au moins un article');
    }
    // Anti-usurpation (ORD-011) : userId = utilisateur authentifié, jamais le client
    let customerId = actor?.id ?? dto.userId;
    if (!customerId) {
      // Commande invité (ORD-002) : identifier ou créer un compte avec le téléphone
      const phone = (dto.deliveryAddress as any)?.phone || 'guest-' + Date.now();
      let guestUser = await this.prisma.user.findUnique({ where: { phone } });
      if (!guestUser) {
        guestUser = await this.prisma.user.create({
          data: { phone, status: 'ACTIVE', role: 'CUSTOMER' },
        });
      }
      customerId = guestUser.id;
    }

    let subtotal = 0;
    const items: any[] = [];

    for (const item of dto.items) {
      let unitPrice = 0;
      if (item.productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(`Produit ${item.productId} introuvable`);
        }
        if (product.trackInventory && product.stock < item.quantity) {
          throw new BadRequestException(`Stock insuffisant pour ${product.title}`);
        }
        const eff = product.promotionalPrice != null ? Number(product.promotionalPrice) : Number(product.price);
        unitPrice = Math.round(eff);
        items.push({
          productId: item.productId,
          variantId: item.variantId,
          name: product.title,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
          options: item.options,
        });
      }
      subtotal += unitPrice * item.quantity;
    }

    const discount = Math.max(0, Math.round(dto.discount ?? 0));
    const tax = Math.max(0, Math.round(dto.tax ?? 0));
    const deliveryFee = Math.max(0, Math.round(dto.deliveryFee ?? 0));
    if (discount > subtotal) throw new BadRequestException('Remise superieure au sous-total');
    const total = subtotal + deliveryFee + tax - discount;

    const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let orderNumber = `CMD-${day}-${Math.floor(1000 + Math.random() * 9000)}`;
    for (let i = 0; i < 5; i++) {
      const e = await this.prisma.order.findUnique({ where: { orderNumber } });
      if (!e) break;
      orderNumber = `CMD-${day}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: customerId,
          shopId: dto.shopId,
          subtotal,
          discount,
          tax,
          deliveryFee,
          total,
          currency: dto.currency ?? 'XOF',
          customerNote: dto.customerNote,
          internalNote: dto.idempotencyKey ? `IDEM:${dto.idempotencyKey}` : undefined,
          deliveryAddress: (dto.deliveryAddress ?? {}) as any,
          pickupPoint: dto.pickupPoint,
          paymentMethod: (dto.paymentMethod as any) ?? 'CASH_ON_DELIVERY',
          items: {
            create: items,
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              actorId: customerId,
              actorType: 'customer',
              reason: 'Commande créée',
            },
          },
        },
        include: { items: true, statusHistory: true },
      });

      for (const item of dto.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return order;
    });
  }

  async findAll(shopId?: string, userId?: string, requester?: { id: string; role: string }) {
    const where: any = {};
    if (shopId) where.shopId = shopId;
    if (userId) where.userId = userId;
    if (!shopId && !userId && requester && requester.role !== 'SUPER_ADMIN' && requester.role !== 'ADMIN') {
      where.userId = requester.id;
    }
    return this.prisma.order.findMany({
      where,
      include: { items: true, statusHistory: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, requester?: { id: string; role: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, statusHistory: true, payments: true },
    });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }
    if (requester && requester.role !== 'SUPER_ADMIN' && requester.role !== 'ADMIN') {
      if (order.userId !== requester.id) {
        await this.assertShopAccess(order.shopId, requester.id, requester.role);
      }
    }
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, requester?: { id: string; role: string }) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }
    if (requester && requester.role !== 'SUPER_ADMIN' && requester.role !== 'ADMIN') {
      await this.assertShopAccess(order.shopId, requester.id, requester.role);
    }
    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Transition interdite : ${order.status} -> ${dto.status}`,
      );
    }
    const needsRestock = dto.status === 'CANCELLED' && ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status);
    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: { status: dto.status as any } });
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: dto.status as any,
          actorId: requester?.id ?? dto.actorId,
          actorType: dto.actorType ?? 'merchant',
          reason: dto.reason,
          metadata: dto.metadata as any,
        },
      });
      if (needsRestock) {
        const lines = await tx.orderItem.findMany({ where: { orderId: id } });
        for (const line of lines) {
          if (line.productId) {
            await tx.product.update({
              where: { id: line.productId },
              data: { stock: { increment: line.quantity } },
            });
          }
        }
      }
      return tx.order.findUnique({ where: { id }, include: { items: true, statusHistory: true } });
    });
  }
}
