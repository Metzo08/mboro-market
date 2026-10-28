import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConversationDto, SendMessageDto } from './dto';
import { buildWolofResponse } from '../../common/ai/wolof-nlg';

// Mini-lexique FR→WO (CDC §9 : salutations, prix, stock, commande, livraison)
// Le vrai corpus Wolof complet vit en table Translation (isValidated=true)
const WOLEX: Record<string, string> = {
  bonjour: 'salaamalekum',
  prix: 'njeg',
  combien: 'ñett',
  merci: 'jërëjëf',
  commande: 'commande bi',
  livraison: 'yóbbu bi',
  boutique: 'butik bi',
  produit: 'jumtukay bi',
};

function detectLanguage(text: string): string {
  const t = text.toLowerCase();
  if (/salaam|nanga|mangi|jëre|jëf|jëkk|jël|wax|dëgg|jënd|jëfandikoo/.test(t)) return 'WO';
  if (/the|and|price|order|delivery|shop/.test(t)) return 'EN';
  return 'FR';
}

function toWolof(fr: string): string {
  let out = fr;
  for (const [k, v] of Object.entries(WOLEX)) {
    out = out.replace(new RegExp(`\\b${k}\\b`, 'gi'), v);
  }
  return out;
}

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  private async assertAccess(shopId: string, userId: string, role: string) {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return;
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { ownerId: true },
    });
    const member = await this.prisma.shopMember.findFirst({
      where: { shopId, userId },
    });
    if (shop?.ownerId !== userId && !member) {
      // Client : autorisé à interroger la vitrine publique, mais scope boutique imposé
      const u = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!u) throw new ForbiddenException('Acces refuse a cette boutique');
    }
  }

  async createConversation(dto: CreateConversationDto, requester?: any) {
    if (!dto.shopId || !dto.userId) throw new BadRequestException('shopId et userId requis');
    await this.assertAccess(dto.shopId, dto.userId, requester?.role ?? 'CUSTOMER');
    return this.prisma.aIConversation.create({
      data: {
        shopId: dto.shopId,
        userId: dto.userId,
        language: (dto.language as any) ?? 'FR',
      },
    });
  }

  // CDC IA-001/002/003 : réponse STRICTEMENT fondée sur les données boutique
  async sendMessage(conversationId: string, dto: SendMessageDto, requester?: any) {
    if (!dto.content?.trim()) throw new BadRequestException('Message vide');
    const conv = await this.prisma.aIConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) throw new NotFoundException('Conversation introuvable');
    await this.assertAccess(conv.shopId, conv.userId, requester?.role ?? 'CUSTOMER');

    await this.prisma.aIMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content: dto.content,
      },
    });

    const lang = (dto.language as any) ?? detectLanguage(dto.content);
    const answer = await this.answerFromShopData(conv.shopId, dto.content, lang);

    const saved = await this.prisma.aIMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: answer,
      },
    });
    await this.prisma.aIConversation.update({
      where: { id: conversationId },
      data: { language: lang as any },
    }).catch((): null => null);
    return saved;
  }

  private async answerFromShopData(shopId: string, question: string, lang: string): Promise<string> {
    const q = question.toLowerCase();
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) return 'Donnée manquante : boutique introuvable.';
    const products = await this.prisma.product.findMany({
      where: { shopId, status: 'active' },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    const mappedProducts = products.map((p) => ({
      title: p.title,
      price: Number(p.price),
      stock: p.stock,
    }));
    const fmt = (n: any) =>
      new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(Number(n)) + ' FCFA';

    // Détection d'intention
    let intent = 'DEFAULT';
    if (/prix|njeg|njëg|combien|ñaata|tarif/.test(q)) intent = 'PRICES';
    else if (/stock|dispo|reste|am na|jeex|es-tok/.test(q)) intent = 'STOCK';
    else if (/livr|yóbbu|adresse|quartier|repère|repere/.test(q)) intent = 'DELIVERY';
    else if (/bonjour|salaam|salut|nanga|dalal/.test(q)) intent = 'GREETING';
    else if (/creer|créer|publier|annonce|bindal/.test(q)) intent = 'DRAFT_PRODUCT';

    // Si la langue demandée ou détectée est le Wolof, utiliser le moteur NLG wolof naturel
    if (lang === 'WO') {
      return buildWolofResponse(intent, {
        shopName: shop.name,
        products: mappedProducts,
      });
    }

    // Réponse en Français
    switch (intent) {
      case 'PRICES': {
        if (products.length === 0) return `Donnée manquante : aucun produit publié pour ${shop.name}.`;
        const lines = products.slice(0, 5).map((p) => `- ${p.title} : ${fmt(p.price)}`).join('\n');
        return `Voici les prix chez ${shop.name} :\n${lines}`;
      }
      case 'STOCK': {
        if (products.length === 0) return 'Donnée manquante : catalogue vide.';
        const lines = products.slice(0, 5).map((p) => `- ${p.title} : ${p.stock > 0 ? `${p.stock} en stock` : 'en rupture'}`).join('\n');
        return `Disponibilités actuelles :\n${lines}`;
      }
      case 'DELIVERY': {
        return shop.publicAddress
          ? `${shop.name} livre à Thiès, Mboro et environs. Adresse de référence : ${shop.publicAddress}. Contact direct : ${shop.phone || shop.whatsapp || 'voir la boutique'}.`
          : 'Donnée manquante : adresse de livraison non renseignée par la boutique.';
      }
      case 'GREETING': {
        return `Salaamalekum ! Bienvenue chez ${shop.name}. Je suis votre assistant bilingue (Français / Wolof). Posez vos questions sur les prix, les stocks ou les livraisons.`;
      }
      case 'DRAFT_PRODUCT': {
        return `Je peux vous aider à rédiger votre annonce. Donnez-moi simplement le nom du produit, son prix en FCFA et la quantité disponible.`;
      }
      default: {
        if (products.length === 0) return `Donnée manquante : je n'ai pas cette information pour ${shop.name}.`;
        const lines = products.slice(0, 3).map((p) => `- ${p.title} (${fmt(p.price)})`).join('\n');
        return `Chez ${shop.name}, voici ce que je peux confirmer :\n${lines}\nPrécisez votre demande : prix, stock ou livraison ?`;
      }
    }
  }

  async getMessages(conversationId: string) {
    return this.prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Réponse publique aux visiteurs anonymes du widget IA.
   * Agrège les données des boutiques actives (prix, produits, livraison)
   * sans jamais révéler de données privées.
   */
  async publicAsk(question: string, lang: string): Promise<{ answer: string }> {
    const q = question.toLowerCase();

    // Charger jusqu'à 3 boutiques actives + quelques produits réels
    const shops = await this.prisma.shop.findMany({
      where: { status: 'ACTIVE' },
      take: 5,
      select: { id: true, name: true, publicAddress: true, phone: true, whatsapp: true, shortDescription: true },
    });
    const products = await this.prisma.product.findMany({
      where: { status: 'active', stock: { gt: 0 } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { title: true, price: true, shopId: true },
    });

    const shopById = new Map(shops.map((s) => [s.id, s]));
    const fmt = (n: any) =>
      new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(Number(n)) + ' FCFA';

    // Détection d'intention
    let intent = 'DEFAULT';
    if (/prix|njeg|njëg|combien|ñaata|tarif/.test(q)) intent = 'PRICES';
    else if (/stock|dispo|reste|es-tok/.test(q)) intent = 'STOCK';
    else if (/livraison|livrer|yóbbu|adresse|quartier|zone/.test(q)) intent = 'DELIVERY';
    else if (/boutique|shop|marché|mboro|thiès/.test(q)) intent = 'SHOPS';
    else if (/bonjour|salaam|salut|nanga/.test(q)) intent = 'GREETING';

    if (lang === 'WO') {
      switch (intent) {
        case 'PRICES':
          if (!products.length) return { answer: 'Amul jumtukaay ci butik yi léegi.' };
          return {
            answer:
              'Yii ñooy njëg yi ci butik yi :\n' +
              products.slice(0, 5).map((p) => `• *${p.title}* : ${fmt(p.price)} (ci ${shopById.get(p.shopId)?.name ?? 'boutique'})`).join('\n'),
          };
        case 'STOCK':
          if (!products.length) return { answer: 'Amul dara ci es-tok bi léegi.' };
          return { answer: 'Li am ci es-tok léegi :\n' + products.slice(0, 5).map((p) => `• ${p.title}`).join('\n') };
        case 'DELIVERY':
          return { answer: 'Ci wàllu yóbbu bi, butik yi mën na la yóbbal ci Thiès, Mboro ak li ko wër. Waxal sa repère (marse, jàkka...).' };
        case 'SHOPS':
          return { answer: 'Butik yi ci JëndCiThiès :\n' + shops.map((s) => `• *${s.name}* — ${s.publicAddress ?? 'Thiès'}`).join('\n') };
        default:
          return { answer: 'Salaamalekum ! Wax ma sa laaj ci njëg yi, es-tok bi walla yóbbu bi.' };
      }
    }

    switch (intent) {
      case 'PRICES': {
        if (!products.length) return { answer: "Je n'ai pas encore de prix à afficher. Les boutiques complètent leurs catalogues." };
        return {
          answer:
            `Voici une sélection de prix réels chez nos commerçants :\n` +
            products.slice(0, 5).map((p) => `• ${p.title} : ${fmt(p.price)} (${shopById.get(p.shopId)?.name ?? 'Boutique locale'})`).join('\n') +
            `\n\nVous pouvez commander en ligne ou directement via WhatsApp avec la boutique.`,
        };
      }
      case 'STOCK': {
        if (!products.length) return { answer: 'Aucun produit en stock pour le moment. Revenez très bientôt !' };
        return { answer: 'Produits actuellement disponibles :\n' + products.slice(0, 5).map((p) => `• ${p.title}`).join('\n') };
      }
      case 'DELIVERY': {
        const addresses = shops.map((s) => `${s.name} (${s.publicAddress ?? 'Mboro/Thiès'})`).slice(0, 3);
        return {
          answer:
            `Nous livrons à Mboro, Thiès et environs grâce à un système de repères locaux (pas besoin de numéro de rue).\n` +
            `Quelques boutiques disponibles : ${addresses.join(', ')}.\n\n` +
            `Les modes de paiement acceptés sont Wave, PayDunya et paiement à la livraison en espèces.`,
        };
      }
      case 'SHOPS': {
        if (!shops.length) return { answer: 'Aucune boutique active pour le moment.' };
        return {
          answer:
            `Nos boutiques partenaires vérifiées :\n` +
            shops.map((s) => `• ${s.name} — ${s.publicAddress ?? 'Thiès / Mboro'}${s.phone ? ` (${s.phone})` : ''}`).join('\n'),
        };
      }
      default:
        if (products.length > 0) {
          return {
            answer:
              `Bienvenue sur JëndCiThiès !\n` +
              `Quelques produits disponibles :\n` +
              products.slice(0, 3).map((p) => `• ${p.title} (${fmt(p.price)})`).join('\n') +
              `\n\nPosez-moi une question sur les prix, le stock, les boutiques ou la livraison.`,
          };
        }
        return {
          answer:
            'Salaamalekum ! Je suis votre assistant bilingue (Français / Wolof). Je peux vous renseigner sur les prix, le stock des produits, les boutiques partenaires et les zones de livraison.',
        };
    }
  }
}
