import { Product } from '@/types';

// Photos réelles stables (Unsplash) par mot-clé — CDC §2 : visuel = confiance
const PHOTOS: Array<[RegExp, string]> = [
  [/mangue/i, 'https://images.unsplash.com/photo-1553273785-2b6a7a5e1e2e?w=600&q=80'],
  [/riz/i, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80'],
  [/huile|arachide/i, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80'],
  [/bissap|jus|boisson/i, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80'],
  [/thieboudienne|plat|restaurant|yassa|poisson/i, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80'],
  [/bazin|tissu|couture|broderie|artisan/i, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80'],
  [/legume|panier|tomate|oignon/i, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80'],
  [/fruit/i, 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80'],
];
const FALLBACK = 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80';

export function productImage(p: Product): string {
  // Les médias sont stockés via MediaAsset (media[].path)
  const fromMedia = (p as any)?.media?.find?.((m: any) => m?.type === 'image' || !m?.type)?.path
    ?? (p as any)?.media?.[0]?.path;
  const fromDb = fromMedia || (p as any).image || (p as any).images?.[0];
  if (fromDb && /^https?:\/\//.test(fromDb)) return fromDb;
  const hay = `${p.title} ${p.shortDescription || ''} ${p.slug}`;
  for (const [re, url] of PHOTOS) {
    if (re.test(hay)) return url;
  }
  return FALLBACK;
}

const SHOP_FALLBACK = 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80';

export function shopImage(s: any): string {
  const assets = s?.mediaAssets ?? s?.media;
  const fromMedia = assets?.find?.((m: any) => m?.type === 'image' || !m?.type)?.path
    ?? assets?.[0]?.path;
  const fromDb = fromMedia || s?.coverImage || s?.logo || s?.image;
  if (fromDb && /^https?:\/\//.test(fromDb)) return fromDb;
  return SHOP_FALLBACK;
}