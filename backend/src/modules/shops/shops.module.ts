import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SecretCryptoService } from '../../common/crypto/secret-crypto.service';

@Module({
  controllers: [ShopsController],
  providers: [ShopsService, PrismaService, SecretCryptoService],
  exports: [ShopsService],
})
export class ShopsModule {}
