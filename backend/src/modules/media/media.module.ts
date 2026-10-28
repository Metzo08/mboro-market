import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [MediaController],
  providers: [PrismaService],
  exports: [],
})
export class MediaModule {}
