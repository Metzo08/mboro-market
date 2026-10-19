import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const shop = await this.prisma.shop.findUnique({ where: { id: dto.shopId } });
    if (!shop) {
      throw new NotFoundException('Boutique introuvable');
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
        unitPrice = Number(product.price);
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

    const total = subtotal + (dto.deliveryFee ?? 0) + (dto.tax ?? 0) - (dto.discount ?? 0);

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: `CMD-${Date.now()}`,
          userId: dto.userId,
          shopId: dto.shopId,
          subtotal,
          discount: dto.discount ?? 0,
          tax: dto.tax ?? 0,
          deliveryFee: dto.deliveryFee ?? 0,
          total,
          currency: dto.currency ?? 'XOF',
          customerNote: dto.customerNote,
          deliveryAddress: dto.deliveryAddress,
          pickupPoint: dto.pickupPoint,
          items: {
            create: items,
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              actorId: dto.userId,
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

  async findAll(shopId?: string, userId?: string) {
    return this.prisma.order.findMany({
      where: { shopId, userId },
      include: { items: true, statusHistory: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, statusHistory: true, payments: true },
    });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    return this.prisma.$transaction([
      this.prisma.order.update({
        where: { id },
        data: { status: dto.status as any },
      }),
      this.prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: dto.status as any,
          actorId: dto.actorId,
          actorType: dto.actorType,
          reason: dto.reason,
          metadata: dto.metadata,
        },
      }),
    ]);
  }
}
