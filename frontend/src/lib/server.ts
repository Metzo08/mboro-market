import { resolveApiBase } from '@/lib/apiBase';

export const API_URL = resolveApiBase();

interface FetchOptions {
  revalidate?: number;
  timeoutMs?: number;
}

/**
 * Lecture serveur tolérante aux pannes : l'API indisponible ne doit jamais
 * produire une page blanche (cf. §15.3). Les pages affichent un état vide explicite.
 */
export async function fetchJson<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
  const { revalidate = 60, timeoutMs = 6000 } = options;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
