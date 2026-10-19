import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Post('initialize')
  initialize(@Body() dto: any) {
    return this.service.initialize(dto);
  }

  @Post('webhook/:provider')
  webhook(@Param('provider') provider: string, @Body() payload: any) {
    return this.service.handleWebhook(provider, payload);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/refund')
  refund(@Param('id') id: string, @Body() dto: any) {
    return this.service.refund(id, dto);
  }
}
