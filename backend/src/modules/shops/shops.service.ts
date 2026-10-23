import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShopDto, UpdateShopDto } from './dto';

/** Champs réellement publics d'une boutique (§SHOP-006). */
const PUBLIC_SHOP_INCLUDE = {
  categories: {
    where: { isActive: true, isPublic: true },
    orderBy: { sortOrder: 'asc' as const },
  },
  _count: { select: { products: true, reviews: true } },
  subscription: { select: { status: true, nextDueAt: true } },
};

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateShopDto, user: { id: string; role: string }) {
    const existing = await this.prisma.shop.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('Cette boutique existe déjà');
    }

    // L'organisation est vérifiée côté serveur : jamais de confiance au body.
    let organizationId = dto.organizationId;
    if (organizationId) {
      const membership = await this.prisma.organizationMember.findFirst({
        where: { organizationId, userId: user.id },
      });
      const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
      const isOwner = org?.ownerId === user.id;
      if (!membership && !isOwner && !['admin', 'super_admin'].includes(user.role)) {
        throw new ForbiddenException("Vous n'appartenez pas à cette organisation");
      }
    } else {
      const membership = await this.prisma.organizationMember.findFirst({
        where: { userId: user.id },
      });
      if (membership) {
        organizationId = membership.organizationId;
      } else {
        // Repli : création d'une organisation personnelle, jamais confiance au body.
        const organization = await this.prisma.organization.create({
          data: {
            name: `Organisation ${dto.name}`,
            slug: `org-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            ownerId: user.id,
            status: 'active',
            verificationStatus: 'pending',
          },
        });
        await this.prisma.organizationMember.create({
          data: { organizationId: organization.id, userId: user.id, role: 'OWNER' },
        });
        organizationId = organization.id;
      }
    }

    return this.prisma.shop.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        type: (dto.type?.toUpperCase() as any) ?? 'RETAIL',
        description: dto.description,
        shortDescription: dto.shortDescription,
        phone: dto.phone,
        email: dto.email,
        whatsapp: dto.whatsapp,
        publicAddress: dto.publicAddress,
        organization: { connect: { id: organizationId } },
        owner: { connect: { id: user.id } },
        members: { create: { userId: user.id, role: 'OWNER' } },
      },
      include: { organization: true, owner: true },
    });
  }

  /** Annuaire public : uniquement les boutiques ACTIVE, recherche insensible à la casse. */
  async findAll(
    page: number,
    limit: number,
    q?: string,
    type?: string,
    locality?: string,
  ) {
    const where: any = {
      status: 'ACTIVE',
      ...(type ? { type: type.toUpperCase() } : {}),
      ...(locality ? { publicAddress: { contains: locality, mode: 'insensitive' } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { shortDescription: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { publicAddress: { contains: q, mode: 'insensitive' } },
              { categories: { some: { name: { contains: q, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.shop.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: PUBLIC_SHOP_INCLUDE,
        orderBy: [{ verificationStatus: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.shop.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findBySlug(slug: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { slug },
      include: {
        ...PUBLIC_SHOP_INCLUDE,
        products: {
          where: { status: 'active' },
          include: { category: true, variants: true, media: true },
          orderBy: [{ stock: 'desc' }, { createdAt: 'desc' }],
          take: 100,
        },
        services: { where: { status: 'active' } },
      },
    });
    if (!shop) {
      throw new NotFoundException('Boutique introuvable');
    }
    return shop;
  }

  /** Boutiques du commerçant connecté (multi-boutiques, §5). */
  async findMine(userId: string, role: string) {
    return this.prisma.shop.findMany({
      where:
        role === 'admin' || role === 'super_admin'
          ? undefined
          : { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
      include: {
        subscription: true,
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        ...PUBLIC_SHOP_INCLUDE,
        products: {
          where: { status: 'active' },
          include: { category: true, variants: true, media: true },
        },
        services: true,
      },
    });
    if (!shop) {
      throw new NotFoundException('Boutique introuvable');
    }
    return shop;
  }

  async update(id: string, dto: UpdateShopDto, user: { id: string; role: string }) {
    await this.assertCanManage(id, user);

    const data: any = { ...dto };
    if (dto.type) data.type = dto.type.toUpperCase();

    return this.prisma.shop.update({ where: { id }, data });
  }

  async remove(id: string, user: { id: string; role: string }) {
    if (!['admin', 'super_admin'].includes(user.role)) {
      throw new ForbiddenException('Seul un administrateur peut supprimer une boutique');
    }
    return this.prisma.shop.delete({ where: { id } });
  }

  /** Autorisation serveur systématique : cacher un bouton ne protège rien (§6). */
  async assertCanManage(shopId: string, user: { id: string; role: string }) {
    if (['admin', 'super_admin'].includes(user.role)) return;
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
