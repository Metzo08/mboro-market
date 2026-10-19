import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateCategoryFieldDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findFirst({
      where: { slug: dto.slug, shopId: dto.shopId },
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

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) {
      throw new NotFoundException('Catégorie introuvable');
    }
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  async addField(categoryId: string, dto: CreateCategoryFieldDto) {
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
}
