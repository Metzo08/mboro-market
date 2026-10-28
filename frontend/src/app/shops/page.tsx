import Link from 'next/link';
import Image from 'next/image';
import { Shop } from '@/types';
import { shopImage } from '@/lib/images';
import { Badge } from '@/components/ui/Badge';
import { getShops } from '@/lib/server-api';

export const metadata = {
  title: 'Boutiques — JëndCiThiès',
  description: 'Découvrez les commerçants de Mboro et Thiès',
};

export default async function ShopsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  // Next.js 16 : searchParams est une Promise, à awaiter
  const sp = (await searchParams) || {};
  const q = sp.q || '';
  const category = sp.category || 'ALL';
  const status = sp.status || 'ALL';

  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (category !== 'ALL') params.category = category;
  if (status !== 'ALL') params.status = status;

  let shops: Shop[] = [];
  let total = 0;

  try {
    const data = await getShops(params);
    shops = data.items || data || [];
    total = data.total || 0;
  } catch {
    shops = [];
    total = 0;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nos boutiques</h1>
        <p className="text-gray-600">Découvrez les commerçants de Mboro et Thiès</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2D6C4] p-5 mb-8 shadow-xs">
        <form method="get" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#2B2420] mb-1">Nom ou mot-clé</label>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Ex: Baobab, Bazin, Marché..."
              className="w-full rounded-xl border border-[#E2D6C4] px-4 py-2.5 text-sm text-[#2B2420] focus:outline-none focus:ring-2 focus:ring-[#E8632C] transition-colors"
              aria-label="Rechercher des boutiques"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2B2420] mb-1">Type d'activité</label>
            <select
              name="category"
              defaultValue={category}
              className="w-full rounded-xl border border-[#E2D6C4] px-4 py-2.5 text-sm text-[#2B2420] focus:outline-none focus:ring-2 focus:ring-[#E8632C] transition-colors bg-white"
            >
              <option value="ALL">Tous les types</option>
              <option value="restaurant">Restaurant & Fast-Food</option>
              <option value="artisanat">Artisans & Couture</option>
              <option value="alimentaire">Épicerie & Alimentation</option>
              <option value="beauté">Coiffure & Beauté</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2B2420] mb-1">Statut</label>
            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-xl border border-[#E2D6C4] px-4 py-2.5 text-sm text-[#2B2420] focus:outline-none focus:ring-2 focus:ring-[#E8632C] transition-colors bg-white"
            >
              <option value="ALL">Tout statut</option>
              <option value="ACTIVE">Ouvert maintenant</option>
              <option value="INACTIVE">Fermé</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full jt-btn-primary py-2.5 px-4 text-sm font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <span>Filtrer les boutiques</span>
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.length > 0 ? (
          shops.map((shop) => (
            <div key={shop.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Store',
                    name: shop.name,
                    description: shop.shortDescription || '',
                    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/shops/${shop.slug}`,
                    address: {
                      '@type': 'PostalAddress',
                      addressLocality: 'Mboro',
                      addressRegion: 'Thiès',
                      addressCountry: 'SN',
                    },
                    telephone: shop.phone || '',
                  }),
                }}
              />
              <div className="h-48 relative overflow-hidden bg-gray-100">
                <Image
                  src={shopImage(shop)}
                  alt={shop.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <Link href={`/shops/${shop.slug}`} className="block">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                    {shop.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{shop.shortDescription || 'Commerçant local à Thiès'}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <span className={`w-1 h-1 rounded-full ${shop.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {shop.status === 'ACTIVE' ? 'Ouvert' : 'Fermé'}
                    </span>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Link href={`/shops/${shop.slug}`} className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg text-center hover:bg-green-700">
                    Voir la boutique
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucune boutique pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
