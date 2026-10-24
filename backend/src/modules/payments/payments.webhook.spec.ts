import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import { PaymentsService, WaveProvider, PaydunyaProvider } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';

// CDC §18 : paiement jamais confirmé côté client seul + webhook falsifié rejeté
describe('PaymentsService — webhooks', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    process.env.WEBHOOK_SECRET = 'test-secret';
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: { transaction: {}, order: {}, prisma: {} } },
        { provide: ConfigService, useValue: { get: () => 'test-secret' } },
        // Providers de paiement non configurés → session sandbox (aucun appel HTTP)
        { provide: WaveProvider, useValue: { createCheckout: jest.fn() } },
        { provide: PaydunyaProvider, useValue: { createCheckout: jest.fn() } },
        // Réglages boutique (déchiffrés) — aucun réglage par défaut
        { provide: ShopsService, useValue: { getPaymentSettings: jest.fn().mockResolvedValue(null) } },
      ],
    }).compile();
    service = module.get<PaymentsService>(PaymentsService);
  });

  it('rejette une signature invalide', () => {
    expect(service.verifyWebhookSignature('{"a":1}', 'mauvaise-signature')).toBe(false);
  });
  it('rejette sans secret configure', () => {
    (service as any).config = { get: (): undefined => undefined };
    delete process.env.WEBHOOK_SECRET;
    expect(service.verifyWebhookSignature('body', 'sig')).toBe(false);
    process.env.WEBHOOK_SECRET = 'test-secret';
  });

  it('rejette le double-traitement (idempotence webhook)', async () => {
    const prisma = (service as any).prisma;
    prisma.transaction = {
      findFirst: jest.fn().mockResolvedValue({ id: 'tx-1' }),
    };
    await expect(
      service.handleWebhook('paydunya', { id: 'wh-1', reference: 'TXN-1' }),
    ).resolves.toEqual({ status: 'already_processed' });
  });

  it('rejette un montant incoherent', async () => {
    const prisma = (service as any).prisma;
    prisma.transaction = {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue({ id: 'tx-1', amount: 2500, status: 'PENDING' }),
    };
    await expect(
      service.handleWebhook('paydunya', { id: 'wh-2', reference: 'TXN-1', amount: 100 }),
    ).rejects.toBeTruthy();
  });
});
