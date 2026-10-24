import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { ShopsService } from './shops.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SecretCryptoService } from '../../common/crypto/secret-crypto.service';

// CDC §18 : isolation multi-tenant + configuration de paiement par boutique
describe('ShopsService — paymentSettings', () => {
  let service: ShopsService;
  let crypto: SecretCryptoService;
  const findUnique = jest.fn();
  const update = jest.fn();

  const buildService = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopsService,
        SecretCryptoService,
        {
          provide: ConfigService,
          useValue: { get: (key: string) => (key === 'SECRET_ENCRYPTION_KEY' ? 'test-encryption-key' : undefined) },
        },
        {
          provide: PrismaService,
          useValue: {
            shop: { findUnique, update },
          },
        },
      ],
    }).compile();
    return module;
  };

  beforeEach(async () => {
    findUnique.mockReset();
    update.mockReset();
    update.mockImplementation(({ where, data }: any) =>
      Promise.resolve({ id: where.id, settings: data.settings ?? {}, ...data }),
    );
    const module = await buildService();
    service = module.get<ShopsService>(ShopsService);
    crypto = module.get<SecretCryptoService>(SecretCryptoService);
  });

  it('refuse la modification par un marchand qui n est pas proprietaire', async () => {
    findUnique.mockResolvedValue({ id: 'shop-B', ownerId: 'owner-B', settings: {} });

    await expect(
      service.update('shop-B', { paymentSettings: { waveApiKey: 'k' } } as any, {
        id: 'user-A',
        role: 'MERCHANT',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(update).not.toHaveBeenCalled();
  });

  it('laisse un marchand modifier sa propre boutique', async () => {
    findUnique.mockResolvedValue({ id: 'shop-A', ownerId: 'owner-A', settings: {} });

    await service.update(
      'shop-A',
      { paymentSettings: { waveApiKey: 'wave-live_1' } } as any,
      { id: 'owner-A', role: 'MERCHANT' },
    );

    expect(update).toHaveBeenCalledTimes(1);
    const call = update.mock.calls[0][0];
    expect(call.where).toEqual({ id: 'shop-A' });
    expect(call.data.settings.paymentSettings.waveApiKey).toBe('wave-live_1');
  });

  it('autorise un administrateur sur n importe quelle boutique', async () => {
    findUnique.mockResolvedValue({ id: 'shop-B', ownerId: 'owner-B', settings: {} });

    await service.update(
      'shop-B',
      { paymentSettings: { waveApiKey: 'wave-live_1' } } as any,
      { id: 'admin', role: 'ADMIN' },
    );

    expect(update).toHaveBeenCalledTimes(1);
  });

  it('leve une erreur si la boutique n existe pas', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      service.update('shop-X', { paymentSettings: {} } as any, {
        id: 'user-A',
        role: 'MERCHANT',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('ne revele jamais les secrets dans la reponse', async () => {
    findUnique.mockResolvedValue({
      id: 'shop-A',
      ownerId: 'owner-A',
      settings: {
        paymentSettings: {
          waveApiKey: 'wave-live_1',
          waveSecretKey: 'super-secret',
          paydunyaApiToken: 'token-secret',
          acceptedPaymentMethods: ['wave'],
        },
      },
    });

    const result: any = await service.update(
      'shop-A',
      { paymentSettings: { waveApiKey: 'wave-live_1' } } as any,
      { id: 'owner-A', role: 'MERCHANT' },
    );

    expect(result.settings.paymentSettings.waveSecretKey).toBeUndefined();
    expect(result.settings.paymentSettings.paydunyaApiToken).toBeUndefined();
  });

  it('conserve un secret existant quand le champ est envoye vide', async () => {
    findUnique.mockResolvedValue({
      id: 'shop-A',
      ownerId: 'owner-A',
      settings: {
        paymentSettings: {
          waveApiKey: 'wave-live_1',
          waveSecretKey: 'existing-secret',
        },
      },
    });

    await service.update(
      'shop-A',
      {
        paymentSettings: { waveApiKey: 'wave-live_1', waveSecretKey: '' },
      } as any,
      { id: 'owner-A', role: 'MERCHANT' },
    );

    const call = update.mock.calls[0][0];
    // Le secret existant est conserve tel quel (il n'est reecrit que s'il
    // est fourni non vide) : il doit donc rester lisible par le service.
    expect(call.data.settings.paymentSettings.waveSecretKey).toBe('existing-secret');
  });

  it('remplace un secret quand une nouvelle valeur est fournie', async () => {
    findUnique.mockResolvedValue({
      id: 'shop-A',
      ownerId: 'owner-A',
      settings: {
        paymentSettings: { waveSecretKey: 'old-secret' },
      },
    });

    await service.update(
      'shop-A',
      { paymentSettings: { waveSecretKey: 'new-secret' } } as any,
      { id: 'owner-A', role: 'MERCHANT' },
    );

    const call = update.mock.calls[0][0];
    const stored = call.data.settings.paymentSettings.waveSecretKey;
    // Le secret est chiffre au repos (CDC §11.5) et dechiffrable par le service.
    expect(stored).not.toBe('new-secret');
    expect(crypto.isEncrypted(stored)).toBe(true);
    expect(crypto.decrypt(stored)).toBe('new-secret');
  });

  it('preserve les autres cles du champ settings', async () => {
    findUnique.mockResolvedValue({
      id: 'shop-A',
      ownerId: 'owner-A',
      settings: {
        deliveryOptions: { pickup: true },
        paymentSettings: {},
      },
    });

    await service.update(
      'shop-A',
      { paymentSettings: { waveApiKey: 'k' } } as any,
      { id: 'owner-A', role: 'MERCHANT' },
    );

    const call = update.mock.calls[0][0];
    expect(call.data.settings.deliveryOptions).toEqual({ pickup: true });
  });

  // CDC §11.5 : les secrets sont chiffres au repos et dechiffres uniquement
  // par le service qui en a besoin (initialisation de paiement).
  describe('getPaymentSettings (usage serveur)', () => {
    it('dechiffre les secrets pour le service de paiement', async () => {
      findUnique.mockResolvedValue({
        id: 'shop-A',
        settings: {
          paymentSettings: {
            waveApiKey: 'wave-live_1',
            waveSecretKey: crypto.encrypt('secret-wave'),
            paydunyaApiKey: 'payd-live_1',
            paydunyaApiToken: crypto.encrypt('token-paydunya'),
            acceptedPaymentMethods: ['wave', 'cod'],
          },
        },
      });

      const result = await service.getPaymentSettings('shop-A');

      expect(result).not.toBeNull();
      expect(result!.waveSecretKey).toBe('secret-wave');
      expect(result!.paydunyaApiToken).toBe('token-paydunya');
      expect(result!.waveApiKey).toBe('wave-live_1');
      expect(result!.acceptedPaymentMethods).toEqual(['wave', 'cod']);
    });

    it('renvoie null pour une boutique inexistante', async () => {
      findUnique.mockResolvedValue(null);
      await expect(service.getPaymentSettings('shop-X')).resolves.toBeNull();
    });

    it('ne casse pas si un secret chiffre est illisible', async () => {
      findUnique.mockResolvedValue({
        id: 'shop-A',
        settings: {
          paymentSettings: {
            waveSecretKey: 'enc:v1:corrompu:corrompu:corrompu',
          },
        },
      });

      const result = await service.getPaymentSettings('shop-A');
      expect(result!.waveSecretKey).toBeNull();
    });
  });

// Régression : la stratégie JWT doit être enregistrée dans AuthModule, sinon
// toutes les routes protégées (`JwtAuthGuard`) répondent 500 au lieu de 401/200.
describe('AuthModule — enregistrement de la stratégie JWT', () => {
  it('expose JwtStrategy comme provider', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: { findUnique: jest.fn() },
        shop: { findFirst: jest.fn(), findUnique: jest.fn() },
      })
      .compile();

    expect(module.get(JwtStrategy)).toBeInstanceOf(JwtStrategy);
    await module.close();
  });
});

});
