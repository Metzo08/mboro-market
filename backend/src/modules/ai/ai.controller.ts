import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { CreateConversationDto, SendMessageDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
