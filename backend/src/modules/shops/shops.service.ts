import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SecretCryptoService } from '../../common/crypto/secret-crypto.service';
import { CreateShopDto, UpdateShopDto } from './dto';

/**
 * Retire les secrets (cles API Wave / PayDunya) du champ JSON `settings`.
 * Le champ `settings` est expose publiquement par GET /shops et GET /shops/:id,
 * les secrets ne doivent donc jamais y figurer en clair.
 *
 * @param withSecretFlags pour les reponses authentifiees : ajoute des drapeaux
 * booleens indiquant si un secret est deja configure (sans jamais le reveler).
 */
function sanitizeShop<T extends { settings?: unknown }>(
  shop: T,
  withSecretFlags = false,
): T {
  if (!shop || !shop.settings) return shop;
  const settings = shop.settings as Record<string, any>;
  if (!settings.paymentSettings) return shop;
  const { waveSecretKey, paydunyaApiToken, ...safePaymentSettings } =
    settings.paymentSettings ?? {};

  if (withSecretFlags) {
    return {
      ...shop,
      settings: {
        ...settings,
        paymentSettings: {
          ...safePaymentSettings,
          hasWaveSecretKey: Boolean(waveSecretKey),
          hasPaydunyaApiToken: Boolean(paydunyaApiToken),
        },
      },
    };
  }

  return {
    ...shop,
    settings: {
      ...settings,
      paymentSettings: safePaymentSettings,
    },
  };
}

/** Champs de `paymentSettings` qui sont des secrets et doivent etre chiffres. */
const SECRET_FIELDS = ['waveSecretKey', 'paydunyaApiToken'] as const;

@Injectable()
export class ShopsService {
  constructor(
    private prisma: PrismaService,
    private crypto: SecretCryptoService,
  ) {}

  async create(dto: CreateShopDto) {
    const existing = await this.prisma.shop.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Cette boutique existe déjà');
    }

    return this.prisma.shop.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        type: (dto.type as any) ?? 'RETAIL',
        description: dto.description,
        shortDescription: dto.shortDescription,
        phone: dto.phone,
        email: dto.email,
        whatsapp: dto.whatsapp,
        publicAddress: dto.publicAddress,
        organization: { connect: { id: dto.organizationId } },
        owner: { connect: { id: dto.ownerId } },
      },
      include: { organization: true, owner: true },
    });
  }

  async findAll(page: number, limit: number, slug?: string, search?: string, type?: string) {
    const where: any = {};
    if (slug) where.slug = slug;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { publicAddress: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.shop.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          organization: true,
          owner: true,
          mediaAssets: true,
          _count: { select: { products: true, orders: true } },
        },
      }),
      this.prisma.shop.count({ where }),
    ]);
    return { items: items.map((shop) => sanitizeShop(shop)), total, page, limit };
  }

  async findOne(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        organization: true,
        owner: true,
        mediaAssets: true,
        categories: true,
        products: true,
        services: true,
        subscription: true,
      },
    });
    if (!shop) {
      throw new NotFoundException('Boutique introuvable');
    }
    return sanitizeShop(shop);
  }

  async findByOwner(ownerId: string) {
    const shop = await this.prisma.shop.findFirst({
      where: { ownerId },
      include: {
        organization: true,
        owner: true,
        mediaAssets: true,
        categories: true,
        products: true,
        services: true,
        subscription: true,
      },
    });
    if (!shop) {
      throw new NotFoundException('Aucune boutique trouvée pour cet utilisateur');
    }
    // Réponse authentifiée : le commerçant peut savoir si un secret est déjà
    // configuré (sans jamais recevoir sa valeur).
    return sanitizeShop(shop, true);
  }

  async update(id: string, dto: UpdateShopDto, user?: any) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) {
      throw new NotFoundException('Boutique introuvable');
    }

    // Isolation multi-tenant : un marchand ne peut modifier que sa propre boutique.
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      if (shop.ownerId !== user.id) {
        throw new ForbiddenException('Accès refusé à cette boutique');
      }
    }

    // `paymentSettings` est un sous-objet du champ JSON `settings`.
    const { paymentSettings, ...scalars } = dto as any;
    const data: any = { ...scalars };

    if (paymentSettings !== undefined) {
      const currentSettings: Record<string, any> =
        shop.settings && typeof shop.settings === 'object' && !Array.isArray(shop.settings)
          ? (shop.settings as Record<string, any>)
          : {};
      const currentPaymentSettings: Record<string, any> = currentSettings.paymentSettings ?? {};

      // Les secrets ne sont jamais renvoyés par l'API : un champ vide signifie
      // « inchangé » et ne doit donc pas effacer la valeur déjà enregistrée.
      const mergedPaymentSettings = { ...currentPaymentSettings };
      for (const [key, value] of Object.entries(paymentSettings ?? {})) {
        if (key === 'waveSecretKey' || key === 'paydunyaApiToken') {
          if (typeof value === 'string' && value.trim() !== '') {
            // Chiffrement au repos (CDC §11.5) : la valeur est chiffrée avant
            // d'être écrite, et n'est déchiffrée que par le service de paiement.
            mergedPaymentSettings[key] = this.crypto.encrypt(value);
          }
          continue;
        }
        mergedPaymentSettings[key] = value;
      }

      data.settings = {
        ...currentSettings,
        paymentSettings: mergedPaymentSettings,
      };
    }

    return this.prisma.shop
      .update({ where: { id }, data })
      .then(sanitizeShop);
  }

  async remove(id: string) {
    return this.prisma.shop.delete({ where: { id } });
  }

  /**
   * Reglements de paiement en clair, resolus pour la boutique donnee.
   *
   * Usage strictement serveur (initialisation de paiement) : les secrets sont
   * dechiffres ici, puis passes au provider. Aucun appel public ne doit
   * utiliser cette methode (elle est donc hors du `sanitizeShop`).
   *
   * @returns null si la boutique n'existe pas ou n'a aucun reglement configure.
   */
  async getPaymentSettings(shopId: string): Promise<{
    waveApiKey: string | null;
    waveSecretKey: string | null;
    waveBusinessId: string | null;
    paydunyaApiKey: string | null;
    paydunyaApiToken: string | null;
    acceptedPaymentMethods: string[];
  } | null> {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { settings: true },
    });
    if (!shop) return null;

    const settings =
      shop.settings && typeof shop.settings === 'object' && !Array.isArray(shop.settings)
        ? (shop.settings as Record<string, any>)
        : {};
    const ps = settings.paymentSettings ?? {};

    const decrypt = (value: unknown): string | null => {
      if (typeof value !== 'string' || value === '') return null;
      try {
        return this.crypto.decrypt(value);
      } catch {
        // Un secret chiffre avec une ancienne cle ne doit pas casser le
        // paiement : on le considere comme absent.
        return null;
      }
    };

    return {
      waveApiKey: typeof ps.waveApiKey === 'string' && ps.waveApiKey ? ps.waveApiKey : null,
      waveSecretKey: decrypt(ps.waveSecretKey),
      waveBusinessId:
        typeof ps.waveBusinessId === 'string' && ps.waveBusinessId ? ps.waveBusinessId : null,
      paydunyaApiKey:
        typeof ps.paydunyaApiKey === 'string' && ps.paydunyaApiKey ? ps.paydunyaApiKey : null,
      paydunyaApiToken: decrypt(ps.paydunyaApiToken),
      acceptedPaymentMethods: Array.isArray(ps.acceptedPaymentMethods)
        ? ps.acceptedPaymentMethods.filter((m: any) => typeof m === 'string')
        : [],
    };
  }
}
