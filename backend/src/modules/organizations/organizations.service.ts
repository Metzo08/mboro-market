import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Cette organisation existe déjà');
    }

    return this.prisma.organization.create({
      data: {
        name: dto.name,
        legalName: dto.legalName,
        slug: dto.slug,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        address: dto.address,
        owner: {
          connect: { id: dto.ownerId },
        },
      },
      include: { owner: true },
    });
  }

  async findAll(page: number, limit: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { owner: true, _count: { select: { shops: true, members: true } } },
      }),
      this.prisma.organization.count(),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { owner: true, shops: true, members: { include: { user: true } } },
    });
    if (!org) {
      throw new NotFoundException('Organisation introuvable');
    }
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organisation introuvable');
    }
    return this.prisma.organization.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organisation introuvable');
    }
    return this.prisma.organization.delete({ where: { id } });
  }
}
