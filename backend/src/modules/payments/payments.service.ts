import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Aucun prestataire de paiement n'est branché dans cette version : on refuse
 * explicitement plutôt que de simuler un paiement réussi (§20 interdictions).
 */
const ENABLED_PROVIDERS: Record<string, boolean> = {
  paydunya: false,
  wave: false,
  orange_money: false,
};

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initialize(dto: any) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    const provider = String(dto.provider ?? '').toLowerCase();
    if (!ENABLED_PROVIDERS[provider]) {
      throw new ServiceUnavailableException(
        "Le paiement en ligne n'est pas encore activé. Choisissez le paiement à la livraison ou contactez la boutique.",
      );
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        transactionReference: `TXN-${Date.now()}`,
        orderId: order.id,
        invoiceId: dto.invoiceId,
        shopId: order.shopId,
        provider,
        amount: order.total,
        currency: order.currency,
        paymentMethod: dto.paymentMethod,
        status: 'CREATED',
      },
    });

    return {
      transactionId: transaction.id,
      reference: transaction.transactionReference,
      amount: transaction.amount,
      currency: transaction.currency,
      provider: transaction.provider,
      status: transaction.status,
      checkoutUrl: null as string | null,
    };
  }

  /**
   * Webhook authentifié : signature HMAC obligatoire, montant/devise vérifiés,
   * idempotence par identifiant d'événement (§16).
   */
  async handleWebhook(provider: string, payload: any, signature?: string) {
    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) {
      throw new ServiceUnavailableException('Webhook non configuré');
    }
    if (!signature) {
      throw new UnauthorizedException('Signature de webhook manquante');
    }

    const expected = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    const provided = signature.replace(/^sha256=/, '');
    const valid =
      provided.length === expected.length &&
      timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
    if (!valid) {
      throw new UnauthorizedException('Signature de webhook invalide');
    }

    if (payload.eventId) {
      const existing = await this.prisma.transaction.findFirst({
        where: { webhookId: payload.eventId },
      });
      if (existing) {
        return { status: 'already_processed' };
      }
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { transactionReference: payload.reference },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction introuvable');
    }
    if (transaction.provider !== provider.toLowerCase()) {
      throw new BadRequestException('Prestataire incohérent avec la transaction');
    }
    if (Number(payload.amount) !== Number(transaction.amount)) {
      throw new BadRequestException('Montant du webhook incohérent');
    }
    if (payload.currency && payload.currency !== transaction.currency) {
      throw new BadRequestException('Devise du webhook incohérente');
    }

    const status = String(payload.status ?? '').toUpperCase();
    const allowed = ['SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED'];
    if (!allowed.includes(status)) {
      throw new BadRequestException('Statut de paiement inconnu');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: status as any,
          providerTransactionId: payload.providerTransactionId ?? null,
          webhookId: payload.eventId ?? null,
          webhookPayload: payload,
          verifiedAt: new Date(),
        },
      });
      if (status === 'SUCCEEDED' && transaction.orderId) {
        await tx.order.update({
          where: { id: transaction.orderId },
          data: { paymentStatus: 'SUCCEEDED' },
        });
      }
      return updated;
    });
  }

  async findAll(user: { id: string; role: string }, shopId?: string) {
    if (!shopId) {
      throw new BadRequestException('shopId est requis');
    }
    if (!['admin', 'super_admin'].includes(user.role)) {
      const shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        select: { ownerId: true, members: { where: { userId: user.id }, select: { id: true } } },
      });
      if (!shop) throw new NotFoundException('Boutique introuvable');
      if (shop.ownerId !== user.id && shop.members.length === 0) {
        throw new ForbiddenException('Accès refusé à cette boutique');
      }
    }
    return this.prisma.transaction.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) {
      throw new NotFoundException('Transaction introuvable');
    }
    return tx;
  }

  async refund(id: string, dto: any) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) {
      throw new NotFoundException('Transaction introuvable');
    }
    if (tx.status !== 'SUCCEEDED') {
      throw new BadRequestException('Seule une transaction encaissée peut être remboursée');
    }
    return this.prisma.transaction.update({
      where: { id },
      data: { status: 'REFUNDED' },
    });
  }
}
