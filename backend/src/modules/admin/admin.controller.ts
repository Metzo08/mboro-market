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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/index';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private service: AdminService) {}

  @Get('settings')
  @Roles('super_admin', 'admin')
  findSettings(@Query('scope') scope?: string) {
    return this.service.findSettings(scope);
  }

  @Post('settings')
  @Roles('super_admin', 'admin')
  createSetting(@Body() dto: any) {
    return this.service.createSetting(dto);
  }

  @Get('audit-logs')
  @Roles('super_admin', 'admin')
  getAuditLogs(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.service.getAuditLogs(+page, +limit);
  }
}
