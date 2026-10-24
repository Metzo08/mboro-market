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
import { Public } from '../../common/decorators/index';
import { CreateCategoryDto, UpdateCategoryDto, CreateCategoryFieldDto } from './dto';

@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MERCHANT')
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Public()
  @Get()
  findAll(@Query('shopId') shopId?: string, @Query('parentId') parentId?: string) {
    return this.service.findAll(shopId, parentId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MERCHANT')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/fields')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MERCHANT')
  addField(@Param('id') id: string, @Body() dto: CreateCategoryFieldDto) {
    return this.service.addField(id, dto);
  }
}
