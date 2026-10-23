import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { isAdminRole } from '../../common/auth/roles';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async createZone(dto: any, user?: { id: string; role: string }) {
    if (user) await this.assertShopAccess(dto.shopId, user);
    return this.prisma.deliveryZone.create({
      data: {
        shopId: dto.shopId,
        name: dto.name,
        territories: dto.territories ?? [],
        priceRules: dto.priceRules ?? {},
        minOrder: dto.minOrder ?? 0,
        deliveryFee: dto.deliveryFee ?? 0,
        estimatedMin: dto.estimatedMin,
        estimatedMax: dto.estimatedMax,
        days: dto.days ?? [],
        hours: dto.hours ?? {},
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findZonesByShop(shopId: string) {
    return this.prisma.deliveryZone.findMany({ where: { shopId } });
  }

  async createTask(dto: any, user?: { id: string; role: string }) {
    if (user) await this.assertShopAccess(dto.shopId, user);
    return this.prisma.deliveryTask.create({
      data: {
        orderId: dto.orderId,
        shopId: dto.shopId,
        assigneeId: dto.assigneeId,
        steps: dto.steps ?? [],
        status: dto.status ?? 'pending',
      },
    });
  }

  private async assertShopAccess(shopId: string, user: { id: string; role: string }) {
    if (isAdminRole(user.role)) return;
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
