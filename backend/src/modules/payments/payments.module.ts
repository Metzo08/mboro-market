import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService, WaveProvider, PaydunyaProvider } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [ShopsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, WaveProvider, PaydunyaProvider, PrismaService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
