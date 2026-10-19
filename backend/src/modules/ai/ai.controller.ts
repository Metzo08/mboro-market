import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private service: AiService) {}

  @Post('conversations')
  create(@Body() dto: any) {
    return this.service.createConversation(dto);
  }

  @Post('conversations/:id/messages')
  sendMessage(@Param('id') id: string, @Body() dto: any) {
    return this.service.sendMessage(id, dto);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') id: string) {
    return this.service.getMessages(id);
  }
}
