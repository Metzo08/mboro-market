import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'http://localhost:3001';

  const staticRoutes = [
    '',
    '/products',
    '/shops',
    '/login',
    '/register',
    '/verify-otp',
    '/cart',
    '/checkout',
    '/orders',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  let products: Array<{ url: string; lastModified: Date; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; priority: number }> = [];
  let shops: Array<{ url: string; lastModified: Date; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; priority: number }> = [];

  try {
    const productsRes = await fetch(`${API_URL}/products?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (productsRes.ok) {
      const data = await productsRes.json();
      products = (data.items || []).map((p: any) => ({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch {}

  try {
    const shopsRes = await fetch(`${API_URL}/shops?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (shopsRes.ok) {
      const data = await shopsRes.json();
      shops = (data.items || []).map((s: any) => ({
        url: `${baseUrl}/shops/${s.slug}`,
        lastModified: new Date(s.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch {}

  return [...staticRoutes, ...products, ...shops];
}
