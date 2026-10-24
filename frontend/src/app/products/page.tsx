import { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ProductsPageProps {
  searchParams: Promise<{ shopId?: string; categoryId?: string; page?: string; limit?: string; q?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const sp = new URLSearchParams();
  if (params.shopId) sp.set('shopId', params.shopId);
  if (params.categoryId) sp.set('categoryId', params.categoryId);
  if (params.q) sp.set('q', params.q);
  sp.set('page', params.page || '1');
  sp.set('limit', params.limit || '12');

  let products: Product[] = [];
  let total = 0;
  try {
    const res = await fetch(`${API_URL}/products?${sp}`, { next: { revalidate: 30 } });
    if (res.ok) {
      const data = await res.json();
      products = data.items || [];
      total = data.total || 0;
    }
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {params.q ? `Résultats pour « ${params.q} »` : 'Nos produits'}
        </h1>
        <p className="text-gray-600">{total} produit(s) disponible(s)</p>
      </div>
      <form action="/products" method="get" className="flex gap-2 mb-6 max-w-xl">
        <input
          name="q"
          defaultValue={params.q || ''}
          placeholder="Rechercher un produit…"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <button type="submit" className="px-5 py-2 bg-green-700 text-white rounded-lg font-medium">
          Chercher
        </button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun produit trouvé. Essayez un autre mot-clé.
          </div>
        )}
      </div>
    </div>
  );
}
