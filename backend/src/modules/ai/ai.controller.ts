import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { CreateConversationDto, SendMessageDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/index';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private service: AiService) {}

  @Post('conversations')
  create(@Body() dto: CreateConversationDto, @Req() req: any) {
    return this.service.createConversation({ ...dto, userId: req.user.id }, req.user);
  }

  @Post('conversations/:id/messages')
  sendMessage(@Param('id') id: string, @Body() dto: SendMessageDto, @Req() req: any) {
    return this.service.sendMessage(id, dto, req.user);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') id: string) {
    return this.service.getMessages(id);
  }

  /**
   * Assistant IA public (widget flottant disponible sur toutes les pages).
   * Répond uniquement à partir des données réelles des boutiques actives,
   * sans contexte utilisateur — jamais d'accès aux données privées.
   */
  @Public()
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('public-ask')
  async publicAsk(@Body() body: { question: string; language?: 'FR' | 'WO' | 'EN' }) {
    return this.service.publicAsk(body.question, body.language || 'FR');
  }
}
