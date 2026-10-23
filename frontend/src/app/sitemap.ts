import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchAll<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? data ?? [];
  } catch {
    return [];
  }
}

/**
 * Sitemap segmenté : uniquement les pages publiques indexables.
 * Les pages privées (panier, checkout, commandes, espace commerçant) en sont exclues.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, shops] = await Promise.all([
    fetchAll<{ slug: string; updatedAt: string }>('/products?limit=60'),
    fetchAll<{ slug: string; updatedAt: string }>('/shops?limit=60'),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/shops`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/legal/cgu`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/legal/confidentialite`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  return [
    ...staticRoutes,
    ...shops.map((shop) => ({
      url: `${BASE_URL}/shops/${shop.slug}`,
      lastModified: shop.updatedAt ? new Date(shop.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
