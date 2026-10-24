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
import { CurrentUser } from '../../common/decorators/index';
import { CreateShopDto, UpdateShopDto } from './dto';

@Controller('shops')
export class ShopsController {
  constructor(private service: ShopsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MERCHANT')
  create(@Body() dto: CreateShopDto) {
    return this.service.create(dto);
  }

  @Public()
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('slug') slug?: string,
  ) {
    return this.service.findAll(+page, +limit, slug);
  }

  // IMPORTANT : doit être déclare AVANT `@Get(':id')`, sinon la route
  // `/shops/me` est capturee par `:id` (id = "me") et renvoie 404.
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMyShop(@CurrentUser() user: any) {
    return this.service.findByOwner(user.id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MERCHANT')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShopDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
