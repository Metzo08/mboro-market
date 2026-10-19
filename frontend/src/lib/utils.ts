import { type ClassValue, clsx as clsxFn } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsxFn(inputs));
}

export function formatPrice(amount: unknown, currency = 'XOF'): string {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-SN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}
