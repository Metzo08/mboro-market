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
import { Roles, Public, CurrentUser } from '../../common/decorators/index';
import { CreateShopDto, UpdateShopDto } from './dto';

@Controller('shops')
export class ShopsController {
  constructor(private service: ShopsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant')
  create(@Body() dto: CreateShopDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Public()
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('locality') locality?: string,
  ) {
    return this.service.findAll(+page, Math.min(+limit, 60), q, type, locality);
  }

  /** Mes boutiques — doit être déclarée AVANT :id pour ne pas être capturée. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: any) {
    return this.service.findMine(user.id, user.role);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'merchant')
  update(@Param('id') id: string, @Body() dto: UpdateShopDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
