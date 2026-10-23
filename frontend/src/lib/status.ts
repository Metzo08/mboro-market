import type { BadgeTone } from '@/components/ui/Badge';

export interface StatusMeta {
  label: string;
  tone: BadgeTone;
  step: number;
}

export const ORDER_STATUSES: Record<string, StatusMeta> = {
  PENDING: { label: 'Reçue', tone: 'gold', step: 1 },
  CONFIRMED: { label: 'Acceptée', tone: 'teal', step: 2 },
  PREPARING: { label: 'En préparation', tone: 'terracotta', step: 3 },
  READY: { label: 'Prête', tone: 'teal', step: 4 },
  SHIPPED: { label: 'En livraison', tone: 'teal', step: 4 },
  DELIVERED: { label: 'Livrée', tone: 'success', step: 5 },
  COMPLETED: { label: 'Terminée', tone: 'success', step: 6 },
  CANCELLED: { label: 'Annulée', tone: 'danger', step: 0 },
  REFUNDED: { label: 'Remboursée', tone: 'neutral', step: 0 },
};

export const PAYMENT_STATUSES: Record<string, { label: string; tone: BadgeTone }> = {
  CREATED: { label: 'Paiement à effectuer', tone: 'gold' },
  PENDING: { label: 'Paiement en attente', tone: 'gold' },
  SUCCEEDED: { label: 'Payée', tone: 'success' },
  FAILED: { label: 'Paiement échoué', tone: 'danger' },
  CANCELLED: { label: 'Paiement annulé', tone: 'neutral' },
  EXPIRED: { label: 'Paiement expiré', tone: 'danger' },
  PARTIALLY_REFUNDED: { label: 'Partiellement remboursée', tone: 'gold' },
  REFUNDED: { label: 'Remboursée', tone: 'neutral' },
  UNDER_REVIEW: { label: 'En vérification', tone: 'gold' },
};

export function orderStatusMeta(status?: string): StatusMeta {
  return ORDER_STATUSES[status ?? ''] ?? { label: status ?? 'Inconnu', tone: 'neutral', step: 0 };
}

export function paymentStatusMeta(status?: string) {
  return PAYMENT_STATUSES[status ?? ''] ?? { label: status ?? 'Inconnu', tone: 'neutral' as BadgeTone };
}

export const DELIVERY_STEPS = ['Reçue', 'Acceptée', 'Préparation', 'Prête', 'Livrée'];
