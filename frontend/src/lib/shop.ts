import type { OpeningHours, Shop } from '@/types';

const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

export interface OpenState {
  state: 'open' | 'closed' | 'unknown';
  label: string;
  detail?: string;
}

function toMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value?.trim() ?? '');
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function rangesForDay(hours: OpeningHours, dayKey: string): Array<{ open: string; close: string }> {
  const raw =
    hours?.[dayKey] ??
    hours?.[dayKey.slice(0, 3)] ??
    (hours as Record<string, unknown>)?.[String(DAY_KEYS.indexOf(dayKey as any))];
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap((entry) =>
      Array.isArray(entry)
        ? [{ open: String(entry[0]), close: String(entry[1]) }]
        : entry && typeof entry === 'object' && 'open' in entry
          ? [entry as { open: string; close: string }]
          : [],
    );
  }
  if (typeof raw === 'object' && 'closed' in raw && (raw as any).closed) return [];
  if (typeof raw === 'object' && 'open' in raw && 'close' in raw) {
    return [raw as { open: string; close: string }];
  }
  return [];
}

/**
 * Statut ouvert/fermé calculé à partir des horaires réellement saisis.
 * Si aucun horaire n'est renseigné, on affiche « Horaires non renseignés »
 * plutôt qu'un faux « Ouvert » (§SHOP-002).
 */
export function getOpenState(hours?: OpeningHours | null, now: Date = new Date()): OpenState {
  if (!hours || Object.keys(hours).length === 0) {
    return { state: 'unknown', label: 'Horaires non renseignés' };
  }

  const dayKey = DAY_KEYS[now.getDay()];
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const ranges = rangesForDay(hours, dayKey);

  for (const range of ranges) {
    const open = toMinutes(range.open);
    const close = toMinutes(range.close);
    if (open === null || close === null) continue;
    const effectiveClose = close === 0 ? 24 * 60 : close;
    const isOvernight = effectiveClose < open;
    const isOpenNow = isOvernight
      ? minutesNow >= open || minutesNow < effectiveClose
      : minutesNow >= open && minutesNow < effectiveClose;
    if (isOpenNow) {
      return { state: 'open', label: 'Ouvert maintenant', detail: `Ferme à ${range.close}` };
    }
  }

  return { state: 'closed', label: 'Fermé', detail: 'Voir les horaires' };
}

export const SHOP_TYPE_LABELS: Record<string, string> = {
  RETAIL: 'Commerce',
  RESTAURANT: 'Restauration',
  SERVICE: 'Services',
  ARTISAN: 'Artisanat',
};

export function shopTypeLabel(type?: string): string {
  return SHOP_TYPE_LABELS[type ?? ''] ?? 'Commerce local';
}

export function shopInitial(name: string): string {
  return name?.trim()?.charAt(0)?.toUpperCase() || 'B';
}

export function shopLocality(shop: Pick<Shop, 'publicAddress'>): string {
  if (!shop.publicAddress) return 'Localisation non précisée';
  const parts = shop.publicAddress.split(',').map((part) => part.trim());
  return parts.length > 1 ? parts[parts.length - 2] ?? parts[0] : parts[0];
}

const SCHEMA_DAYS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

/** Horaires structurés pour Schema.org (opens/closes), jamais inventés. */
export function structuredOpeningHours(
  hours?: OpeningHours | null,
): Array<{ dayOfWeek: string; opens: string; closes: string }> {
  if (!hours) return [];
  return Object.entries(SCHEMA_DAYS).flatMap(([key, schemaDay]) =>
    rangesForDay(hours, key).map((range) => ({
      dayOfWeek: `https://schema.org/${schemaDay}`,
      opens: range.open,
      closes: range.close,
    })),
  );
}

export function formatOpeningHours(hours?: OpeningHours | null): Array<{ day: string; text: string }> {
  if (!hours) return [];
  const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return order
    .map((dayKey) => {
      const ranges = rangesForDay(hours, dayKey);
      return {
        day: DAY_LABELS[dayKey],
        text: ranges.length ? ranges.map((r) => `${r.open} – ${r.close}`).join(', ') : 'Fermé',
      };
    })
    .filter((entry) => entry.text !== 'Fermé' || Object.keys(hours).length > 0);
}

/** Moyens de paiement affichés : issus de la boutique, jamais inventés. */
export function paymentLabels(settings?: Record<string, unknown>): string[] {
  const methods = (settings?.paymentMethods as string[]) ?? [];
  const labels: Record<string, string> = {
    cash: 'Espèces',
    wave: 'Wave',
    orange_money: 'Orange Money',
    card: 'Carte bancaire',
  };
  return methods.map((method) => labels[method] ?? method);
}
