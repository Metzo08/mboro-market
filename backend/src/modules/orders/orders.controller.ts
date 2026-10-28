import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/index';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateOrderDto, @Req() req: any) {
    // Si connecte, force userId = utilisateur connecte (anti-usurpation ORD-011)
    // Si invite (ORD-002), creation automatique via le numero de telephone
    return this.service.create({ ...dto, userId: req?.user?.id }, req?.user);
  }

  @Get()
  findAll(
    @Query('shopId') shopId?: string,
    @Query('userId') userId?: string,
    @Req() req?: any,
  ) {
    return this.service.findAll(shopId, userId, req?.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MERCHANT')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @Req() req: any) {
    return this.service.updateStatus(id, dto, req.user);
  }
}
