import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConversationDto, SendMessageDto } from './dto';

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
    const fmt = (n: any) =>
      new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(Number(n)) + ' FCFA';

    let fr: string;
    if (/prix|njeg|combien|ñett|tarif/.test(q)) {
      if (products.length === 0) fr = `Donnée manquante : aucun produit publié pour ${shop.name}.`;
      else {
        const lines = products.slice(0, 5).map((p) => `- ${p.title} : ${fmt(p.price)}`).join('\n');
        fr = `Voici les prix chez ${shop.name} :\n${lines}`;
      }
    } else if (/stock|dispo|reste|am/.test(q)) {
      if (products.length === 0) fr = 'Donnée manquante : catalogue vide.';
      else {
        const lines = products.slice(0, 5).map((p) => `- ${p.title} : ${p.stock} en stock`).join('\n');
        fr = `Disponibilités :\n${lines}`;
      }
    } else if (/livr|yóbbu|adresse|quartier/.test(q)) {
      fr = shop.publicAddress
        ? `${shop.name} : ${shop.publicAddress}. Contact : ${shop.phone || 'voir la boutique'}.`
        : 'Donnée manquante : adresse de livraison non renseignée par la boutique.';
    } else if (/horaire|ouvert|heure|oubi/.test(q)) {
      const h = (shop.openingHours as any)?.lundi || (shop.openingHours as any)?.monday;
      fr = h ? `Horaires : ${JSON.stringify(shop.openingHours)}.` : 'Donnée manquante : horaires non renseignés.';
    } else if (/bonjour|salaam|salut|nanga/.test(q)) {
      fr = `Salaamalekum ! Bienvenue chez ${shop.name}. Posez votre question sur nos prix, le stock ou la livraison.`;
    } else {
      if (products.length === 0) fr = `Donnée manquante : je n'ai pas cette information pour ${shop.name}.`;
      else {
        const lines = products.slice(0, 3).map((p) => `- ${p.title} (${fmt(p.price)})`).join('\n');
        fr = `Chez ${shop.name}, voici ce que je peux confirmer :\n${lines}\nPrécisez : prix, stock ou livraison ?`;
      }
    }
    if (lang === 'WO') return toWolof(fr);
    return fr;
  }

  async getMessages(conversationId: string) {
    return this.prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
