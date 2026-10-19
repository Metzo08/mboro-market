import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.notification.create({
      data: {
        recipientId: dto.recipientId,
        shopId: dto.shopId,
        channel: dto.channel ?? 'IN_APP',
        template: dto.template,
        subject: dto.subject,
        content: dto.content,
        status: 'PENDING',
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { status: 'READ', readAt: new Date() },
    });
  }
}
