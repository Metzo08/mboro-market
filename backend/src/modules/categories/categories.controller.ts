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
import { Public, CurrentUser } from '../../common/decorators/index';
import { CreateCategoryDto, UpdateCategoryDto, CreateCategoryFieldDto } from './dto';

@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant')
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
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
  @Roles('super_admin', 'admin', 'merchant')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/fields')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant')
  addField(@Param('id') id: string, @Body() dto: CreateCategoryFieldDto, @CurrentUser() user: any) {
    return this.service.addField(id, dto, user);
  }
}
