import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';

// CDC §18 : isolation multi-tenant — vendeur A ne voit jamais les données de B
describe('OrdersService — isolation multi-tenant', () => {
  let service: OrdersService;
  const findFirst = jest.fn();
  const findUniqueShop = jest.fn();

  beforeEach(async () => {
    findFirst.mockReset();
    findUniqueShop.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            shopMember: { findFirst },
            shop: { findUnique: findUniqueShop, findMany: jest.fn() },
            order: { findUnique: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
            product: { findUnique: jest.fn(), update: jest.fn() },
            orderStatusHistory: { create: jest.fn() },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<OrdersService>(OrdersService);
  });

  it('refuse l acces boutique a un marchand non membre', async () => {
    findFirst.mockResolvedValue(null);
    findUniqueShop.mockResolvedValue({ ownerId: 'owner-B' });
    await expect(
      (service as any).assertShopAccess('shop-B', 'user-A', 'MERCHANT'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('autorise le proprietaire de la boutique', async () => {
    findFirst.mockResolvedValue(null);
    findUniqueShop.mockResolvedValue({ ownerId: 'user-A' });
    await expect(
      (service as any).assertShopAccess('shop-A', 'user-A', 'MERCHANT'),
    ).resolves.toBeUndefined();
  });

  it('autorise SUPER_ADMIN partout', async () => {
    await expect(
      (service as any).assertShopAccess('shop-X', 'admin', 'SUPER_ADMIN'),
    ).resolves.toBeUndefined();
    expect(findFirst).not.toHaveBeenCalled();
  });
});
