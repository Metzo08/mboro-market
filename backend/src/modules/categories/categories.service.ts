import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateCategoryFieldDto } from './dto';
import { isAdminRole } from '../../common/auth/roles';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto, user: { id: string; role: string }) {
    // Les catégories globales (shopId null) sont réservées aux administrateurs.
    if (!dto.shopId && !isAdminRole(user.role)) {
      throw new ForbiddenException('Seul un administrateur peut créer une catégorie globale');
    }
    if (dto.shopId) await this.assertShopAccess(dto.shopId, user);

    const existing = await this.prisma.category.findFirst({
      where: { slug: dto.slug, shopId: dto.shopId ?? null },
    });
    if (existing) {
      throw new ConflictException('Cette catégorie existe déjà');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon,
        image: dto.image,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        sortOrder: dto.sortOrder ?? 0,
        isPublic: dto.isPublic ?? true,
        isActive: dto.isActive ?? true,
        shop: dto.shopId ? { connect: { id: dto.shopId } } : undefined,
        parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
      },
    });
  }

  async findAll(shopId?: string, parentId?: string) {
    return this.prisma.category.findMany({
      where: {
        shopId,
        parentId: parentId || null,
        isActive: true,
      },
      include: { children: true, _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        fields: true,
        products: true,
        parent: true,
      },
    });
    if (!cat) {
      throw new NotFoundException('Catégorie introuvable');
    }
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto, user: { id: string; role: string }) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) {
      throw new NotFoundException('Catégorie introuvable');
    }
    if (!cat.shopId && !isAdminRole(user.role)) {
      throw new ForbiddenException('Catégorie globale non modifiable');
    }
    if (cat.shopId) await this.assertShopAccess(cat.shopId, user);
    return this.prisma.category.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  async addField(categoryId: string, dto: CreateCategoryFieldDto, user: { id: string; role: string }) {
    const cat = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) {
      throw new NotFoundException('Catégorie introuvable');
    }
    if (!cat.shopId && !isAdminRole(user.role)) {
      throw new ForbiddenException('Catégorie globale non modifiable');
    }
    if (cat.shopId) await this.assertShopAccess(cat.shopId, user);
    return this.prisma.categoryField.create({
      data: {
        categoryId,
        name: dto.name,
        label: dto.label,
        type: dto.type,
        isRequired: dto.isRequired ?? false,
        helpText: dto.helpText,
        validation: dto.validation,
        sortOrder: dto.sortOrder ?? 0,
        isFilterable: dto.isFilterable ?? false,
        unit: dto.unit,
        defaultValue: dto.defaultValue,
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
