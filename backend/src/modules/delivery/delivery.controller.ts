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
import { Roles } from '../../common/decorators/index';

@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  constructor(private service: DeliveryService) {}

  @Post('zones')
  @Roles('super_admin', 'admin', 'merchant')
  createZone(@Body() dto: any) {
    return this.service.createZone(dto);
  }

  @Get('zones/shop/:shopId')
  findZonesByShop(@Param('shopId') shopId: string) {
    return this.service.findZonesByShop(shopId);
  }

  @Post('tasks')
  @Roles('super_admin', 'admin', 'merchant')
  createTask(@Body() dto: any) {
    return this.service.createTask(dto);
  }
}
