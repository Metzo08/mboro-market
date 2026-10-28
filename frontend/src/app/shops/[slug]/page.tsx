import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Shop } from '@/types';
import { formatPrice } from '@/lib/utils';
import { productImage, shopImage } from '@/lib/images';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { getShopBySlug, getProducts } from '@/lib/server-api';
import { ShopTabs } from '@/components/shops/ShopTabs';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const data = await getShopBySlug(slug);
    const shop: Shop = data.items?.[0] || data;
    if (!shop) return { title: 'Boutique introuvable' };
    return {
      title: `${shop.name} — JëndCiThiès`,
      description: shop.shortDescription || shop.description || 'Boutique locale sur JëndCiThiès',
    };
  } catch {
    return { title: 'Boutique introuvable' };
  }
}

export default async function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let shop: Shop | null = null;
  let products: any[] = [];

  try {
    const shopData = await getShopBySlug(slug);
    shop = shopData.items?.[0] || shopData || null;

    if (shop) {
      const productsData = await getProducts({ shopId: shop.id, limit: '20' });
      products = productsData.items || productsData || [];
    }
  } catch {
    shop = null;
    products = [];
  }

  if (!shop) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ShopTabs shop={shop} products={products} />
    </div>
  );
}
