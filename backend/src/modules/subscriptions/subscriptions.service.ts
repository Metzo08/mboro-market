import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionDto, UpdateSubscriptionStatusDto } from './dto';

// Tarifs CDC §5 — configurables via table Setting (jamais en dur côté métier)
// Valeurs par défaut conformes CDC : activation 5000, mensuel 2500
const DEFAULT_ACTIVATION_FEE = 5000;
const DEFAULT_MONTHLY_FEE = 2500;

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  private async getPricing() {
    const settings = await this.prisma.setting.findMany({
      where: { scope: 'global', key: { in: ['activation_fee', 'monthly_fee'] } },
    });
    const map: Record<string, number> = {};
    for (const s of settings) {
      const v = (s.value as any)?.amount ?? (s.value as any)?.value ?? s.value;
      map[s.key] = Number(v);
    }
    return {
      activationFee: map['activation_fee'] ?? DEFAULT_ACTIVATION_FEE,
      monthlyFee: map['monthly_fee'] ?? DEFAULT_MONTHLY_FEE,
    };
  }

  private invoiceNumber() {
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `FAC-${d}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  async create(dto: CreateSubscriptionDto) {
    if (!dto.shopId) throw new BadRequestException('shopId requis');
    const shop = await this.prisma.shop.findUnique({ where: { id: dto.shopId } });
    if (!shop) throw new NotFoundException('Boutique introuvable');
    const existing = await this.prisma.subscription.findUnique({
      where: { shopId: dto.shopId },
    });
    if (existing && ['ACTIVE', 'TRIAL'].includes(existing.status)) {
      throw new ConflictException('Boutique deja abonnee');
    }
    const { activationFee, monthlyFee } = await this.getPricing();
    const withActivation = dto.withActivation ?? !existing;

    return this.prisma.$transaction(async (tx) => {
      const sub = existing
        ? await tx.subscription.update({
            where: { id: existing.id },
            data: {
              status: 'PENDING_ACTIVATION',
              planName: dto.planName ?? existing.planName ?? 'basic',
              price: monthlyFee,
              currency: 'XOF',
            },
          })
        : await tx.subscription.create({
            data: {
              shopId: dto.shopId,
              status: 'PENDING_ACTIVATION',
              planName: dto.planName ?? 'basic',
              price: monthlyFee,
              currency: 'XOF',
              billingPeriod: 'monthly',
            },
          });
      // Facture activation (unique, CDC FACT-001) + facture mensuelle
      if (withActivation) {
        await tx.invoice.create({
          data: {
            invoiceNumber: this.invoiceNumber(),
            subscriptionId: sub.id,
            shopId: dto.shopId,
            amount: activationFee,
            currency: 'XOF',
            status: 'pending',
            issuedAt: new Date(),
            dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
      await tx.invoice.create({
        data: {
          invoiceNumber: this.invoiceNumber(),
          subscriptionId: sub.id,
          shopId: dto.shopId,
          amount: monthlyFee,
          currency: 'XOF',
          status: 'pending',
          issuedAt: new Date(),
          dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      return tx.subscription.findUnique({
        where: { id: sub.id },
        include: { invoices: true, shop: true },
      });
    });
  }

  async findByShop(shopId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { shopId },
      include: { invoices: { orderBy: { createdAt: 'desc' } } },
    });
    if (!sub) throw new NotFoundException('Abonnement introuvable');
    return sub;
  }

  // CDC FACT-002 : impayé → PAST_DUE → GRACE → SUSPENDED, jamais de suppression
  async updateStatus(id: string, dto: UpdateSubscriptionStatusDto) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Abonnement introuvable');
    const allowed = [
      'PENDING_ACTIVATION', 'TRIAL', 'ACTIVE', 'PAST_DUE',
      'GRACE_PERIOD', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'REFUNDED',
    ];
    if (!allowed.includes(dto.status)) throw new BadRequestException('Statut invalide');
    const data: any = { status: dto.status as any };
    if (dto.status === 'ACTIVE') {
      data.startedAt = sub.startedAt ?? new Date();
      data.nextDueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      data.renewedAt = new Date();
    }
    if (dto.status === 'GRACE_PERIOD') {
      data.gracePeriodEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    if (dto.status === 'CANCELLED') data.cancelledAt = new Date();
    const updated = await this.prisma.subscription.update({ where: { id }, data });
    await this.prisma.auditLog.create({
      data: {
        actorId: sub.shopId,
        action: 'subscription.status',
        entity: 'Subscription',
        entityId: id,
        metadata: { from: sub.status, to: dto.status, reason: dto.reason } as any,
      },
    }).catch((): null => null);
    // Suspension boutique si abonnement suspendu/expire (CDC : vitrine masquée, données gardées)
    if (['SUSPENDED', 'EXPIRED'].includes(dto.status)) {
      await this.prisma.shop.update({
        where: { id: sub.shopId },
        data: { status: 'SUSPENDED' },
      }).catch((): null => null);
    }
    if (dto.status === 'ACTIVE') {
      await this.prisma.shop.update({
        where: { id: sub.shopId },
        data: { status: 'ACTIVE' },
      }).catch((): null => null);
    }
    return updated;
  }

  async getPricingPublic() {
    return this.getPricing();
  }
}
