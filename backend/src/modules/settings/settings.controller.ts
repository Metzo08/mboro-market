import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Public } from '../../common/decorators/index';

@Controller('config')
export class SettingsController {
  constructor(private service: SettingsService) {}

  /** Configuration publique : localités, tarifs, moyens de paiement, marque. */
  @Public()
  @Get('public')
  getPublicConfig() {
    return this.service.publicConfig();
  }
}
