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

      <div className="bg-white rounded-2xl border border-[#E2D6C4] p-5 mb-8 shadow-xs">
        <form method="get" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#2B2420] mb-1">Mot-clé (FR ou Wolof)</label>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Ex: ceeb, mangue, soble..."
              className="w-full rounded-xl border border-[#E2D6C4] px-4 py-2.5 text-sm text-[#2B2420] focus:outline-none focus:ring-2 focus:ring-[#E8632C] transition-colors"
              aria-label="Rechercher un produit"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2B2420] mb-1">Catégorie</label>
            <select
              name="category"
              defaultValue={category}
              className="w-full rounded-xl border border-[#E2D6C4] px-4 py-2.5 text-sm text-[#2B2420] focus:outline-none focus:ring-2 focus:ring-[#E8632C] transition-colors bg-white"
            >
              <option value="ALL">Toutes catégories</option>
              <option value="epicerie">Épicerie</option>
              <option value="legumes">Légumes</option>
              <option value="fruits">Fruits</option>
              <option value="viandes">Viandes & Boucherie</option>
              <option value="cuisine">Plats & Restaurants</option>
              <option value="tissus">Bazin, Wax & Tissus</option>
              <option value="telephonie">Téléphonie & Électronique</option>
              <option value="materiaux">Matériaux de construction</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2B2420] mb-1">Disponibilité</label>
            <select
              name="availability"
              defaultValue={availability}
              className="w-full rounded-xl border border-[#E2D6C4] px-4 py-2.5 text-sm text-[#2B2420] focus:outline-none focus:ring-2 focus:ring-[#E8632C] transition-colors bg-white"
            >
              <option value="all">Tous les produits</option>
              <option value="in_stock">En stock uniquement</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full jt-btn-primary py-2.5 px-4 text-sm font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <span>Appliquer les filtres</span>
            </button>
          </div>
        </form>

        {/* Puces Wolof rapides */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-xs text-[#6B625A]">
          <span className="font-bold text-[#E8632C]">Filtres rapides Wolof :</span>
          {[
            { label: 'ceeb (riz)', q: 'ceeb' },
            { label: 'yapp (viande)', q: 'yapp' },
            { label: 'soble (oignon)', q: 'soble' },
            { label: 'kaani (piment)', q: 'kaani' },
            { label: 'dibi (grillade)', q: 'dibi' },
            { label: 'bazin', q: 'bazin' },
          ].map((chip) => (
            <Link
              key={chip.q}
              href={`/products?q=${chip.q}`}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                query === chip.q
                  ? 'bg-[#E8632C] text-white border-[#E8632C]'
                  : 'bg-[#F5EDE1] text-[#2B2420] border-[#E2D6C4] hover:bg-[#FBECE4]'
              }`}
            >
              {chip.label}
            </Link>
          ))}
        </div>
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
