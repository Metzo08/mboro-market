import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findFirst({
      where: { slug: dto.slug, shopId: dto.shopId },
    });
    if (existing) {
      throw new ConflictException('Ce produit existe déjà');
    }

    return this.prisma.product.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        price: dto.price,
        promotionalPrice: dto.promotionalPrice,
        sku: dto.sku,
        stock: dto.stock ?? 0,
        trackInventory: dto.trackInventory ?? true,
        status: dto.status ?? 'active',
        weight: dto.weight,
        dimensions: dto.dimensions,
        availability: dto.availability ?? 'in_stock',
        leadTime: dto.leadTime,
        conditions: dto.conditions,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        customFields: dto.customFields,
        shop: { connect: { id: dto.shopId } },
        category: dto.categoryId ? { connect: { id: dto.categoryId } } : undefined,
      },
      include: { variants: true, category: true },
    });
  }

  async findAll(shopId?: string, categoryId?: string, page: number = 1, limit: number = 20) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: { shopId, categoryId, status: 'active' },
        skip: (page - 1) * limit,
        take: limit,
        include: { variants: true, category: true, media: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where: { shopId, categoryId, status: 'active' } }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true, category: true, media: true },
    });
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
