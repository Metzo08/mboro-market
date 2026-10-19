import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShopDto, UpdateShopDto } from './dto';

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateShopDto) {
    const existing = await this.prisma.shop.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Cette boutique existe déjà');
    }

    return this.prisma.shop.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        type: (dto.type as any) ?? 'RETAIL',
        description: dto.description,
        shortDescription: dto.shortDescription,
        phone: dto.phone,
        email: dto.email,
        whatsapp: dto.whatsapp,
        publicAddress: dto.publicAddress,
        organization: { connect: { id: dto.organizationId } },
        owner: { connect: { id: dto.ownerId } },
      },
      include: { organization: true, owner: true },
    });
  }

  async findAll(page: number, limit: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.shop.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          organization: true,
          owner: true,
          _count: { select: { products: true, orders: true } },
        },
      }),
      this.prisma.shop.count(),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        organization: true,
        owner: true,
        categories: true,
        products: true,
        services: true,
        subscription: true,
      },
    });
    if (!shop) {
      throw new NotFoundException('Boutique introuvable');
    }
    return shop;
  }

  async update(id: string, dto: UpdateShopDto) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) {
      throw new NotFoundException('Boutique introuvable');
    }
    return this.prisma.shop.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    return this.prisma.shop.delete({ where: { id } });
  }
}
