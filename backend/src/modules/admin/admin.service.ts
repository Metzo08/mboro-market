import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async findSettings(scope?: string) {
    return this.prisma.setting.findMany({
      where: scope ? { scope } : undefined,
      include: { organization: true },
    });
  }

  async createSetting(dto: any) {
    return this.prisma.setting.create({
      data: {
        scope: dto.scope ?? 'global',
        organizationId: dto.organizationId,
        shopId: dto.shopId,
        key: dto.key,
        value: dto.value,
        isValidated: dto.isValidated ?? false,
        version: 1,
      },
    });
  }

  async getAuditLogs(page: number, limit: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { actor: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { items, total, page, limit };
  }
}
