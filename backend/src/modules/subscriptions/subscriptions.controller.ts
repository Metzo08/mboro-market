import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpdateSubscriptionStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/index';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private service: SubscriptionsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() dto: CreateSubscriptionDto) {
    return this.service.create(dto);
  }

  @Get('shop/:shopId')
  findByShop(@Param('shopId') shopId: string) {
    return this.service.findByShop(shopId);
  }

  @Get('pricing')
  getPricing() {
    return this.service.getPricingPublic();
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateSubscriptionStatusDto) {
    return this.service.updateStatus(id, dto);
  }
}
