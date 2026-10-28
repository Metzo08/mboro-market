import { type ClassValue, clsx as clsxFn } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsxFn(inputs));
}

export function formatPrice(amount: unknown): string {
  const n = Math.round(Number(amount) || 0);
  const formatted = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-SN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}
