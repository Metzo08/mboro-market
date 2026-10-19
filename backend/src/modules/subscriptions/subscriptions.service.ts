import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.subscription.create({
      data: {
        shopId: dto.shopId,
        status: dto.status ?? 'PENDING_ACTIVATION',
        planName: dto.planName ?? 'basic',
        price: dto.price ?? 2500,
        currency: dto.currency ?? 'XOF',
        billingPeriod: dto.billingPeriod ?? 'monthly',
        startedAt: new Date(),
        nextDueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async findByShop(shopId: string) {
    return this.prisma.subscription.findMany({ where: { shopId } });
  }

  async updateStatus(id: string, dto: any) {
    return this.prisma.subscription.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
