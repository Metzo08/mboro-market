import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** Valeurs de repli si la base n'est pas encore configurée (jamais codées dans l'UI). */
const DEFAULTS: Record<string, any> = {
  locations: [
    { name: 'Mboro', slug: 'mboro', region: 'Thiès', department: 'Mbour' },
    { name: 'Thiès', slug: 'thies', region: 'Thiès', department: 'Thiès' },
  ],
  pricing: { activationFee: 5000, monthlyFee: 2500, currency: 'XOF', graceDays: 7 },
  payments: {
    methods: ['cash', 'wave', 'orange_money'],
    labels: { cash: 'Paiement à la livraison / retrait', wave: 'Wave', orange_money: 'Orange Money' },
  },
  brand: {
    slogan: 'Les commerces et services de Thiès, à portée de main',
    editor: 'Sen-E-Carte',
    supportPhone: '+221700000000',
    whatsapp: '+221700000000',
  },
};

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async publicConfig() {
    const rows = await this.prisma.setting.findMany({
      where: { scope: 'global', key: { in: Object.keys(DEFAULTS) } },
    });

    const config: Record<string, any> = { ...DEFAULTS };
    for (const row of rows) {
      if (row.isValidated || row.value) {
        config[row.key] = row.value;
      }
    }
    return config;
  }
}
