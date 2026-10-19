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
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/index';
import { Public } from '../../common/decorators/index';
import { CreateProductDto, UpdateProductDto } from './dto';

@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant')
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Public()
  @Get()
  findAll(
    @Query('shopId') shopId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.findAll(shopId, categoryId, +page, +limit);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
