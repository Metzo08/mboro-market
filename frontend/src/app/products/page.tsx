import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ProductsPageProps {
  searchParams: { shopId?: string; categoryId?: string; page?: string; limit?: string };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const searchParamsUrl = new URLSearchParams();
  if (searchParams.shopId) searchParamsUrl.set('shopId', searchParams.shopId);
  if (searchParams.categoryId) searchParamsUrl.set('categoryId', searchParams.categoryId);
  if (searchParams.page) searchParamsUrl.set('page', searchParams.page);
  if (searchParams.limit) searchParamsUrl.set('limit', searchParams.limit);

  const res = await fetch(`${API_URL}/products?${searchParamsUrl}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Nos produits</h1>
      <p className="text-gray-500">Erreur lors du chargement des produits.</p>
    </div>
  );
  const data = await res.json();
  const products: Product[] = data.items || [];
  const total: number = data.total || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nos produits</h1>
        <p className="text-gray-600">{total} produits disponibles</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">{product.shortDescription || 'Produit'}</span>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <Link href={`/products/${product.slug}`} className="block mb-2">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                  <p className="text-green-600 font-bold">{formatPrice(Number(product.price))}</p>
                </Link>
                <AddToCartButton product={product} />
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
