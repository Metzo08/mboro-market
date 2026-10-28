import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { getProducts } from '@/lib/server-api';

export const metadata = {
  title: 'Produits — JëndCiThiès',
  description: 'Tous les produits frais, artisans et services de Mboro et Thiès',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; availability?: string }>;
}) {
  // Next.js 16 : searchParams est une Promise, à awaiter
  const sp = (await searchParams) || {};
  const query = sp.q || '';
  const category = sp.category || 'ALL';
  const availability = sp.availability || 'all';

  const params: Record<string, string> = {};
  if (query) params.q = query;
  if (category !== 'ALL') params.category = category;
  if (availability !== 'all') params.availability = availability;

  let products: Product[] = [];
  let total = 0;

  try {
    const data = await getProducts(params);
    products = data.items || data || [];
    total = data.total || 0;
  } catch {
    products = [];
    total = 0;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {query ? `Résultats pour « ${query} »` : 'Nos produits'}
        </h1>
        <p className="text-gray-600">{total} produit(s) disponible(s)</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
        <form method="get" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="sr-only">Recherche</label>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Rechercher un produit…"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-gray-100"
              aria-label="Rechercher un produit"
            />
          </div>
          <div>
            <select
              name="category"
              defaultValue={category}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
            >
              <option value="ALL">Toutes catégories</option>
              <option value="mangue">Mangues</option>
              <option value="riz">Riz & Céréales</option>
              <option value="légume">Légumes</option>
              <option value="fruit">Fruits</option>
              <option value="artisanat">Artisanat</option>
              <option value="restaurant">Restaurant</option>
            </select>
          </div>
          <div>
            <select
              name="availability"
              defaultValue={availability}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
            >
              <option value="all">Tout disponible</option>
              <option value="in_stock">En stock</option>
              <option value="out_of_stock">Épuisé</option>
            </select>
          </div>
        </form>
      </div>

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
