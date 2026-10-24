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
describe('ValidationPipe global — DTO sans decorateurs', () => {
  const cases: Array<[string, any, any]> = [
    ['CreateConversationDto', CreateConversationDto, { shopId: 's', userId: 'u', language: 'FR' }],
    ['SendMessageDto', SendMessageDto, { content: 'bonjour', language: 'FR' }],
    ['CreateOrganizationDto', CreateOrganizationDto, { name: 'N', slug: 'n', ownerId: 'o' }],
    ['UpdateOrganizationDto', UpdateOrganizationDto, { name: 'N2' }],
    ['CreateSubscriptionDto', CreateSubscriptionDto, { shopId: 's' }],
    ['UpdateSubscriptionStatusDto', UpdateSubscriptionStatusDto, { status: 'ACTIVE' }],
    ['InitializePaymentDto', InitializePaymentDto, { orderId: 'o', provider: 'wave' }],
  ];

  it.each(cases)('%s ne doit pas etre rejete par le pipe global', async (_name, dto, payload) => {
    await expect(
      pipe.transform(payload, { type: 'body', metatype: dto } as any),
    ).resolves.toBeDefined();
  });
});