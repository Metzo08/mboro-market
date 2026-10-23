const BACKEND_ORIGIN = 'http://localhost:3000';
const FALLBACK = `${BACKEND_ORIGIN}/api`;

/**
 * Résout l'URL de l'API quel que soit le contenu de NEXT_PUBLIC_API_URL.
 *
 * Cas fréquents qui provoquaient un 404 :
 *  - `NEXT_PUBLIC_API_URL=/api` → les appels partaient vers Next (port 3001)
 *    au lieu du backend NestJS (port 3000).
 *  - `NEXT_PUBLIC_API_URL=http://localhost:3000` (sans `/api`) → `/shops` au lieu de `/api/shops`.
 */
export function resolveApiBase(raw: string | undefined = process.env.NEXT_PUBLIC_API_URL): string {
  const value = (raw ?? '').trim();

  if (!value) return FALLBACK;

  if (/^https?:\/\//i.test(value)) {
    const trimmed = value.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  if (value.startsWith('/')) {
    // Côté navigateur, l'URL relative passe par le rewrite Next (next.config.ts).
    if (typeof window !== 'undefined') return value;
    // Côté serveur (SSR), on cible directement le backend.
    return `${BACKEND_ORIGIN}${value.replace(/\/+$/, '')}`;
  }

  return FALLBACK;
}

/** Origine du backend pour le proxy Next.js (rewrites). */
export function resolveBackendOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
  const proxyTarget = (process.env.API_PROXY_TARGET ?? '').trim();
  if (proxyTarget) return proxyTarget.replace(/\/+$/, '');
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  return BACKEND_ORIGIN;
}
