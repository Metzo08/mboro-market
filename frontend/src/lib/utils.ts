import { type ClassValue, clsx as clsxFn } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsxFn(inputs));
}

/** Montants FCFA sans sous-unité, format local « 2 500 FCFA ». */
export function formatPrice(amount: unknown, currency = 'XOF'): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '—';
  const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
  return currency === 'XOF' ? `${formatted} FCFA` : `${formatted} ${currency}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/** Identifiant d'idempotence pour éviter les doubles commandes (ORD-006). */
export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
