import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { isAdminRole } from '../../common/auth/roles';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto, user: { id: string; role: string }) {
    await this.assertCanManageShop(dto.shopId, user);

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

  /**
   * Catalogue public : produits actifs d'une boutique ACTIVE uniquement.
   * `q` permet une recherche simple et tolérante à la casse (SRCH-001).
   */
  async findAll(
    shopId?: string,
    categoryId?: string,
    page: number = 1,
    limit: number = 20,
    q?: string,
  ) {
    const where: any = {
      status: 'active',
      ...(shopId ? { shopId } : {}),
      ...(categoryId ? { categoryId } : {}),
      shop: { status: 'ACTIVE' },
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { shortDescription: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { category: { name: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: Math.min(limit, 60),
        include: {
          variants: true,
          category: true,
          media: true,
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              verificationStatus: true,
              publicAddress: true,
              deliveryZones: true,
            },
          },
        },
        orderBy: [{ promotionalPrice: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'active', shop: { status: 'ACTIVE' } },
      include: {
        variants: true,
        category: true,
        media: true,
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            phone: true,
            whatsapp: true,
            publicAddress: true,
            verificationStatus: true,
            openingHours: true,
            deliveryZones: true,
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    return product;
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true, category: true, media: true, shop: true },
    });
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto, user: { id: string; role: string }) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    await this.assertCanManageShop(product.shopId, user);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string, user: { id: string; role: string }) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    await this.assertCanManageShop(product.shopId, user);
    return this.prisma.product.delete({ where: { id } });
  }

  private async assertCanManageShop(shopId: string, user: { id: string; role: string }) {
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
