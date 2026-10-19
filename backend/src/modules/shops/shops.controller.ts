import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/index';
import { Public } from '../../common/decorators/index';
import { CreateShopDto, UpdateShopDto } from './dto';

@Controller('shops')
export class ShopsController {
  constructor(private service: ShopsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant')
  create(@Body() dto: CreateShopDto) {
    return this.service.create(dto);
  }

  @Public()
  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.findAll(+page, +limit);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant')
  update(@Param('id') id: string, @Body() dto: UpdateShopDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
