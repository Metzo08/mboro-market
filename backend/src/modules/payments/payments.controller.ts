import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public, CurrentUser } from '../../common/decorators/index';

@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  initialize(@Body() dto: any) {
    return this.service.initialize(dto);
  }

  /** Webhook public mais authentifié par signature HMAC — jamais par JWT. */
  @Public()
  @Post('webhook/:provider')
  webhook(
    @Param('provider') provider: string,
    @Body() payload: any,
    @Headers('x-webhook-signature') signature?: string,
  ) {
    return this.service.handleWebhook(provider, payload, signature);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin', 'super_admin')
  findAll(@CurrentUser() user: any, @Query('shopId') shopId?: string) {
    return this.service.findAll(user, shopId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  refund(@Param('id') id: string, @Body() dto: any) {
    return this.service.refund(id, dto);
  }
}
