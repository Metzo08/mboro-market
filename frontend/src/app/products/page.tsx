import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: { shopId?: string; categoryId?: string; page?: string; limit?: string };
}

export async function getProductsServer(params: ProductsPageProps['searchParams']) {
  const searchParams = new URLSearchParams();
  if (params.shopId) searchParams.set('shopId', params.shopId);
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.page) searchParams.set('page', params.page);
  if (params.limit) searchParams.set('limit', params.limit);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/products?${searchParams}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return { items: [], total: 0 };
  return res.json();
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const data = getProductsServer(searchParams);
  const products: Product[] = (data as any)?.items || [];
  const total: number = (data as any)?.total || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nos produits</h1>
        <p className="text-gray-600">{total} produits disponibles</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">{product.shortDescription || 'Produit'}</span>
              </div>
              <div className="p-4">
                <Link href={`/products/${product.slug}`} className="block">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                  <p className="text-green-600 font-bold">{formatPrice(product.price)}</p>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun produit trouvé.
          </div>
        )}
      </div>
    </div>
  );
}
