import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto, RefundDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/index';

@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initialize')
  initialize(@Body() dto: InitializePaymentDto) {
    return this.service.initialize(dto);
  }

  // Webhook appelé par PayDunya/Wave → public mais signature HMAC vérifiée (CDC §10.2)
  @Public()
  @Post('webhook/:provider')
  webhook(@Param('provider') provider: string, @Body() payload: any, @Req() req: any) {
    const signature =
      req.headers['x-webhook-signature'] || req.headers['x-paydunya-signature'] || req.headers['x-wave-signature'];
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(payload ?? {});
    return this.service.handleWebhook(provider, payload, signature, rawBody);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/refund')
  refund(@Param('id') id: string, @Body() dto: RefundDto) {
    return this.service.refund(id, dto);
  }
}
