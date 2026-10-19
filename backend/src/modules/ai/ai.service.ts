import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async createConversation(dto: any) {
    return this.prisma.aIConversation.create({
      data: {
        shopId: dto.shopId,
        userId: dto.userId,
        language: dto.language ?? 'FR',
      },
    });
  }

  async sendMessage(conversationId: string, dto: any) {
    return this.prisma.aIMessage.create({
      data: {
        conversationId,
        role: dto.role ?? 'USER',
        content: dto.content,
        toolCalls: dto.toolCalls ?? [],
        toolResults: dto.toolResults ?? [],
      },
    });
  }

  async getMessages(conversationId: string) {
    return this.prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
