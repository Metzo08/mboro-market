import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public, CurrentUser } from '../../common/decorators/index';
import { CreateOrderDto, QuoteOrderDto, UpdateOrderStatusDto } from './dto';

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  /**
   * Devis public : permet d'afficher un total fiable avant connexion.
   * Le même calcul est réutilisé à la création — aucune duplication.
   */
  @Public()
  @Post('quote')
  quote(@Body() dto: QuoteOrderDto) {
    return this.service.quote(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant', 'customer')
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: any, @Query('shopId') shopId?: string) {
    return this.service.findAll(user, shopId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateStatus(id, dto, user);
  }
}
