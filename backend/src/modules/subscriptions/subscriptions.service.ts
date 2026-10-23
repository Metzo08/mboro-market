import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { isAdminRole } from '../../common/auth/roles';

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

  async findByShop(shopId: string, user: { id: string; role: string }) {
    if (!isAdminRole(user.role)) {
      const shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        select: { ownerId: true, members: { where: { userId: user.id }, select: { id: true } } },
      });
      if (!shop) throw new NotFoundException('Boutique introuvable');
      if (shop.ownerId !== user.id && shop.members.length === 0) {
        throw new ForbiddenException('Accès refusé à cette boutique');
      }
    }
    return this.prisma.subscription.findMany({ where: { shopId } });
  }

  async updateStatus(id: string, dto: any) {
    return this.prisma.subscription.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
