import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { CreateConversationDto, SendMessageDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/index';
import { writeSseStream } from './sse.utils';

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
    const lang = (body.language || 'FR').toUpperCase() === 'WO' ? 'WO' : 'FR';
    return this.service.publicAsk(body.question, lang);
  }

  /**
   * Assistant IA public en STREAMING SSE — réponses token par token.
   * Compatible EventSource/fetch-ReadableStream côté client.
   */
  @Public()
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('public-ask-stream')
  async publicAskStream(
    @Body() body: { question: string; language?: 'FR' | 'WO' | 'EN' },
    @Res() res: any,
  ) {
    const lang = (body.language || 'FR').toUpperCase() === 'WO' ? 'WO' : 'FR';
    await writeSseStream(res, this.service.publicAskStream(body.question, lang));
  }
}
