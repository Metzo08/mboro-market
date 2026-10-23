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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators/index';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private service: SubscriptionsService) {}

  @Post()
  @Roles('super_admin', 'admin')
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get('shop/:shopId')
  findByShop(@Param('shopId') shopId: string, @CurrentUser() user: any) {
    return this.service.findByShop(shopId, user);
  }

  @Patch(':id/status')
  @Roles('super_admin', 'admin')
  updateStatus(@Param('id') id: string, @Body() dto: any) {
    return this.service.updateStatus(id, dto);
  }
}
