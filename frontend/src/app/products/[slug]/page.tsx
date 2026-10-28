import { notFound } from 'next/navigation';
import { Product } from '@/types';
import { getProductBySlug } from '@/lib/server-api';
import { ProductDetail } from '@/components/products/ProductDetail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const data = await getProductBySlug(slug);
    const product: Product = data.items?.[0] || data;
    if (!product) return { title: 'Produit introuvable' };
    return {
      title: `${product.title} — JëndCiThiès`,
      description: product.shortDescription || product.description || 'Produit local sur JëndCiThiès',
    };
  } catch {
    return { title: 'Produit introuvable' };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product: Product | null = null;

  try {
    const data = await getProductBySlug(slug);
    product = data.items?.[0] || data;
  } catch {
    product = null;
  }

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
