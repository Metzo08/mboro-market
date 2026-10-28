import { ValidationPipe } from '@nestjs/common';
import { CreateConversationDto, SendMessageDto } from '../ai/dto';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../organizations/dto';
import { CreateSubscriptionDto, UpdateSubscriptionStatusDto } from '../subscriptions/dto';
import { InitializePaymentDto } from '../payments/dto';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

/** Test pour vérifier que chaque DTO utilisé dans le projet possède bien
 *  les décorateurs class-validator attendus, nécessaires au pipe global
 *  (whitelist + forbidNonWhitelisted) à ne pas casser.
 */
const UUID_A = 'a1111111-1111-4111-8111-111111111111';
const UUID_B = 'b2222222-2222-4222-8222-222222222222';
const UUID_C = 'c3333333-3333-4333-8333-333333333333';

describe('ValidationPipe global — DTO sans decorateurs', () => {
  const cases: Array<[string, any, any]> = [
    ['CreateConversationDto', CreateConversationDto, { shopId: UUID_A, userId: UUID_B, language: 'FR' }],
    ['SendMessageDto', SendMessageDto, { content: 'bonjour', language: 'FR' }],
    ['CreateOrganizationDto', CreateOrganizationDto, { name: 'Nom', slug: 'nom-slug', ownerId: UUID_A }],
    ['UpdateOrganizationDto', UpdateOrganizationDto, { name: 'N2' }],
    ['CreateSubscriptionDto', CreateSubscriptionDto, { shopId: UUID_B }],
    ['UpdateSubscriptionStatusDto', UpdateSubscriptionStatusDto, { status: 'ACTIVE' }],
    ['InitializePaymentDto', InitializePaymentDto, { orderId: UUID_C, provider: 'wave' }],
  ];

  it.each(cases)('%s ne doit pas etre rejete par le pipe global', async (_name, dto, payload) => {
    await expect(
      pipe.transform(payload, { type: 'body', metatype: dto } as any),
    ).resolves.toBeDefined();
  });
});