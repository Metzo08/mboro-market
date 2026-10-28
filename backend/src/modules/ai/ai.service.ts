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
}
