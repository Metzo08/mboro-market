import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeliveryZoneDto, DeliveryTaskDto } from './dto';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async createZone(dto: DeliveryZoneDto) {
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

  async createTask(dto: DeliveryTaskDto) {
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
}
