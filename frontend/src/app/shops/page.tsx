import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Shop } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function getShops(): Promise<Shop[]> {
  try {
    const res = await fetch(`${API_URL}/shops`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || data || [];
  } catch {
    return [];
  }
}

export default async function ShopsPage() {
  const shops: Shop[] = await getShops();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nos boutiques</h1>
        <p className="text-gray-600">Découvrez les commerçants de Mboro et Thiès</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.length > 0 ? (
          shops.map((shop) => (
            <div key={shop.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">{shop.name}</span>
              </div>
              <div className="p-4">
                <Link href={`/shops/${shop.slug}`} className="block">
                  <h3 className="font-semibold text-gray-900 mb-1">{shop.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{shop.shortDescription || 'Commerçant local à Thiès'}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full {shop.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}"></span>
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
