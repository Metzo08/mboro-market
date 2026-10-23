import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public, CurrentUser } from '../../common/decorators/index';

@Controller('delivery')
export class DeliveryController {
  constructor(private service: DeliveryService) {}

  @Post('zones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant')
  createZone(@Body() dto: any, @CurrentUser() user: any) {
    return this.service.createZone(dto, user);
  }

  /** Zones publiques : nécessaires au checkout pour afficher un frais réel. */
  @Public()
  @Get('zones/shop/:shopId')
  findZonesByShop(@Param('shopId') shopId: string) {
    return this.service.findZonesByShop(shopId);
  }

  @Post('tasks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant')
  createTask(@Body() dto: any, @CurrentUser() user: any) {
    return this.service.createTask(dto, user);
  }
}
