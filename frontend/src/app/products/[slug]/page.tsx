import { notFound } from 'next/navigation';
import { Product, Shop } from '@/types';
import { getProductBySlug, getShopById } from '@/lib/server-api';
import { ProductDetail } from '@/components/products/ProductDetail';
import { productJsonLd, JsonLdScript } from '@/lib/seo';

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

  // Données structurées Product+Offer : vendeur réel uniquement (CDC §11.2, §10)
  let shop: Shop | null = null;
  try {
    const shopData = await getShopById(product.shopId);
    shop = (shopData.items?.[0] || shopData) ?? null;
  } catch {
    shop = null;
  }
  const jsonLd = productJsonLd(product, shop ?? undefined);

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <ProductDetail product={product} />
    </>
  );
}
