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
import { DeliveryZoneDto, DeliveryTaskDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/index';

@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  constructor(private service: DeliveryService) {}

  @Post('zones')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MERCHANT')
  createZone(@Body() dto: DeliveryZoneDto) {
    return this.service.createZone(dto);
  }

  @Get('zones/shop/:shopId')
  findZonesByShop(@Param('shopId') shopId: string) {
    return this.service.findZonesByShop(shopId);
  }

  @Post('tasks')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MERCHANT')
  createTask(@Body() dto: DeliveryTaskDto) {
    return this.service.createTask(dto);
  }
}
