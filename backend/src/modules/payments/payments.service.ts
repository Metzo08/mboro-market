import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initialize(dto: any) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        transactionReference: `TXN-${Date.now()}`,
        orderId: order.id,
        invoiceId: dto.invoiceId,
        shopId: order.shopId,
        provider: dto.provider ?? 'sandbox',
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
    };
  }

  async handleWebhook(provider: string, payload: any) {
    const existing = await this.prisma.transaction.findFirst({
      where: { webhookId: payload.id },
    });
    if (existing) {
      return { status: 'already_processed' };
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { transactionReference: payload.reference },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction introuvable');
    }

    return this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: payload.status ?? 'SUCCEEDED',
          providerTransactionId: (payload.providerTransactionId || null) as string | null,
          webhookId: payload.id,
          webhookPayload: payload,
          verifiedAt: new Date(),
        },
      }),
      this.prisma.order.update({
        where: { id: transaction.orderId },
        data: { paymentStatus: 'SUCCEEDED' },
      }),
    ]);
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
    return this.prisma.transaction.update({
      where: { id },
      data: { status: 'REFUNDED' },
    });
  }
}
