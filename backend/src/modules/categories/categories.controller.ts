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
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/index';
import { CreateCategoryDto, UpdateCategoryDto, CreateCategoryFieldDto } from './dto';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Post()
  @Roles('super_admin', 'admin', 'merchant')
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('shopId') shopId?: string, @Query('parentId') parentId?: string) {
    return this.service.findAll(shopId, parentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin', 'merchant')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/fields')
  @Roles('super_admin', 'admin', 'merchant')
  addField(@Param('id') id: string, @Body() dto: CreateCategoryFieldDto) {
    return this.service.addField(id, dto);
  }
}
