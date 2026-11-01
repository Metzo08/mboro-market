import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService, WaveProvider, PaydunyaProvider } from './payments.service';
import { SandboxProvider } from './sandbox.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [ShopsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, WaveProvider, PaydunyaProvider, SandboxProvider, PrismaService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
