const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export async function serverFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 60 },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function getProducts(params?: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch(`/products${qs ? `?${qs}` : ''}`);
}

export async function getShops(params?: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch(`/shops${qs ? `?${qs}` : ''}`);
}

export async function getProductBySlug(slug: string) {
  return serverFetch(`/products?slug=${encodeURIComponent(slug)}`);
}

export async function getShopBySlug(slug: string) {
  return serverFetch(`/shops?slug=${encodeURIComponent(slug)}`);
}
