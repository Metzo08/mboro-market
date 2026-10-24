import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateSettingDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/index';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private service: AdminService) {}

  @Get('settings')
  @Roles('SUPER_ADMIN', 'ADMIN')
  findSettings(@Query('scope') scope?: string) {
    return this.service.findSettings(scope);
  }

  @Post('settings')
  @Roles('SUPER_ADMIN', 'ADMIN')
  createSetting(@Body() dto: CreateSettingDto) {
    return this.service.createSetting(dto);
  }

  @Get('audit-logs')
  @Roles('SUPER_ADMIN', 'ADMIN')
  getAuditLogs(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.service.getAuditLogs(+page, +limit);
  }
}
