import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { shopImage } from '@/lib/images';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function getShop(slug: string) {
  try {
    const res = await fetch(`${API_URL}/shops?limit=100`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    const items = data.items || [];
    return items.find((s: any) => s.slug === slug) || null;
  } catch {
    return null;
  }
}

export const dynamic = 'force-dynamic';

export default async function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await getShop(slug);
  if (!shop) return notFound();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: shop.name,
            description: shop.shortDescription || shop.description || '',
            url: `http://localhost:3001/shops/${shop.slug}`,
            telephone: shop.phone || '',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Mboro',
              addressRegion: 'Thiès',
              addressCountry: 'SN',
            },
          }),
        }}
      />
      <Link href="/shops" className="text-sm text-green-700 hover:underline">
        ← Toutes les boutiques
      </Link>
      <div className="mt-4 h-56 relative overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={shopImage(shop)}
          alt={shop.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
        <div className="absolute bottom-0 p-6">
          <h1 className="text-3xl font-bold text-white">{shop.name}</h1>
          <p className="text-gray-100 mt-1 line-clamp-2">
            {shop.shortDescription || shop.description}
          </p>
        </div>
      </div>
      <p className="text-gray-600 mt-4">{shop.shortDescription || shop.description}</p>
      <p className="text-2xl font-bold text-green-700 mt-4">{shop.publicAddress || ''}</p>
      <div className="mt-6">
        <Link
          href={`/products?shopId=${shop.id}`}
          className="px-6 py-3 bg-green-700 text-white rounded-lg font-medium"
        >
          Voir les produits
        </Link>
      </div>
    </div>
  );
}
