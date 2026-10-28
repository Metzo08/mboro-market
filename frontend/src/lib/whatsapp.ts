import { CartItem } from '@/types';
import { formatPrice } from '@/lib/utils';

export interface SenegalAddress {
  commune: string;
  quarter: string;
  landmark: string;
  recipientName?: string;
  phone: string;
  instructions?: string;
}

/**
 * Formatage d'un message WhatsApp de commande prêt à l'envoi pour un commerçant local.
 * Respecte le dialecte d'usage (Français / Wolof) et la clarté financière.
 */
export function buildWhatsAppOrderMessage(params: {
  shopName: string;
  items: CartItem[];
  total: number;
  deliveryMethod: 'delivery' | 'pickup';
  address?: SenegalAddress;
  customerName?: string;
  customerPhone?: string;
  orderNumber?: string;
}): string {
  const {
    shopName,
    items,
    total,
    deliveryMethod,
    address,
    customerName,
    customerPhone,
    orderNumber,
  } = params;

  const lines: string[] = [];

  lines.push(`Salam aleikoum *${shopName}* !`);
  lines.push(`Je souhaite passer une commande via *JëndCiThiès* :`);
  if (orderNumber) {
    lines.push(`📄 Réf. commande : *${orderNumber}*`);
  }
  lines.push('');
  lines.push('*Détail des articles :*');

  for (const it of items) {
    const unitPrice = Number(it.product.price);
    const lineTotal = unitPrice * it.quantity;
    lines.push(`• *${it.quantity}x* ${it.product.title} — ${formatPrice(lineTotal)}`);
  }

  lines.push('');
  lines.push(`💰 *Total : ${formatPrice(total)}*`);
  lines.push('');

  if (deliveryMethod === 'pickup') {
    lines.push('🏪 *Mode : Retrait en boutique*');
  } else {
    lines.push('🛵 *Mode : Livraison à domicile*');
    if (address) {
      lines.push(`📍 Localité : *${address.commune}* — Quartier : *${address.quarter}*`);
      if (address.landmark) {
        lines.push(`🧭 Repère : _${address.landmark}_`);
      }
      if (address.instructions) {
        lines.push(`📝 Précisions : _${address.instructions}_`);
      }
    }
  }

  const phone = customerPhone || address?.phone;
  const name = customerName || address?.recipientName;
  if (name || phone) {
    lines.push('');
    lines.push(`👤 Client : ${name || 'Client JëndCiThiès'}${phone ? ` (${phone})` : ''}`);
  }

  lines.push('');
  lines.push('_Merci de me confirmer la disponibilité et le délai. Diarama !_');

  return lines.join('\n');
}

/**
 * Génère le lien wa.me complet
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  // Nettoyer le numéro : garder uniquement les chiffres, préfixer 221 si nécessaire
  let clean = phone.replace(/\D/g, '');
  if (clean.length === 9) {
    clean = '221' + clean;
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
